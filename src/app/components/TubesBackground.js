"use client";

import React, { useEffect, useRef, useState } from "react";

const randomColors = (count) =>
  new Array(count)
    .fill(0)
    .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"));

/** Check if the device supports WebGL */
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
  // Lower number = smaller / less dense tubes (default for auth pages is ~5)
  tubeCount = 5,
  // Auto-wander when user is idle (ms before starting)
  idleDelay = 3000,
}) {
  const canvasRef  = useRef(null);
  const tubesRef   = useRef(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!supportsWebGL()) {
      setWebglFailed(true);
      return;
    }

    // ── Shared mouse position state ──────────────────────────────────────────
    let curX = window.innerWidth  / 2;
    let curY = window.innerHeight / 2;
    let tgtX = curX;
    let tgtY = curY;
    let lastActivity = Date.now();
    let rafId;

    const fireMove = (x, y) => {
      window.dispatchEvent(
        new MouseEvent("mousemove", { clientX: x, clientY: y, bubbles: true })
      );
    };

    // ── Idle auto-wander loop (rAF) ──────────────────────────────────────────
    const pickNewTarget = () => {
      // Pick a random point inside the viewport with some padding
      const pad = 80;
      tgtX = pad + Math.random() * (window.innerWidth  - pad * 2);
      tgtY = pad + Math.random() * (window.innerHeight - pad * 2);
    };

    const idleLoop = () => {
      rafId = requestAnimationFrame(idleLoop);

      const idle = Date.now() - lastActivity > idleDelay;
      if (!idle) return;

      // Smooth lerp toward current target
      curX = lerp(curX, tgtX, 0.012);
      curY = lerp(curY, tgtY, 0.012);

      // When close enough to target, pick a new random destination
      if (Math.hypot(curX - tgtX, curY - tgtY) < 8) pickNewTarget();

      fireMove(Math.round(curX), Math.round(curY));
    };

    // ── Touch → Mouse bridge ─────────────────────────────────────────────────
    const handleInteraction = (clientX, clientY) => {
      lastActivity = Date.now();
      curX = clientX;
      curY = clientY;
    };

    const handleMouseMove = (e) => handleInteraction(e.clientX, e.clientY);

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        handleInteraction(t.clientX, t.clientY);
        fireMove(t.clientX, t.clientY);
      }
    };
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        handleInteraction(t.clientX, t.clientY);
        fireMove(t.clientX, t.clientY);
      }
    };
    const handleTouchEnd = (e) => {
      if (e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        handleInteraction(t.clientX, t.clientY);
        fireMove(t.clientX, t.clientY);
      }
    };

    window.addEventListener("mousemove",  handleMouseMove,  { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove",  handleTouchMove,  { passive: true });
    window.addEventListener("touchend",   handleTouchEnd,   { passive: true });

    // ── Init Three.js tubes ──────────────────────────────────────────────────
    const initTubes = async () => {
      if (!canvasRef.current) return;
      try {
        const module = await import(
          /* webpackIgnore: true */
          "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js"
        );
        const TubesCursor = module.default;
        if (!mounted) return;

        const app = TubesCursor(canvasRef.current, {
          tubes: {
            count: tubeCount,
            colors: ["#6366f1", "#a855f7", "#ec4899"],
            lights: {
              intensity: 200,
              colors: ["#818cf8", "#c084fc", "#f472b6", "#60a5fa"],
            },
          },
        });

        tubesRef.current = app;

        if (mounted) {
          // Prime renderer — center position on load
          const prime = () => fireMove(
            Math.round(window.innerWidth  / 2),
            Math.round(window.innerHeight / 2)
          );
          setTimeout(prime, 80);
          setTimeout(prime, 400);

          // Start idle wander loop
          rafId = requestAnimationFrame(idleLoop);
        }
      } catch (err) {
        console.warn("TubesCursor failed to load, using fallback.", err);
        if (mounted) setWebglFailed(true);
      }
    };

    initTubes();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove",  handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove",  handleTouchMove);
      window.removeEventListener("touchend",   handleTouchEnd);
    };
  }, [tubeCount, idleDelay]);

  // ── Click / Tap → randomize colors ────────────────────────────────────────
  const handleClick = (e) => {
    if (!enableClickInteraction || !tubesRef.current) return;
    if (e.target.closest("a, button, input, form")) return;
    try {
      tubesRef.current.tubes?.setColors(randomColors(3));
      tubesRef.current.tubes?.setLightsColors(randomColors(4));
    } catch { /* silence */ }
  };

  return (
    <div
      className={`relative w-full ${className || ""}`}
      onClick={handleClick}
    >
      {/* WebGL fallback — animated gradient if WebGL unsupported */}
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
