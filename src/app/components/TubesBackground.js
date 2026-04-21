"use client";

import React, { useEffect, useRef, useState } from "react";

const randomColors = (count) =>
  new Array(count)
    .fill(0)
    .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"));

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
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
  // CSS visual scale of the canvas — 1 = full size, 0.7 = 30% smaller appearing tubes
  tubeScale = 1,
  // Milliseconds with no interaction before idle wander kicks in
  idleDelay = 5000,
  // Delay (ms) before initialising Three.js — use ~500 on heavy pages to avoid blocking initial render
  initDelay = 0,
}) {
  const canvasRef     = useRef(null);
  const tubesRef      = useRef(null);
  const idleTimerRef  = useRef(null);
  const [webglFailed, setWebglFailed] = useState(false);

  // ── Build canvas CSS for tube scaling ─────────────────────────────────────
  // When tubeScale < 1 we make the canvas larger than viewport then CSS-scale
  // it back down so the Three.js scene appears smaller while still covering
  // the full viewport.
  const invScale    = 1 / tubeScale;
  const extraPct    = (invScale - 1) * 50; // half of the extra coverage
  const canvasStyle =
    tubeScale === 1
      ? { pointerEvents: "none", touchAction: "none", willChange: "transform" }
      : {
          pointerEvents   : "none",
          touchAction     : "none",
          willChange      : "transform",
          position        : "fixed",
          width           : `${invScale * 100}vw`,
          height          : `${invScale * 100}vh`,
          top             : `-${extraPct}vh`,
          left            : `-${extraPct}vw`,
          transform       : `scale(${tubeScale})`,
          transformOrigin : "center center",
        };

  useEffect(() => {
    let mounted = true;

    if (!supportsWebGL()) {
      setWebglFailed(true);
      return;
    }

    // ── Shared state ─────────────────────────────────────────────────────────
    let curX = window.innerWidth  / 2;
    let curY = window.innerHeight / 2;
    let tgtX = curX;
    let tgtY = curY;
    let lastActivity = Date.now();
    let idleInterval = null;

    // Synthetic mouse-move dispatcher
    const fireMove = (x, y) =>
      window.dispatchEvent(
        new MouseEvent("mousemove", { clientX: x, clientY: y, bubbles: true })
      );

    // ── Interaction tracking ─────────────────────────────────────────────────
    const onInteract = (x, y) => {
      lastActivity = Date.now();
      curX = x;
      curY = y;
    };

    const handleMouseMove = (e) => onInteract(e.clientX, e.clientY);

    const handleTouchStart = (e) => {
      if (e.touches.length) { const t = e.touches[0]; onInteract(t.clientX, t.clientY); fireMove(t.clientX, t.clientY); }
    };
    const handleTouchMove = (e) => {
      if (e.touches.length) { const t = e.touches[0]; onInteract(t.clientX, t.clientY); fireMove(t.clientX, t.clientY); }
    };
    const handleTouchEnd = (e) => {
      if (e.changedTouches.length) { const t = e.changedTouches[0]; onInteract(t.clientX, t.clientY); fireMove(t.clientX, t.clientY); }
    };

    window.addEventListener("mousemove",  handleMouseMove,  { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove",  handleTouchMove,  { passive: true });
    window.addEventListener("touchend",   handleTouchEnd,   { passive: true });

    // ── Idle wander — setInterval at ~20fps, much lighter than rAF ───────────
    const pickTarget = () => {
      const pad = 100;
      tgtX = pad + Math.random() * (window.innerWidth  - pad * 2);
      tgtY = pad + Math.random() * (window.innerHeight - pad * 2);
    };

    idleInterval = setInterval(() => {
      if (!mounted) return;
      if (Date.now() - lastActivity < idleDelay) return; // still active

      curX = lerp(curX, tgtX, 0.04);
      curY = lerp(curY, tgtY, 0.04);

      if (Math.hypot(curX - tgtX, curY - tgtY) < 10) pickTarget();

      fireMove(Math.round(curX), Math.round(curY));
    }, 50); // 20fps — smooth but not expensive

    // ── Three.js init (optionally delayed so heavy pages don't stutter) ──────
    const initTubes = async () => {
      if (!mounted || !canvasRef.current) return;
      try {
        const module = await import(
          /* webpackIgnore: true */
          "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js"
        );
        const TubesCursor = module.default;
        if (!mounted) return;

        const app = TubesCursor(canvasRef.current, {
          tubes: {
            colors: ["#6366f1", "#a855f7", "#ec4899"],
            lights: { intensity: 200, colors: ["#818cf8", "#c084fc", "#f472b6", "#60a5fa"] },
          },
        });

        tubesRef.current = app;

        // Prime the renderer so tubes appear immediately without user input
        if (mounted) {
          const prime = () => fireMove(
            Math.round(window.innerWidth  / 2),
            Math.round(window.innerHeight / 2)
          );
          // Multiple pulses to guarantee visibility through any timing variance
          setTimeout(prime, 50);
          setTimeout(prime, 200);
          setTimeout(prime, 600);
        }
      } catch (err) {
        console.warn("TubesCursor failed, falling back.", err);
        if (mounted) setWebglFailed(true);
      }
    };

    // Delay init so heavy pages finish their initial render first
    const initTimeout = setTimeout(initTubes, initDelay);

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      clearInterval(idleInterval);
      window.removeEventListener("mousemove",  handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove",  handleTouchMove);
      window.removeEventListener("touchend",   handleTouchEnd);
    };
  }, [tubeScale, idleDelay, initDelay]);

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
    <div className={`relative w-full ${className || ""}`} onClick={handleClick}>
      {webglFailed ? (
        // Animated gradient fallback for devices without WebGL
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
          style={canvasStyle}
        />
      )}

      {overlay && <div className="fixed inset-0 z-[1] pointer-events-none bg-black/25" />}

      <div className="relative z-10 w-full">{children}</div>

      <style>{`@keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`}</style>
    </div>
  );
}

export default TubesBackground;
