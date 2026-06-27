import * as THREE from "three";

export interface ProceduralAvatar {
  group: THREE.Group;
  headGroup: THREE.Group;
  mixer: THREE.AnimationMixer;
  update: (delta: number) => void;
}

// ── Shared material pool (one instance per color, not per mesh) ──
const MAT_CACHE = new Map<string, THREE.MeshStandardMaterial>();

function sharedBody(): THREE.MeshStandardMaterial {
  const key = "body";
  if (!MAT_CACHE.has(key)) {
    MAT_CACHE.set(key, new THREE.MeshStandardMaterial({
      color: 0x0d1e35,
      roughness: 0.35,
      metalness: 0.88,
    }));
  }
  return MAT_CACHE.get(key)!;
}

function sharedGlow(hex: number, intensity = 2.0): THREE.MeshStandardMaterial {
  const key = `glow_${hex}_${intensity}`;
  if (!MAT_CACHE.has(key)) {
    MAT_CACHE.set(key, new THREE.MeshStandardMaterial({
      color: hex,
      emissive: hex,
      emissiveIntensity: intensity,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.9,
    }));
  }
  return MAT_CACHE.get(key)!;
}

function sharedVisor(): THREE.MeshStandardMaterial {
  const key = "visor";
  if (!MAT_CACHE.has(key)) {
    MAT_CACHE.set(key, new THREE.MeshStandardMaterial({
      color: 0x001833,
      emissive: 0x00c8ff,
      emissiveIntensity: 0.5,
      roughness: 0.0,
      metalness: 0.05,
      transparent: true,
      opacity: 0.75,
    }));
  }
  return MAT_CACHE.get(key)!;
}

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.matrixAutoUpdate = true;
  return m;
}

