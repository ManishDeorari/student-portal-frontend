"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from 'three';

const randomColors = (count) =>
  new Array(count)
    .fill(0)
    .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"));

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

const lerp = (a, b, t) => a + (b - a) * t;

export function TubesBackground({
  children,
  className,
  enableClickInteraction = true,
  overlay = true,
  tubeCount = 5,
  idleDelay = 2000,
  darkMode = true,
}) {
  const canvasRef  = useRef(null);
  const tubesRef   = useRef(null);
  const [webglFailed, setWebglFailed] = useState(false);

  const colorSchemes = {
    dark: {
      tubes: ["#6366f1", "#a855f7", "#ec4899"],
      lights: ["#818cf8", "#c084fc", "#f472b6", "#60a5fa"],
      intensity: 300,
    },
    light: {
      tubes: ["#3b82f6", "#8b5cf6", "#d946ef"],
      lights: ["#dbeafe", "#f3e8ff", "#fae8ff", "#eff6ff"],
      intensity: 150,
    }
  };

  useEffect(() => {
    if (!tubesRef.current) return;
    const theme = darkMode ? colorSchemes.dark : colorSchemes.light;
    try {
      tubesRef.current.tubes?.setColors?.(theme.tubes);
      tubesRef.current.tubes?.setLightsColors?.(theme.lights);
    } catch { /* ignore */ }
  }, [darkMode]);

  useEffect(() => {
    let mounted = true;
    if (!supportsWebGL()) {
      setWebglFailed(true);
      return;
    }

    let curX = window.innerWidth / 2;
    let curY = window.innerHeight / 2;
    let lastDispX = -1, lastDispY = -1;
    let tgtX = curX + 1; // Slight offset to ensure first move is registered
    let tgtY = curY + 1;
    let lastActivity = 0; // Force idle wandering to start immediately
    let isPointerDown = false;
    let rafId;

    const fireMove = (x, y) => {
      if (!mounted) return;
      if (Math.abs(x - lastDispX) < 0.5 && Math.abs(y - lastDispY) < 0.5) return;
      
      const eventData = {
        clientX: x,
        clientY: y,
        bubbles: true,
        cancelable: true,
        view: window
      };
      
      // Dispatch PointerEvent and MouseEvent to window, document, body and canvas
      const types = window.PointerEvent ? ["pointermove", "mousemove"] : ["mousemove"];
      types.forEach((type) => {
        const EventClass = type === "pointermove" ? PointerEvent : MouseEvent;
        const e = new EventClass(type, eventData);
        window.dispatchEvent(e);
        document.dispatchEvent(new EventClass(type, eventData));
        if (document.body) document.body.dispatchEvent(new EventClass(type, eventData));
        if (canvasRef.current) canvasRef.current.dispatchEvent(new EventClass(type, eventData));
      });

      // Dispatch TouchEvent for mobile-specific listeners
      try {
        const touch = new Touch({
          identifier: 0,
          target: canvasRef.current || document.body,
          clientX: x,
          clientY: y
        });
        const touchEvent = new TouchEvent("touchmove", {
          cancelable: true,
          bubbles: true,
          touches: [touch],
          targetTouches: [touch],
          changedTouches: [touch]
        });
        window.dispatchEvent(touchEvent);
        document.dispatchEvent(touchEvent);
        if (document.body) document.body.dispatchEvent(touchEvent);
        if (canvasRef.current) canvasRef.current.dispatchEvent(touchEvent);
      } catch (e) {
        // Ignore if Touch API isn't fully supported
      }

      // Try brute-force mutation on the library object itself if it exposes a cursor or mouse property
      try {
        if (tubesRef.current) {
          if (tubesRef.current.cursor) { tubesRef.current.cursor.x = x; tubesRef.current.cursor.y = y; }
          if (tubesRef.current.mouse) { tubesRef.current.mouse.x = x; tubesRef.current.mouse.y = y; }
        }
      } catch (e) {}
      
      lastDispX = x;
      lastDispY = y;
    };

    const pickTarget = () => {
      const pad = 100;
      tgtX = pad + Math.random() * (window.innerWidth - pad * 2);
      tgtY = pad + Math.random() * (window.innerHeight - pad * 2);
    };

    let isScrolling = false;
    let scrollTimeout;

    const onScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => { isScrolling = false; }, 150);
    };

    let isTouchDevice = false;
    try { isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0); } catch (e) {}

    const idleLoop = () => {
      rafId = requestAnimationFrame(idleLoop);
      // On touch devices, we don't pause for pointer down, only for active scrolling
      const shouldPause = isTouchDevice ? isScrolling : (isPointerDown || isScrolling);
      if (shouldPause) return;

      const idle = isTouchDevice || (Date.now() - lastActivity > idleDelay);
      if (!idle) return;

      // Smoother, slightly faster wandering for touch devices
      const speed = isTouchDevice ? 0.015 : 0.01;
      curX = lerp(curX, tgtX, speed);
      curY = lerp(curY, tgtY, speed);

      if (Math.hypot(curX - tgtX, curY - tgtY) < 15) pickTarget();
      fireMove(curX, curY);
    };

    // ── Unified Pointer Events (Mobile & Desktop) ───────────────────────────
    const handlePointerAction = (e) => {
      lastActivity = Date.now();
      if (!isTouchDevice) {
        curX = e.clientX;
        curY = e.clientY;
        fireMove(e.clientX, e.clientY);
      }
    };

    const onPointerDown = (e) => {
      isPointerDown = true;
      handlePointerAction(e);
    };
    const onPointerMove = (e) => handlePointerAction(e);
    const onPointerUp = () => {
      isPointerDown = false;
      lastActivity = Date.now();
    };

    window.addEventListener("scroll",      onScroll,      { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup",   onPointerUp,   { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });

    const initTubes = async () => {
      if (!canvasRef.current) return;
      
      if (isTouchDevice) {
        initMobileThreeJS();
        return;
      }

      // Small delay for mobile stability before heavy WebGL init
      await new Promise(r => setTimeout(r, 200));
      if (!mounted) return;

      try {
        const module = await import(/* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js");
        const TubesCursor = module.default;
        if (!mounted) return;

        const currentTheme = darkMode ? colorSchemes.dark : colorSchemes.light;
        
        // Increase intensity for mobile visibility
        const intensity = isTouchDevice ? (currentTheme.intensity * 1.5) : currentTheme.intensity;

        const app = TubesCursor(canvasRef.current, {
          tubes: {
            count: tubeCount,
            radius: 0.015,
            thickness: 0.005,
            colors: currentTheme.tubes,
            lights: { intensity: intensity, colors: currentTheme.lights },
          },
        });
        tubesRef.current = app;

        if (mounted) {
          const prime = () => fireMove(window.innerWidth / 2, window.innerHeight / 2);
          prime(); setTimeout(prime, 100); setTimeout(prime, 500);
          rafId = requestAnimationFrame(idleLoop);
        }
      } catch {
        if (mounted) setWebglFailed(true);
      }
    };

    let mobileRenderer, mobileRafId;
    const initMobileThreeJS = () => {
      const canvas = canvasRef.current;
      mobileRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      mobileRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mobileRenderer.setSize(window.innerWidth, window.innerHeight);

      const mobileScene = new THREE.Scene();
      const mobileCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
      mobileCamera.position.z = 10;

      const currentTheme = darkMode ? colorSchemes.dark : colorSchemes.light;
      
      // Create glowing particles that drift
      const geometry = new THREE.BufferGeometry();
      const particleCount = 150;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const velocities = [];

      const themeColors = currentTheme.tubes.map(c => new THREE.Color(c));

      for (let i = 0; i < particleCount; i++) {
          positions[i*3] = (Math.random() - 0.5) * 25;
          positions[i*3+1] = (Math.random() - 0.5) * 25;
          positions[i*3+2] = (Math.random() - 0.5) * 15 - 5;
          
          const col = themeColors[Math.floor(Math.random() * themeColors.length)];
          colors[i*3] = col.r;
          colors[i*3+1] = col.g;
          colors[i*3+2] = col.b;

          velocities.push({
              x: (Math.random() - 0.5) * 0.02,
              y: (Math.random() - 0.5) * 0.02,
              z: (Math.random() - 0.5) * 0.01,
          });
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Simple glowing material
      const material = new THREE.PointsMaterial({
          size: 0.2,
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
      });

      const mobileParticles = new THREE.Points(geometry, material);
      mobileScene.add(mobileParticles);

      const animate = () => {
          if (!mounted) return;
          mobileRafId = requestAnimationFrame(animate);
          
          const posAttr = mobileParticles.geometry.attributes.position;
          for (let i = 0; i < particleCount; i++) {
              posAttr.array[i*3] += velocities[i].x;
              posAttr.array[i*3+1] += velocities[i].y;
              posAttr.array[i*3+2] += velocities[i].z;

              // Bounds check
              if (Math.abs(posAttr.array[i*3]) > 15) velocities[i].x *= -1;
              if (Math.abs(posAttr.array[i*3+1]) > 15) velocities[i].y *= -1;
              if (posAttr.array[i*3+2] > 5 || posAttr.array[i*3+2] < -15) velocities[i].z *= -1;
          }
          posAttr.needsUpdate = true;
          
          mobileParticles.rotation.y += 0.001;
          mobileParticles.rotation.x += 0.0005;

          mobileRenderer.render(mobileScene, mobileCamera);
      };

      animate();
    };

    initTubes();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      if (mobileRafId) cancelAnimationFrame(mobileRafId);
      if (mobileRenderer) {
        mobileRenderer.dispose();
      }
      window.removeEventListener("scroll",      onScroll);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup",   onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [tubeCount, idleDelay]);

  const handleClick = (e) => {
    if (!enableClickInteraction || !tubesRef.current) return;
    if (e.target.closest("a, button, input, form")) return;
    try {
      tubesRef.current.tubes?.setColors?.(randomColors(3));
      tubesRef.current.tubes?.setLightsColors?.(randomColors(4));
    } catch { /* ignore */ }
  };

  return (
    <div className={`w-full ${className || ""}`} onClick={handleClick}>
      {webglFailed ? (
        <div
          className="fixed inset-0 z-0 w-screen h-[100dvh]"
          style={{
            background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 25%,#4c1d95 50%,#6d28d9 75%,#1e1b4b 100%)",
            backgroundSize: "400% 400%",
            animation: "gradientShift 12s ease infinite",
          }}
        />
      ) : (
        /* Detached z-index and forced viewport binding for mobile reliability */
        <canvas
          ref={canvasRef}
          className="fixed inset-0 w-screen h-[100dvh] block z-[1]"
          style={{ pointerEvents: "none", touchAction: "none" }}
        />
      )}

      {overlay && (
        <div className="fixed inset-0 w-screen h-[100dvh] z-[2] pointer-events-none bg-black/30" />
      )}

      <div className="relative z-10 w-full overflow-x-hidden">{children}</div>

      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

export default TubesBackground;
