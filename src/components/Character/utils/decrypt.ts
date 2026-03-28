import CryptoJS from "crypto-js";

const getSubtleCrypto = (): SubtleCrypto | undefined => {
  return globalThis.crypto?.subtle;
};

const uint8ArrayToWordArray = (arr: Uint8Array): CryptoJS.lib.WordArray => {
  const words: number[] = [];
  for (let i = 0; i < arr.length; i += 1) {
    words[i >>> 2] |= arr[i] << (24 - (i % 4) * 8);
  }
  return CryptoJS.lib.WordArray.create(words, arr.length);
};

const wordArrayToArrayBuffer = (wordArray: CryptoJS.lib.WordArray): ArrayBuffer => {
  const { words, sigBytes } = wordArray;
  const u8 = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i += 1) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return u8.buffer;
};

async function generateAESKey(password: string): Promise<CryptoKey> {
  const subtle = getSubtleCrypto();
  if (!subtle) {
    throw new Error("Web Crypto API unavailable.");
  }
  const passwordBuffer = new TextEncoder().encode(password);
  const hashedPassword = await subtle.digest("SHA-256", passwordBuffer);
  return subtle.importKey(
    "raw",
    hashedPassword.slice(0, 32),
    { name: "AES-CBC" },
    false,
    ["encrypt", "decrypt"]
  );
}

const tryDecryptWithSubtle = async (
  iv: Uint8Array,
  data: ArrayBuffer,
  password: string
): Promise<ArrayBuffer> => {
  const subtle = getSubtleCrypto();
  if (!subtle) {
    throw new Error("Web Crypto API unavailable.");
  }
  const key = await generateAESKey(password);
  const normalizedIv = new Uint8Array(iv.byteLength);
  normalizedIv.set(iv);
  return subtle.decrypt({ name: "AES-CBC", iv: normalizedIv }, key, data);
};

const tryDecryptWithCryptoJs = (
  iv: Uint8Array,
  data: ArrayBuffer,
  password: string
): ArrayBuffer => {
  const key = CryptoJS.SHA256(password);
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: uint8ArrayToWordArray(new Uint8Array(data)),
  });
  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv: uint8ArrayToWordArray(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  if (decrypted.sigBytes <= 0) {
    throw new Error("Decryption failed. Check encryption password and file format.");
  }

  return wordArrayToArrayBuffer(decrypted);
};

export const decryptFile = async (
  url: string,
  password: string
): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch encrypted model: ${response.status} ${response.statusText}`);
  }

  const encryptedData = await response.arrayBuffer();
  if (encryptedData.byteLength <= 16) {
    throw new Error("Encrypted model data is invalid or too small.");
  }

  const iv = new Uint8Array(encryptedData.slice(0, 16));
  const data = encryptedData.slice(16);
  const subtle = getSubtleCrypto();
  const passwordCandidates = Array.from(new Set([password, "Character3D#@", "MyCharacter12"]));

  let lastError: unknown = null;

  if (!subtle) {
    for (const candidate of passwordCandidates) {
      try {
        return tryDecryptWithCryptoJs(iv, data, candidate);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError ?? new Error("Decryption failed without Web Crypto.");
  }

  for (const candidate of passwordCandidates) {
    try {
      return await tryDecryptWithSubtle(iv, data, candidate);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to decrypt model with available passwords. Last error: ${
      lastError instanceof Error ? lastError.message : "Unknown error"
    }`
  );
};
