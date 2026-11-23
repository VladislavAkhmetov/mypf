"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import styles from "./hero-dancer.module.css";

type ExtendedMaterial = THREE.Material & {
  map?: THREE.Texture | null;
  color?: THREE.Color;
};

function isWebGLAvailable(): boolean {
  try {
    const testCanvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (testCanvas.getContext("webgl2") || testCanvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.5)");
    gradient.addColorStop(0.35, "rgba(0, 0, 0, 0.22)");
    gradient.addColorStop(0.75, "rgba(0, 0, 0, 0.06)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function HeroDancer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    if (!isWebGLAvailable()) return;

    let destroyed = false;
    let animationFrameId = 0;
    let isVisible = true;
    let mixer: THREE.AnimationMixer | null = null;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    const fov = 38;
    const camera = new THREE.PerspectiveCamera(
      fov,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      50
    );
    // Center camera at character torso height (y ~ 0.50), distance z ~ 1.88
    camera.position.set(0, 0.50, 1.88);
    camera.lookAt(0, 0.50, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(container.clientWidth, container.clientHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
    } catch (e) {
      console.warn("Failed to create WebGLRenderer:", e);
      return;
    }

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
    keyLight.position.set(2.2, 3.6, 2.8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa5c8ff, 1.1);
    fillLight.position.set(-2.5, 1.6, 2.0);
    scene.add(fillLight);

    // Signature orange rim light from back-right (matches brand color #ff4b16)
    const orangeRimLight = new THREE.DirectionalLight(0xff5518, 4.2);
    orangeRimLight.position.set(1.8, 2.0, -2.4);
    scene.add(orangeRimLight);

    // Soft floor contact shadow
    const shadowTexture = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, 0.005, 0);
    scene.add(shadowMesh);

    // Root group for the character and interactions
    const characterGroup = new THREE.Group();
    const baseRotationY = 0.22;
    characterGroup.rotation.y = baseRotationY;
    scene.add(characterGroup);

    // --- Load FBX Model ---
    const clock = new THREE.Clock();
    const loader = new FBXLoader();

    loader.load(
      "/models/hip-hop-dancing.fbx",
      (fbx) => {
        if (destroyed) return;

        fbx.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const materials = Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material];
              materials.forEach((mat) => {
                const m = mat as ExtendedMaterial;
                if (m.map) {
                  m.map.colorSpace = THREE.SRGBColorSpace;
                }
                if (m.color) {
                  m.color.set(0xffffff);
                }
                m.needsUpdate = true;
              });
            }
          }
        });

        if (fbx.animations && fbx.animations.length > 0) {
          mixer = new THREE.AnimationMixer(fbx);
          const clip = fbx.animations[0];
          const action = mixer.clipAction(clip);
          action.play();
        }

        characterGroup.add(fbx);
        setLoaded(true);
      },
      undefined,
      (err) => {
        console.error("Failed to load Hip Hop Dancing model:", err);
      }
    );

    // --- Interaction & Parallax ---
    let dragAngle = 0;
    let dragVelocity = 0;
    let isDragging = false;
    let lastPointerX = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      isDragging = true;
      lastPointerX = e.clientX;
      dragVelocity = 0;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - lastPointerX;
        lastPointerX = e.clientX;
        dragAngle += deltaX * 0.012;
        dragVelocity = deltaX * 0.012;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
    };

    const onWindowPointerMove = (e: MouseEvent) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetParallaxX = ((e.clientX - halfW) / halfW) * 0.28;
      targetParallaxY = ((e.clientY - halfH) / halfH) * 0.12;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("pointermove", onWindowPointerMove, { passive: true });

    // --- Resize Observer ---
    const handleResize = () => {
      if (!container || destroyed) return;
      const width = container.clientWidth;
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // --- Visibility & Intersection Observers ---
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // --- Render Loop ---
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const animate = () => {
      if (destroyed) return;
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = clock.getDelta();

      if (mixer && !prefersReducedMotion.matches) {
        mixer.update(delta);
      }

      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;

      if (!isDragging && Math.abs(dragVelocity) > 0.0001) {
        dragAngle += dragVelocity;
        dragVelocity *= 0.92;
      }

      characterGroup.rotation.y = baseRotationY + dragAngle + currentParallaxX;
      characterGroup.rotation.x = currentParallaxY;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      destroyed = true;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointermove", onWindowPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);

      if (mixer) {
        mixer.stopAllAction();
      }

      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTexture.dispose();

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              const ext = m as ExtendedMaterial;
              if (ext.map) ext.map.dispose();
              m.dispose();
            });
          }
        }
      });

      renderer.dispose();
    };
  }, []);

  return (
    <div className={styles.dancerWrapper} aria-hidden="true">
      <div
        ref={containerRef}
        className={styles.dancerCanvasBox}
        data-loaded={loaded}
        title="Hip Hop Dancing (потяните, чтобы покрутить)"
      >
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
    </div>
  );
}
