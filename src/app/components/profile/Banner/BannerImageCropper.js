import React, { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import { RotateCw, RotateCcw } from "lucide-react";
import getCroppedImg from "../Avatar/cropImageUtils";
import { useTheme } from "@/context/ThemeContext";

export default function BannerImageCropper({ imageSrc, onComplete }) {
  const { darkMode } = useTheme();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Store original image for reset
  const originalImageRef = useRef(null);

  useEffect(() => {
    if (imageSrc && !originalImageRef.current) {
      originalImageRef.current = imageSrc;
    }
  }, [imageSrc]);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    if (onComplete && originalImageRef.current) {
      onComplete(originalImageRef.current);
    }
  };

  const handleFixPosition = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      if (onComplete) {
        onComplete(croppedImage);
      }
    } catch (e) {
      console.error("Fix position error:", e);
    }
  };

  return (
    <div
      className="relative w-full max-w-3xl mx-auto p-2 overflow-y-auto"
      style={{ maxHeight: "90vh" }}
    >
      {/* Cropper area */}
      <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-md w-full mb-2">
        <div className="relative w-full h-[300px] bg-black/90 rounded-[calc(1rem-2.5px)] overflow-hidden flex items-center justify-center">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={16 / 5}      // ✅ rectangle for banner
            cropShape="rect"     // ✅ rectangle instead of circle
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
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
            className="w-full h-2 rounded-lg cursor-pointer appearance-none"
            style={{
              background: darkMode ? "#333" : "#e5e7eb",
              accentColor: "#3b82f6",
            }}
          />
        </div>
      </div>

      {/* Buttons row */}
      <div className="w-full mt-4 p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-md">
        <div className={`flex justify-center gap-4 p-4 rounded-[calc(0.75rem-2.5px)] ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
          <button
            onClick={() => setRotation((r) => r - 90)}
            className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-white/10 hover:bg-white/20 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
            title="Rotate Left"
          >
            <RotateCcw size={22} />
          </button>
          <button
            onClick={() => setRotation((r) => r + 90)}
            className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-white/10 hover:bg-white/20 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
            title="Rotate Right"
          >
            <RotateCw size={22} />
          </button>
          <button
            onClick={handleReset}
            className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-white/10 hover:bg-red-900/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-500'}`}
            title="Reset to Original"
          >
            <RotateCcw size={22} />
          </button>
        </div>
      </div>

      {/* Fix Position */}
      <button
        onClick={handleFixPosition}
        className={`px-4 py-3 rounded-lg font-black uppercase tracking-widest text-xs mt-6 w-full shadow-sm transition-colors ${
            darkMode ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/40' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        title="Apply current crop and save"
      >
        Fix Position
      </button>
    </div>
  );
}
