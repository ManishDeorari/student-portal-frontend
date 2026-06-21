import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileImageCropper({ imageSrc, onComplete }) {
  const { darkMode } = useTheme();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedAreaPct, setCroppedAreaPct] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPct(croppedArea);
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFixPosition = async () => {
    if (!croppedAreaPixels || !croppedAreaPct) return;
    try {
      const focalX = croppedAreaPixels.x + croppedAreaPixels.width / 2;
      const focalY = croppedAreaPixels.y + croppedAreaPixels.height / 2;
      
      const pctX = croppedAreaPct.x + croppedAreaPct.width / 2;
      const pctY = croppedAreaPct.y + croppedAreaPct.height / 2;
      
      if (onComplete) {
        onComplete(null, { x: focalX, y: focalY, pctX, pctY });
      }
    } catch (e) {
      console.error("Fix position error:", e);
    }
  };

  return (
    <div
      className="relative w-full max-w-[320px] mx-auto p-2 overflow-y-auto"
      style={{ maxHeight: "90vh" }}
    >
      {/* Cropper area */}
      <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-md w-full mb-2">
        <div className="relative w-full h-[220px] bg-black/90 rounded-[calc(1rem-2.5px)] overflow-hidden flex items-center justify-center">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      </div>

      {/* Zoom Slider */}
      <div className="w-full mt-4 p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-md">
        <div className={`w-full p-4 rounded-[calc(0.75rem-2.5px)] flex flex-col items-center ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: darkMode ? "#333" : "#e5e7eb",
              accentColor: "#3b82f6",
            }}
          />
        </div>
      </div>

      {/* Fix Position */}
      <button
        onClick={handleFixPosition}
        className={`px-4 py-3 rounded-lg font-black uppercase tracking-widest text-xs mt-6 w-full shadow-sm transition-colors ${
            darkMode ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/40' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        title="Set focus point and save"
      >
        Set Focus Point
      </button>
    </div>
  );
}
