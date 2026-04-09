import React, { useState } from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

export default function BannerImageAdjust({ imageUrl, onApply, onReset }) {
  const { darkMode } = useTheme();
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [hue, setHue] = useState(0);
  const [invert, setInvert] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [sharpen, setSharpen] = useState(0);
  const [darken, setDarken] = useState(0);

  const [activeAdjust, setActiveAdjust] = useState("Brightness");

  let tempFilter = "";
  if (temperature > 0) {
    tempFilter = `sepia(${temperature}%) hue-rotate(-10deg) saturate(110%)`;
  } else if (temperature < 0) {
    tempFilter = `sepia(${-temperature}%) hue-rotate(180deg) saturate(80%)`;
  }

  const filterStyle = `
    brightness(${brightness}%)
    contrast(${contrast}%)
    saturate(${saturation}%)
    blur(${blur}px)
    hue-rotate(${hue}deg)
    invert(${invert}%)
    grayscale(${grayscale}%)
    ${tempFilter}
  `;

  const handleApply = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    if (/^https?:\/\//i.test(imageUrl)) img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = filterStyle;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      if (darken > 0) {
        ctx.fillStyle = `rgba(0,0,0,${darken / 100})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], "banner_adjusted.jpg", { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        onApply(url, file);
      }, "image/jpeg", 0.92);
    };
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setHue(0);
    setInvert(0);
    setTemperature(0);
    setGrayscale(0);
    setSharpen(0);
    setDarken(0);
    onReset?.();
  };

  const adjustments = [
    { name: "Brightness", value: brightness, min: 50, max: 150, setter: setBrightness, suffix: "%" },
    { name: "Contrast", value: contrast, min: 50, max: 200, setter: setContrast, suffix: "%" },
    { name: "Saturation", value: saturation, min: 0, max: 200, setter: setSaturation, suffix: "%" },
    { name: "Blur", value: blur, min: 0, max: 10, setter: setBlur, suffix: "px" },
    { name: "Hue Rotate", value: hue, min: 0, max: 360, setter: setHue, suffix: "°" },
    { name: "Invert", value: invert, min: 0, max: 100, setter: setInvert, suffix: "%" },
    { name: "Darken", value: darken, min: 0, max: 100, setter: setDarken, suffix: "%" },
    { name: "Temperature", value: temperature, min: -100, max: 100, setter: setTemperature, suffix: "" },
    { name: "Grayscale", value: grayscale, min: 0, max: 100, setter: setGrayscale, suffix: "%" },
    { name: "Sharpen", value: sharpen, min: 0, max: 100, setter: setSharpen, suffix: "%" },
  ];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Rectangle Preview */}
      <div className="w-full p-[3.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-md border-transparent">
        <div className={`w-full h-40 rounded-[calc(1rem-3.5px)] overflow-hidden border-4 ${darkMode ? 'border-[#121213]' : 'border-[#FAFAFA]'} relative`}>
          <Image
            src={imageUrl}
            alt="Adjust Preview"
            width={800}
            height={160}
            className="w-full h-full object-cover"
            style={{ filter: filterStyle }}
          />
          {darken > 0 && (
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{ backgroundColor: `rgba(0,0,0,${darken / 100})` }}
            />
          )}
        </div>
      </div>

      {/* Adjustment Buttons */}
      <div className="w-full p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-md mb-6">
        <div className={`grid grid-cols-2 sm:grid-cols-5 gap-2 p-4 rounded-[calc(0.75rem-2.5px)] ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
          {adjustments.map((adj) => (
            <button
              key={adj.name}
              onClick={() => setActiveAdjust(adj.name)}
              className={`px-2 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg border-2 transition-colors ${
                  activeAdjust === adj.name 
                      ? (darkMode ? "bg-blue-900/40 border-blue-500/50 text-blue-400" : "bg-blue-100 border-blue-300 text-blue-700") 
                      : (darkMode ? "bg-[#121213] border-white/10 text-gray-400 hover:text-white hover:border-white/20" : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200")
              }`}
            >
              {adj.name}
            </button>
          ))}
        </div>
      </div>

      {/* Slider */}
      <div className="w-full sm:w-64 max-w-sm p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-md">
        <div className={`w-full p-4 rounded-[calc(0.75rem-2.5px)] ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
          {adjustments
            .filter((adj) => adj.name === activeAdjust)
            .map((adj) => (
              <Slider
                key={adj.name}
                label={adj.name}
                value={adj.value}
                min={adj.min}
                max={adj.max}
                onChange={adj.setter}
                suffix={adj.suffix}
                darkMode={darkMode}
              />
            ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleReset}
          className={`px-6 py-2.5 rounded-lg font-black uppercase tracking-widest text-[10px] shadow-sm transition-colors ${ darkMode ? 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900' }`}
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className={`px-6 py-2.5 rounded-lg font-black uppercase tracking-widest text-[10px] shadow-sm transition-colors ${ darkMode ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-green-600 text-white hover:bg-green-700' }`}
        >
          Apply Adjustments
        </button>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, onChange, suffix = "", darkMode }) {
  return (
    <div>
      <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}: {value}{suffix}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: darkMode ? "#333" : "#e5e7eb",
          accentColor: "#3b82f6",
        }}
      />
    </div>
  );
}