export function buildProceduralAvatar(scene: THREE.Scene): ProceduralAvatar {
  MAT_CACHE.clear(); // fresh materials on each build

  const bodyMat  = sharedBody();
  const cyanGlow = sharedGlow(0x00f5d4, 2.2);
  const purpGlow = sharedGlow(0xa855f7, 2.0);
  const blueGlow = sharedGlow(0x0057ff, 1.8);
  const whiteGlow = sharedGlow(0xcceeff, 2.8);
  const visorMat = sharedVisor();

  const root = new THREE.Group();

  // ── Torso ─────────────────────────────────────────────────────
  const torsoGroup = new THREE.Group();

  // Chest (single box)
  torsoGroup.add(mesh(new THREE.BoxGeometry(1.8, 2.2, 0.95), bodyMat));

  // Shoulder pads (low-poly cylinders, shared geometry)
  const padGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.28, 10);
  [-1.15, 1.15].forEach((x, i) => {
    const pad = mesh(padGeo, bodyMat);
    pad.rotation.z = Math.PI / 2;
    pad.position.set(x, 0.85, 0);
    torsoGroup.add(pad);

    // Shoulder ring
    const ring = mesh(new THREE.TorusGeometry(0.36, 0.045, 6, 18), i === 0 ? cyanGlow : purpGlow);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(x, 0.85, 0);
    torsoGroup.add(ring);
  });

  // Center chest stripe
  const core = mesh(new THREE.BoxGeometry(0.16, 1.4, 0.07), cyanGlow);
  core.position.set(0, 0.1, 0.5);
  torsoGroup.add(core);

  // Side vents (3 per side, shared geo)
  const ventGeo = new THREE.BoxGeometry(0.28, 0.055, 0.055);
  for (let i = 0; i < 3; i++) {
    [-0.55, 0.55].forEach((x) => {
      const v = mesh(ventGeo, i % 2 === 0 ? blueGlow : purpGlow);
      v.position.set(x, 0.52 - i * 0.3, 0.5);
      torsoGroup.add(v);
    });
  }

  // Arc reactor  (reduced segments)
  const reactor = mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 28), cyanGlow);
  reactor.position.set(0, 0.2, 0.5);
  torsoGroup.add(reactor);

  // Reactor core – we keep a ref for animation
  const reactorCore = mesh(new THREE.CircleGeometry(0.13, 20), whiteGlow);
  reactorCore.position.set(0, 0.2, 0.52);
  torsoGroup.add(reactorCore);

  root.add(torsoGroup);

  // ── Hip ───────────────────────────────────────────────────────
  const hip = mesh(new THREE.BoxGeometry(1.6, 0.5, 0.85), bodyMat);
  hip.position.set(0, -1.35, 0);
  root.add(hip);

  const hipAccent = mesh(new THREE.BoxGeometry(1.38, 0.07, 0.055), cyanGlow);
  hipAccent.position.set(0, -1.15, 0.44);
  root.add(hipAccent);

  // ── Legs (shared geometries per leg part) ─────────────────────
  const legGroup = new THREE.Group();
  const thighGeo = new THREE.CylinderGeometry(0.32, 0.28, 1.3, 9);
  const kneeGeo  = new THREE.SphereGeometry(0.3, 10, 8);
  const kneeRingGeo = new THREE.TorusGeometry(0.29, 0.04, 6, 18);
  const shinGeo  = new THREE.CylinderGeometry(0.27, 0.22, 1.2, 9);
  const bootGeo  = new THREE.BoxGeometry(0.56, 0.38, 0.88);
  const bootStripeGeo = new THREE.BoxGeometry(0.5, 0.055, 0.055);

  [-0.55, 0.55].forEach((x, i) => {
    const thigh = mesh(thighGeo, bodyMat); thigh.position.set(x, -2.25, 0); legGroup.add(thigh);
    const knee  = mesh(kneeGeo,  bodyMat); knee.position.set(x,  -2.95, 0); legGroup.add(knee);
    const kr    = mesh(kneeRingGeo, i === 0 ? cyanGlow : purpGlow); kr.position.set(x, -2.95, 0); legGroup.add(kr);
    const shin  = mesh(shinGeo,  bodyMat); shin.position.set(x, -3.65, 0); legGroup.add(shin);
    const boot  = mesh(bootGeo,  bodyMat); boot.position.set(x, -4.35, 0.12); legGroup.add(boot);
    const bs    = mesh(bootStripeGeo, i === 0 ? cyanGlow : blueGlow); bs.position.set(x, -4.22, 0.46); legGroup.add(bs);
  });
  root.add(legGroup);

  // ── Arms (shared geometries) ───────────────────────────────────
  const armsGroup = new THREE.Group();
  const uArmGeo    = new THREE.CylinderGeometry(0.24, 0.22, 1.15, 9);
  const elbowGeo   = new THREE.SphereGeometry(0.22, 10, 8);
  const elbowRingGeo = new THREE.TorusGeometry(0.21, 0.04, 6, 18);
  const forearmGeo = new THREE.CylinderGeometry(0.21, 0.18, 1.05, 9);
  const handGeo    = new THREE.BoxGeometry(0.38, 0.42, 0.24);
  const wristGeo   = new THREE.TorusGeometry(0.19, 0.04, 6, 18);

  [-1.0, 1.0].forEach((dx, i) => {
    const ua = mesh(uArmGeo,    bodyMat); ua.rotation.z = dx * 0.15; ua.position.set(dx * 1.42, -0.05, 0); armsGroup.add(ua);
    const el = mesh(elbowGeo,   bodyMat); el.position.set(dx * 1.52, -0.72, 0); armsGroup.add(el);
    const er = mesh(elbowRingGeo, i === 0 ? purpGlow : cyanGlow); er.position.set(dx * 1.52, -0.72, 0); armsGroup.add(er);
    const fa = mesh(forearmGeo, bodyMat); fa.position.set(dx * 1.62, -1.35, 0); armsGroup.add(fa);
    const h  = mesh(handGeo,    bodyMat); h.position.set(dx * 1.72, -1.98, 0); armsGroup.add(h);
    const wr = mesh(wristGeo, i === 0 ? cyanGlow : blueGlow); wr.position.set(dx * 1.67, -1.73, 0); armsGroup.add(wr);
  });
  root.add(armsGroup);

  // ── Neck ──────────────────────────────────────────────────────
  const neck = mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.4, 9), bodyMat);
  neck.position.set(0, 1.3, 0);
  root.add(neck);

  // ── Head ──────────────────────────────────────────────────────
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.8, 0);

  const helmet = mesh(new THREE.SphereGeometry(0.62, 16, 12), bodyMat);
  helmet.scale.set(1.0, 1.1, 0.95);
  headGroup.add(helmet);

  const visor = mesh(new THREE.SphereGeometry(0.52, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), visorMat);
  visor.rotation.x = -0.35;
  visor.position.set(0, -0.04, 0.12);
  headGroup.add(visor);

  // Eyes (two circles, each a separate material instance so we can animate)
  const eyeGeoL = new THREE.CircleGeometry(0.08, 16);
  const eyeGeoR = new THREE.CircleGeometry(0.08, 16);
  const eyeMatL = sharedGlow(0x00f5d4, 3.0);
  const eyeMatR = sharedGlow(0xa78bfa, 3.0);
  const eyeL = mesh(eyeGeoL, eyeMatL); eyeL.position.set(-0.18, 0.06, 0.54); headGroup.add(eyeL);
  const eyeR = mesh(eyeGeoR, eyeMatR); eyeR.position.set( 0.18, 0.06, 0.54); headGroup.add(eyeR);

  // Helmet stripe
  const hStripe = mesh(new THREE.TorusGeometry(0.63, 0.024, 6, 36, Math.PI), cyanGlow);
  hStripe.rotation.y = Math.PI / 2;
  hStripe.position.set(0, 0.1, 0);
  headGroup.add(hStripe);

  // Antennas — keep refs for animation
  const antTipMats: THREE.MeshStandardMaterial[] = [];
  const antGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6);
  const antTipGeo = new THREE.SphereGeometry(0.045, 8, 6);
  [-1, 1].forEach((side, i) => {
    const ant = mesh(antGeo, bodyMat);
    ant.position.set(side * 0.58, 0.48, -0.1);
    ant.rotation.z = side * 0.25;
    headGroup.add(ant);

    const tipMat = sharedGlow(side < 0 ? 0x00f5d4 : 0xa855f7, 3.5);
    antTipMats.push(tipMat);
    const tip = mesh(antTipGeo, tipMat);
    tip.position.set(side * 0.69, 0.73, -0.1);
    headGroup.add(tip);
  });

  root.add(headGroup);

  // ── Floating Orbs — REDUCED to 2 pairs ───────────────────────
  const orbsGroup = new THREE.Group();
  const orbDefs = [
    { color: 0x00f5d4, base: new THREE.Vector3(-1.8,  0.5,  0.5) },
    { color: 0xa855f7, base: new THREE.Vector3( 1.8, -0.3,  0.3) },
  ] as const;

  const orbGeo  = new THREE.SphereGeometry(0.07, 8, 6);
  const haloGeo = new THREE.SphereGeometry(0.14, 8, 6);

  // Store base positions & child indices for fast update
  const orbBases: THREE.Vector3[] = [];

  orbDefs.forEach(({ color, base }) => {
    const orbMat  = sharedGlow(color, 3.0);
    const haloMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12 });

    const orb  = mesh(orbGeo,  orbMat);  orb.position.copy(base);
    const halo = mesh(haloGeo, haloMat); halo.position.copy(base);

    orbsGroup.add(orb, halo);
    orbBases.push(base.clone(), base.clone()); // one for orb, one for halo
  });
  root.add(orbsGroup);

  // ── Scale & position ──────────────────────────────────────────
  root.scale.setScalar(0.5);
  root.position.set(0, -0.2, 0);
  scene.add(root);

  // ── Lights — use 2 instead of 3 ──────────────────────────────
  const topLight = new THREE.PointLight(0x00f5d4, 6, 14);
  topLight.position.set(0, 4, 2);
  scene.add(topLight);

  const rimLight = new THREE.PointLight(0x7c3aed, 4, 10);
  rimLight.position.set(-3, 0, -2);
  scene.add(rimLight);

  // ── Pre-computed animation ────────────────────────────────────
  const mixer = new THREE.AnimationMixer(root);
  const reactorCoreMat = reactorCore.material as THREE.MeshStandardMaterial;
  const TWO_PI = Math.PI * 2;
  let time = 0;

  function update(delta: number) {
    time += delta;
    const t = time;

    // Torso breathe — single sin, applied to both groups
    const breathY = Math.sin(t * 1.2) * 0.04;
    torsoGroup.position.y = breathY;
    armsGroup.position.y  = breathY;

    // Reactor pulse
    reactorCoreMat.emissiveIntensity = 1.8 + Math.sin(t * 4.0) * 1.0;

    // Antenna flicker (pre-computed, no child traversal)
    const flickerVal = 3.5 + Math.sin(t * 8.0) * 0.8;
    antTipMats[0].emissiveIntensity = flickerVal;
    antTipMats[1].emissiveIntensity = flickerVal + Math.sin(t * 6.0) * 0.5;

    // Eye pulse
    eyeMatL.emissiveIntensity = 2.8 + Math.sin(t * 2.0) * 0.5;
    eyeMatR.emissiveIntensity = 2.8 + Math.cos(t * 2.3) * 0.5;

    // Orbs — update 4 children (2 orbs + 2 halos) directly
    const children = orbsGroup.children;
    const R = 0.2;
    for (let i = 0; i < orbDefs.length; i++) {
      const base  = orbDefs[i].base;
      const speed = 0.55 + i * 0.25;
      const angle = t * speed + i * TWO_PI * 0.5;
      const px = base.x + Math.cos(angle) * R;
      const py = base.y + Math.sin(angle * 0.7) * R;
      const pz = base.z + Math.sin(t * 0.4 + i) * 0.08;

      children[i * 2    ].position.set(px, py, pz);
      children[i * 2 + 1].position.set(px, py, pz);
    }

    mixer.update(delta);
  }

  return { group: root, headGroup, mixer, update };
}
