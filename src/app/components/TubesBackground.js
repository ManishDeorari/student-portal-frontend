"use client";

import React, { useEffect, useRef, useState } from "react";

const randomColors = (count) => {
  return new Array(count)
    .fill(0)
    .map(
      () =>
        "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
    );
};

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

export function TubesBackground({
  children,
  className,
  enableClickInteraction = true,
  overlay = true,
}) {
  const canvasRef = useRef(null);
  const tubesRef = useRef(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    let mounted = true;

    // ─── WebGL guard ────────────────────────────────────────────────────────
    if (!supportsWebGL()) {
      setWebglFailed(true);
      return;
    }

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
            colors: ["#6366f1", "#a855f7", "#ec4899"],
            lights: {
              intensity: 200,
              colors: ["#818cf8", "#c084fc", "#f472b6", "#60a5fa"],
            },
          },
        });

        tubesRef.current = app;

        // ── Prime the renderer: dispatch a mousemove to the viewport center
        // immediately after init so tubes appear on page load without waiting
        // for the first user interaction (fixes home page "blank until move" issue)
        if (mounted) {
          const fireCenter = () => {
            window.dispatchEvent(
              new MouseEvent("mousemove", {
                clientX: window.innerWidth / 2,
                clientY: window.innerHeight / 2,
                bubbles: true,
                cancelable: true,
              })
            );
          };
          // Small delay lets the lib finish its internal setup
          setTimeout(fireCenter, 80);
          // Second pulse ensures it's definitely visible after any transition
          setTimeout(fireCenter, 400);
        }
      } catch (error) {
        console.warn("TubesCursor failed to load, using fallback.", error);
        if (mounted) setWebglFailed(true);
      }
    };

    // ─── Touch → Mouse bridge ───────────────────────────────────────────────
    // Translates finger touches into synthetic MouseEvents so tubes follow touch
    const fireMouseMove = (clientX, clientY) => {
      window.dispatchEvent(
        new MouseEvent("mousemove", {
          clientX,
          clientY,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    // Immediate response on first finger contact
    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        fireMouseMove(t.clientX, t.clientY);
      }
    };

    // Continuous tracking while dragging
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        fireMouseMove(t.clientX, t.clientY);
      }
    };

    // Keep tubes at last position when finger lifts
    const handleTouchEnd = (e) => {
      if (e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        fireMouseMove(t.clientX, t.clientY);
      }
    };

    // passive:true — never blocks native scroll on mobile
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove",  handleTouchMove,  { passive: true });
    window.addEventListener("touchend",   handleTouchEnd,   { passive: true });

    initTubes();

    return () => {
      mounted = false;
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove",  handleTouchMove);
      window.removeEventListener("touchend",   handleTouchEnd);
    };
  }, []);

  // ─── Click / Tap → randomize colors ────────────────────────────────────────
  const handleClick = (e) => {
    if (!enableClickInteraction || !tubesRef.current) return;
    if (e.target.closest("a, button, input, form")) return;

    const colors = randomColors(3);
    const lightsColors = randomColors(4);

    try {
      tubesRef.current.tubes?.setColors(colors);
      tubesRef.current.tubes?.setLightsColors(lightsColors);
    } catch {
      // silence
    }
  };

  return (
    <div
      className={`relative w-full ${className || ""}`}
      onClick={handleClick}
    >
      {/* ── WebGL fallback: animated gradient if WebGL is unsupported ── */}
      {webglFailed ? (
        <div
          className="fixed inset-0 z-0"
          style={{
            background:
              "linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #6d28d9 75%, #1e1b4b 100%)",
            backgroundSize: "400% 400%",
            animation: "gradientShift 12s ease infinite",
          }}
        />
      ) : (
        /* ── 3D Canvas — fixed behind all content ── */
        <canvas
          ref={canvasRef}
          className="fixed inset-0 w-full h-full block z-0"
          style={{
            pointerEvents: "none", // lets page content remain tappable/scrollable
            touchAction: "none",
          }}
        />
      )}

      {/* Subtle dark overlay for readability */}
      {overlay && (
        <div className="fixed inset-0 z-[1] pointer-events-none bg-black/25" />
      )}

      {/* Page content */}
      <div className="relative z-10 w-full">{children}</div>

      {/* Keyframe injection for fallback gradient animation */}
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
