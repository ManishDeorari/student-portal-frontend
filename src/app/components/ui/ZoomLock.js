"use client";

import { useEffect } from "react";

export default function ZoomLock() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent Ctrl + Plus, Ctrl + Minus, Ctrl + 0
      if (e.ctrlKey && (
        e.key === "=" || 
        e.key === "-" || 
        e.key === "+" || 
        e.key === "0" ||
        e.keyCode === 187 || // =/+
        e.keyCode === 189 || // -/_
        e.keyCode === 107 || // NumPad +
        e.keyCode === 109 || // NumPad -
        e.keyCode === 48     // 0
      )) {
        e.preventDefault();
      }
    };

    const handleWheel = (e) => {
      // Prevent Ctrl + MouseWheel zoom
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return null; // This component doesn't render anything
}
