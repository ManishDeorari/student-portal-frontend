import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

const filters = [
  { name: "Original", css: "none" }, // reset option
  { name: "Grayscale", css: "grayscale(100%)" },
  { name: "Sepia", css: "sepia(100%)" },
  { name: "Contrast", css: "contrast(150%)" },
  { name: "Brightness", css: "brightness(120%)" },
  { name: "Hue Rotate", css: "hue-rotate(90deg)" },
  { name: "Invert", css: "invert(100%)" },
  { name: "Saturate", css: "saturate(200%)" },
];

export default function ProfileImageFilters({ imageSrc, onComplete }) {
  const { darkMode } = useTheme();
  const [tempFilter, setTempFilter] = useState("Original"); // preview filter
  const originalImageRef = useRef(null);

  useEffect(() => {
    if (imageSrc && !originalImageRef.current) {
      originalImageRef.current = imageSrc; // store the very first image
    }
  }, [imageSrc]);

  const handleApply = () => {
    const css = filters.find((f) => f.name === tempFilter)?.css || "none";
    if (onComplete) {
      onComplete(imageSrc, css); // tell parent which filter is applied
    }
  };

  const handleReset = () => {
    setTempFilter("Original");
    if (onComplete && originalImageRef.current) {
      onComplete(originalImageRef.current, "none"); // restore to original
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Preview */}
      <div className="p-[3.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full mb-6 shadow-md border-transparent">
        <div className={`w-40 h-40 rounded-full overflow-hidden border-4 ${darkMode ? 'border-[#121213]' : 'border-[#FAFAFA]'}`}>
          <Image
            src={imageSrc}
            alt="Preview"
            width={160}
            height={160}
            className="w-full h-full object-cover"
            style={{
              filter: filters.find((f) => f.name === tempFilter)?.css || "none",
            }}
          />
        </div>
      </div>

      {/* Filters Thumbnails */}
      <div className="w-full p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-md mb-6">
        <div className={`flex gap-4 flex-wrap justify-center p-4 rounded-[calc(0.75rem-2.5px)] ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
          {filters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => setTempFilter(filter.name)}
              className={`flex flex-col items-center w-16 group transition-all transform hover:scale-105 active:scale-95`}
            >
              <div className={`w-14 h-14 rounded-full overflow-hidden mb-2 border-2 transition-colors ${tempFilter === filter.name ? 'border-blue-500' : (darkMode ? 'border-white/10 group-hover:border-white/30' : 'border-gray-200 group-hover:border-gray-300')}`}>
                <Image
                  src={imageSrc}
                  alt={filter.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  style={{ filter: filter.css }}
                />
              </div>
              <span className={`text-[9px] uppercase font-black tracking-widest text-center leading-tight ${tempFilter === filter.name ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-gray-400' : 'text-gray-600')}`}>{filter.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full justify-center mt-2">
        <button
          onClick={handleReset}
          className={`px-6 py-2.5 rounded-lg font-black uppercase tracking-widest text-[10px] shadow-sm transition-colors ${
              darkMode ? 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
          }`}
        >
          Reset Filter
        </button>
        <button
          onClick={handleApply}
          className={`px-6 py-2.5 rounded-lg font-black uppercase tracking-widest text-[10px] shadow-sm transition-colors ${
              darkMode ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
}
