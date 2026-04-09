// frontend/src/app/components/groups/modals/GroupImageCropperModal.js
"use client";
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, Check, RotateCw, RotateCcw } from "lucide-react";
import getProcessedGroupImg from "./groupImageUtils";
import { useTheme } from "@/context/ThemeContext";

export default function GroupImageCropperModal({ isOpen, imageSrc, onComplete, onClose }) {
  const { darkMode } = useTheme();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedArea); // Store the percentages for CSS usage
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      onComplete(null, null, {
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
        zoom: zoom
      });
      onClose();
    } catch (e) {
      console.error("Cropping error:", e);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`relative w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar ${darkMode ? "bg-gray-900 border-white/10" : "bg-[#FAFAFA] border-gray-100"}`}>
        
        {/* Header */}
        <div className="p-6 border-b dark:border-white/5 flex justify-between items-center">
          <h2 className={`text-xl font-black uppercase tracking-widest ${darkMode ? "text-white" : "text-gray-900"}`}>Adjust Group Photo</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#FAFAFA]/5 transition-colors">
            <X className="text-gray-500" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-[300px] bg-black/20">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Controls */}
        <div className="p-8 space-y-6">
          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Zoom Intensity</label>
                <span className="text-[10px] font-black text-blue-500">{Math.round(zoom * 100)}%</span>
             </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-blue-500/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-4">
               <button
                  onClick={() => setRotation((r) => r - 90)}
                  className={`p-3 rounded-2xl transition-all ${darkMode ? "bg-[#FAFAFA]/5 hover:bg-[#FAFAFA]/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
                  title="Rotate Left"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setRotation((r) => r + 90)}
                  className={`p-3 rounded-2xl transition-all ${darkMode ? "bg-[#FAFAFA]/5 hover:bg-[#FAFAFA]/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
                  title="Rotate Right"
                >
                  <RotateCw size={16} />
                </button>
            </div>

            <button
              onClick={handleConfirm}
              disabled={processing}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {processing ? "Processing..." : (
                <>
                  <Check size={12} />
                  <span>Apply &amp; Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
