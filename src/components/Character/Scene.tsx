import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildProceduralAvatar, ProceduralAvatar } from "./utils/proceduralAvatar";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import { setAllTimeline } from "../utils/GsapScroll";
import { setProgress } from "../Loading";
import gsap from "gsap";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    if (!canvasDiv.current) return;

    const rect = canvasDiv.current.getBoundingClientRect();
    const container = { width: rect.width, height: rect.height };
    const aspect = container.width / container.height;
    const scene = sceneRef.current;

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: window.devicePixelRatio < 2, // skip AA on already-sharp retina
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    });
    renderer.setSize(container.width, container.height);
    // Cap at 1.5 — halves fill rate on retina without visible quality loss
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = false; // no floor = no useful shadows
    canvasDiv.current.appendChild(renderer.domElement);
    // Hint browser: this canvas should use GPU compositing
    renderer.domElement.style.transform = "translateZ(0)";
    renderer.domElement.style.willChange = "transform";

    // ── Camera ────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(28, aspect, 0.1, 1000);
    camera.position.set(0, 1.5, 8);

    // ── Avatar ────────────────────────────────────────────────
    let avatar: ProceduralAvatar | null = null;
    avatar = buildProceduralAvatar(scene);

    // ── Lighting ──────────────────────────────────────────────
    const light = setLighting(scene);

    // ── Loading progress ──────────────────────────────────────
    const progress = setProgress((value) => setLoading(value));
    progress.loaded().then(() => {
      setTimeout(() => {
        light.turnOnLights();

        // Intro animation: rise from below + fade in
        gsap.fromTo(
          avatar!.group.position,
          { y: -4 },
          { y: -0.2, duration: 1.6, ease: "power3.out" }
        );
        gsap.fromTo(
          avatar!.group,
          { visible: true },
          { duration: 0.01 }
        );

        // Rim light fade in
        gsap.to(".character-rim", {
          y: "55%",
          opacity: 1,
          delay: 0.2,
          duration: 2,
        });

        // Trigger scroll-based timeline
        setCharScrollTimeline(avatar!.group, camera);
        setAllTimeline();
      }, 1500);
    });

    // ── Mouse / touch tracking ─────────────────────────────────
    let mouse = { x: 0, y: 0 };
    let interpolation = { x: 0.1, y: 0.2 };

    const onMouseMove = (event: MouseEvent) => {
      handleMouseMove(event, (x, y) => (mouse = { x, y }));
    };
    let debounce: any;
    const onTouchStart = (event: TouchEvent) => {
      const element = event.target as HTMLElement;
      debounce = setTimeout(() => {
        element?.addEventListener("touchmove", (e: TouchEvent) =>
          handleTouchMove(e, (x, y) => (mouse = { x, y }))
        );
      }, 200);
    };
    const onTouchEnd = () => {
      handleTouchEnd((x, y, ix, iy) => {
        mouse = { x, y };
        interpolation = { x: ix, y: iy };
      });
    };

    document.addEventListener("mousemove", onMouseMove);
    const landingDiv = document.getElementById("landingDiv");
    if (landingDiv) {
      landingDiv.addEventListener("touchstart", onTouchStart);
      landingDiv.addEventListener("touchend", onTouchEnd);
    }

    // ── Resize ────────────────────────────────────────────────
    const dummyChar = avatar!.group as any;
    const onResize = () => handleResize(renderer, camera, canvasDiv, dummyChar);
    window.addEventListener("resize", onResize);

    // ── Render loop ───────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (avatar) {
        // Head follows mouse
        handleHeadRotation(
          avatar.headGroup,
          mouse.x,
          mouse.y,
          interpolation.x,
          interpolation.y,
          THREE.MathUtils.lerp
        );
        // Procedural idle update
        avatar.update(delta);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      clearTimeout(debounce);
      cancelAnimationFrame(animId);
      scene.clear();
      renderer.dispose();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouseMove);
      if (landingDiv) {
        landingDiv.removeEventListener("touchstart", onTouchStart);
        landingDiv.removeEventListener("touchend", onTouchEnd);
      }
      if (canvasDiv.current && renderer.domElement.parentNode === canvasDiv.current) {
        canvasDiv.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
        </div>
      </div>
    </>
  );
};

// ── Scroll-driven GSAP timeline for the procedural avatar ──────
function setCharScrollTimeline(
  avatarRoot: THREE.Group,
  camera: THREE.PerspectiveCamera
) {
  if (window.innerWidth <= 1024) return;

  const gsapLib = gsap;

  const tl1 = gsapLib.timeline({
    scrollTrigger: {
      trigger: ".landing-section",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  tl1
    .fromTo(avatarRoot.rotation, { y: 0 }, { y: 0.7, duration: 1 }, 0)
    .to(camera.position, { z: 12 }, 0)
    .fromTo(".character-model", { x: 0 }, { x: "-25%", duration: 1 }, 0)
    .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
    .to(".landing-container", { y: "40%", duration: 0.8 }, 0)
    .fromTo(".about-me", { y: "-50%" }, { y: "0%" }, 0);

  const tl3 = gsapLib.timeline({
    scrollTrigger: {
      trigger: ".whatIDO",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  tl3
    .fromTo(
      ".character-model",
      { y: "0%" },
      { y: "-100%", duration: 4, ease: "none", delay: 1 },
      0
    )
    .fromTo(".whatIDO", { y: 0 }, { y: "15%", duration: 2 }, 0)
    .to(avatarRoot.rotation, { x: -0.04, duration: 2, delay: 1 }, 0);
}

export default Scene;
