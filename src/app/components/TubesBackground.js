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

export function TubesBackground({
  children,
  className,
  enableClickInteraction = true,
}) {
  const canvasRef = useRef(null);
  const tubesRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    let cleanup;

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
        setIsLoaded(true);

        cleanup = () => {
          // cleanup if lib exposes it
        };
      } catch (error) {
        console.error("Failed to load TubesCursor:", error);
      }
    };

    initTubes();

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, []);

  const handleClick = (e) => {
    // Only randomize if clicking directly on the background canvas area
    // i.e., not propagated clicks from child buttons/links
    if (!enableClickInteraction || !tubesRef.current) return;
    if (e.target.closest("a, button, input, form")) return;

    const colors = randomColors(3);
    const lightsColors = randomColors(4);

    try {
      tubesRef.current.tubes?.setColors(colors);
      tubesRef.current.tubes?.setLightsColors(lightsColors);
    } catch (err) {
      // silence if method doesn't exist in this version
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-x-hidden ${className || ""}`}
      onClick={handleClick}
    >
      {/* 3D Canvas — fixed so it persists through scroll */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full block z-0"
        style={{ touchAction: "none", pointerEvents: "none" }}
      />

      {/* Dark overlay for section readability */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-black/40" />

      {/* Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

export default TubesBackground;
