"use client";

import React, { useEffect, useRef, useState } from "react";

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
    let tgtX = curX, tgtY = curY;
    let lastActivity = Date.now();
    let isPointerDown = false;
    let rafId;

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
    try { isTouchDevice = window.matchMedia("(pointer: coarse)").matches || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0); } catch (e) {}

    const fireMove = (x, y) => {
      if (!canvasRef.current) return;
      if (Math.abs(x - lastDispX) < 0.5 && Math.abs(y - lastDispY) < 0.5) return;
      
      // Use PointerEvent for better mobile compatibility
      const event = new PointerEvent("pointermove", {
        clientX: x,
        clientY: y,
        bubbles: true,
        cancelable: true,
        pointerType: isTouchDevice ? "touch" : "mouse",
        view: window
      });
      canvasRef.current.dispatchEvent(event);
      
      lastDispX = x;
      lastDispY = y;
    };

    const idleLoop = () => {
      rafId = requestAnimationFrame(idleLoop);
      if (isPointerDown || isScrolling) return;

      const idle = isTouchDevice || (Date.now() - lastActivity > idleDelay);
      if (!idle) return;

      const speed = isTouchDevice ? 0.012 : 0.01; // Slightly more rhythmic for mobile
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
      try {
        const module = await import(/* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js");
        const TubesCursor = module.default;
        if (!mounted) return;

        const currentTheme = darkMode ? colorSchemes.dark : colorSchemes.light;
        const app = TubesCursor(canvasRef.current, {
          tubes: {
            count: tubeCount,
            radius: 0.015,
            thickness: 0.005,
            colors: currentTheme.tubes,
            lights: { intensity: currentTheme.intensity, colors: currentTheme.lights },
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

    initTubes();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
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
    <div className={`relative w-full overflow-x-hidden ${className || ""}`} onClick={handleClick}>
      {webglFailed ? (
        <div
          className="fixed inset-0 z-0"
          style={{
            background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 25%,#4c1d95 50%,#6d28d9 75%,#1e1b4b 100%)",
            backgroundSize: "400% 400%",
            animation: "gradientShift 12s ease infinite",
          }}
        />
      ) : (
        /* The canvas is what receives the synthetic events. PointerEvents are captured by window and forwarded. */
        <canvas
          ref={canvasRef}
          className="fixed inset-0 w-full h-full block z-0"
          style={{ pointerEvents: "none", touchAction: "none" }}
        />
      )}

      {overlay && (
        <div className="fixed inset-0 z-[1] pointer-events-none bg-black/25" />
      )}

      <div className="relative z-10 w-full">{children}</div>

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
