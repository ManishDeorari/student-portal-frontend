"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, Maximize, Download } from "lucide-react";

export default function ImageViewerModal({ imageUrl, onClose, isRestricted }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = (e) => {
    e.stopPropagation();
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setOffset({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-4 backdrop-blur-xl overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={onClose}
    >
      {/* Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-[201]" onClick={e => e.stopPropagation()}>
        {scale > 1 && (
          <button
            onClick={handleReset}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 transition-all animate-in slide-in-from-right-2"
            title="Reset Zoom"
          >
            <Maximize size={20} />
          </button>
        )}
        <button
          onClick={handleZoomIn}
          className="bg-[#FAFAFA]/10 hover:bg-[#FAFAFA]/20 text-white rounded-full p-3 transition-all"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-[#FAFAFA]/10 hover:bg-[#FAFAFA]/20 text-white rounded-full p-3 transition-all"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <div className="w-[1px] h-8 bg-[#FAFAFA]/20 mx-1" />
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#FAFAFA]/10 hover:bg-[#FAFAFA]/20 text-white rounded-full p-3 transition-all"
          title="Download"
        >
          <Download size={20} />
        </a>
        <button
          onClick={onClose}
          className="bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-full p-3 transition-all"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Full image container */}
      <div 
        className={`relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200 cursor-grab active:cursor-grabbing ${isDragging ? 'duration-0' : ''}`}
        style={{ 
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
      >
        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-[0_20px_60px_rgba(37,99,235,0.4)]">
          <img
            src={imageUrl}
            alt="Full view"
            className={`max-w-[90vw] max-h-[90vh] object-contain rounded-[calc(1rem-2.5px)] shadow-2xl ${isRestricted ? 'select-none pointer-events-none' : ''}`}
            onContextMenu={(e) => isRestricted && e.preventDefault()}
            draggable={false}
          />
        </div>

        {/* Protective Overlay */}
        {isRestricted && (
          <div
            className="absolute inset-0 z-10"
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
      </div>
    </div>,
    document.body
  );
}
