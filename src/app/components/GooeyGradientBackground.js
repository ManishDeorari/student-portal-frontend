"use client";

import React, { useEffect, useRef } from "react";
import "./GooeyGradientBackground.css";

/**
 * A mesmerizing, interactive gooey liquid gradient background with animated blobs.
 *
 * Features:
 * - Pure CSS animations for 5 background blobs
 * - SVG filter for the "gooey" liquid merging effect
 * - Interactive mouse-following blob (JS-driven for performance)
 * - Dark / light mode aware via `darkMode` prop
 * - Renders children on top in a scrollable content layer
 */
export function GooeyGradientBackground({
  children,
  className = "",
  darkMode = true,
  overlay = true,
}) {
  const interactiveRef = useRef(null);

  useEffect(() => {
    let curX = 0;
    let curY = 0;
    let tgX = 0;
    let tgY = 0;
    let rafId;

    const handleMouseMove = (event) => {
      tgX = event.clientX;
      tgY = event.clientY;
    };

    const animate = () => {
      if (!interactiveRef.current) return;

      curX += (tgX - curX) / 20;
      curY += (tgY - curY) / 20;

      interactiveRef.current.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const themeClass = darkMode ? "gooey-dark" : "gooey-light";

  return (
    <div className={`gooey-wrapper ${themeClass} ${className}`}>
      {/* Background layer — fixed behind all content */}
      <div className="gooey-gradient-bg">
        {/* Hidden SVG provides the goo filter */}
        <svg xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>

        {/* Animated blob container */}
        <div className="gooey-gradients-container">
          <div className="gooey-g1"></div>
          <div className="gooey-g2"></div>
          <div className="gooey-g3"></div>
          <div className="gooey-g4"></div>
          <div className="gooey-g5"></div>
          <div ref={interactiveRef} className="gooey-interactive"></div>
        </div>
      </div>

      {/* Subtle overlay for contrast / readability */}
      {overlay && <div className="gooey-overlay" />}

      {/* Content rendered on top */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

export default GooeyGradientBackground;
