"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle({ bottomOffset = 32, rightOffset = 32 }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [zoom, setZoom] = useState(1);
  const [baseRatio, setBaseRatio] = useState(1);

  useEffect(() => {
    setBaseRatio(window.devicePixelRatio || 1);
    const updateZoom = () => {
      const currentRatio = window.devicePixelRatio || 1;
      const factor = currentRatio / (baseRatio || 1);
      setZoom(factor);
    };
    window.addEventListener("resize", updateZoom);
    updateZoom();
    return () => window.removeEventListener("resize", updateZoom);
  }, [baseRatio]);

  const scale = 1 / zoom;
  
  return (
    <div 
      className="fixed z-[100] transition-all duration-300 ease-out"
      style={{ 
        bottom: `${bottomOffset * scale}px`, 
        right: `${rightOffset * scale}px`,
        transform: `scale(${scale})`,
        transformOrigin: "bottom right"
      }}
    >
      <div className="p-[2px] bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-[2rem] shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group">
        <button
          onClick={toggleDarkMode}
          className={`p-5 rounded-[calc(2rem-2px)] backdrop-blur-2xl transition-all duration-500 flex items-center justify-center ${
            darkMode ? "bg-black/80 text-yellow-400" : "bg-white/90 text-blue-600"
          }`}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <Sun size={24} className="animate-spin-slow" />
          ) : (
            <Moon size={24} className="animate-pulse" />
          )}
        </button>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
