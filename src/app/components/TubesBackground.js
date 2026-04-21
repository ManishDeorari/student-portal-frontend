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
  // Number of tubes
  tubeCount = 4,
  // ms before auto-wandering starts
  idleDelay = 2000,
  // Theme sync
  darkMode = true,
}) {
  const canvasRef  = useRef(null);
  const tubesRef   = useRef(null);
  const [webglFailed, setWebglFailed] = useState(false);

  // ── Color Schemes ──────────────────────────────────────────────────────────
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

  // ── Theme Sync Effect ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!tubesRef.current) return;
    const theme = darkMode ? colorSchemes.dark : colorSchemes.light;
    try {
      if (tubesRef.current.tubes?.setColors) {
        tubesRef.current.tubes.setColors(theme.tubes);
      }
      if (tubesRef.current.tubes?.setLightsColors) {
        tubesRef.current.tubes.setLightsColors(theme.lights);
      }
    } catch (err) {
      console.warn("Could not update tube colors dynamically", err);
    }
  }, [darkMode]);

  // ── Main Effect ────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    if (!supportsWebGL()) {
      setWebglFailed(true);
      return;
    }

    // ── Shared mouse position state ──────────────────────────────────────────
    let curX = window.innerWidth  / 2;
    let curY = window.innerHeight / 2;
    let lastDispatchedX = -1;
    let lastDispatchedY = -1;
    let tgtX = curX;
    let tgtY = curY;
    let lastActivity = Date.now();
    let rafId;

    const fireMove = (x, y) => {
      // Optimization: Avoid redundant events
      if (Math.abs(x - lastDispatchedX) < 0.5 && Math.abs(y - lastDispatchedY) < 0.5) return;
      
      const event = new MouseEvent("mousemove", { clientX: x, clientY: y, bubbles: true });
      window.dispatchEvent(event);
      
      lastDispatchedX = x;
      lastDispatchedY = y;
    };

    // ── Idle auto-wander loop ──────────────────────────────────────────────
    const pickNewTarget = () => {
      const pad = 100;
      tgtX = pad + Math.random() * (window.innerWidth  - pad * 2);
      tgtY = pad + Math.random() * (window.innerHeight - pad * 2);
    };

    const idleLoop = () => {
      rafId = requestAnimationFrame(idleLoop);

      const idle = Date.now() - lastActivity > idleDelay;
      if (!idle) return;

      // Smooth lerp toward current target
      curX = lerp(curX, tgtX, 0.008); // Even slower for elegance
      curY = lerp(curY, tgtY, 0.008);

      if (Math.hypot(curX - tgtX, curY - tgtY) < 10) pickNewTarget();

      fireMove(curX, curY);
    };

    // ── Interaction Handlers ─────────────────────────────────────────────────
    const handleInteraction = (clientX, clientY) => {
      lastActivity = Date.now();
      curX = clientX;
      curY = clientY;
    };

    const handleMouseMove = (e) => handleInteraction(e.clientX, e.clientY);
    const handleTouch = (e) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        handleInteraction(t.clientX, t.clientY);
        fireMove(t.clientX, t.clientY);
      }
    };

    window.addEventListener("mousemove",  handleMouseMove,  { passive: true });
    window.addEventListener("touchstart", handleTouch,      { passive: true });
    window.addEventListener("touchmove",  handleTouch,      { passive: true });
    window.addEventListener("touchend",   handleTouch,      { passive: true });

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

        const currentTheme = darkMode ? colorSchemes.dark : colorSchemes.light;

        const app = TubesCursor(canvasRef.current, {
          tubes: {
            count: tubeCount,
            // Experimental: Reducing diameter/thickness
            radius: 0.015,   // Smaller radius for slimmer lines
            thickness: 0.005, // Thinner girth
            colors: currentTheme.tubes,
            lights: {
              intensity: currentTheme.intensity,
              colors: currentTheme.lights,
            },
          },
        });

        tubesRef.current = app;

        if (mounted) {
          // ENSURE VISIBILITY: Force fire a move to current position twice
          const initialPrime = () => {
            fireMove(window.innerWidth / 2, window.innerHeight / 2);
          };
          initialPrime();
          setTimeout(initialPrime, 100);
          setTimeout(initialPrime, 500);

          rafId = requestAnimationFrame(idleLoop);
        }
      } catch (err) {
        console.warn("TubesCursor failed to load", err);
        if (mounted) setWebglFailed(true);
      }
    };

    initTubes();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove",  handleMouseMove);
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("touchmove",  handleTouch);
      window.removeEventListener("touchend",   handleTouch);
    };
  }, [tubeCount, idleDelay]);

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
        <div
          className="fixed inset-0 z-0 transition-colors duration-1000"
          style={{
            background: darkMode 
              ? "linear-gradient(135deg,#1e1b4b 0%,#312e81 25%,#4c1d95 50%,#6d28d9 75%,#1e1b4b 100%)"
              : "linear-gradient(135deg,#eff6ff 0%,#e0e7ff 25%,#ede9fe 50%,#fae8ff 75%,#eff6ff 100%)",
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
        <div className={`fixed inset-0 z-[1] pointer-events-none transition-colors duration-700 ${darkMode ? "bg-black/25" : "bg-white/10"}`} />
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
