"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, Maximize, Download, ChevronLeft, ChevronRight } from "lucide-react";

export default function FullImageViewer({ images, startIndex, onClose, isRestricted }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentIndex(startIndex);
    handleReset(); // Reset zoom when starting
  }, [startIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, currentIndex]);

  if (!images || images.length === 0) return null;

  const next = (e) => {
    if (e) e.stopPropagation();
    handleReset();
    setCurrentIndex((prevIdx) => (prevIdx + 1) % images.length);
  };

  const prev = (e) => {
    if (e) e.stopPropagation();
    handleReset();
    setCurrentIndex((prevIdx) => (prevIdx - 1 + images.length) % images.length);
  };

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setScale((prev) => {
      const nextScale = Math.max(prev - 0.5, 1);
      if (nextScale === 1) setOffset({ x: 0, y: 0 });
      return nextScale;
    });
  };

  const handleReset = (e) => {
    if (e) e.stopPropagation();
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-4 backdrop-blur-xl overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={onClose}
      >
        {/* Controls Overlay */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-[10002]" onClick={e => e.stopPropagation()}>
          {scale > 1 && (
            <button
              onClick={handleReset}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 transition-all shadow-lg active:scale-95"
              title="Reset Zoom"
            >
              <Maximize size={20} />
            </button>
          )}
          <button
            onClick={handleZoomIn}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all backdrop-blur-md"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all backdrop-blur-md"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <div className="w-[1px] h-8 bg-white/20 mx-1" />
          <a
            href={images[currentIndex]}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all backdrop-blur-md"
            title="Download"
            onClick={e => e.stopPropagation()}
          >
            <Download size={20} />
          </a>
          <button
            onClick={onClose}
            className="bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-full p-3 transition-all backdrop-blur-md"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Gallery Counter */}
        {images.length > 1 && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-black tracking-widest z-[10002]">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && scale === 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all z-[10002] backdrop-blur-md group active:scale-90"
            >
              <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={next}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all z-[10002] backdrop-blur-md group active:scale-90"
            >
              <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </>
        )}

        {/* Image Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200 cursor-grab active:cursor-grabbing select-none"
          style={{ 
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
        >
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className={`max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl transition-shadow ${isRestricted ? 'select-none pointer-events-none shadow-none' : ''}`}
            onContextMenu={(e) => isRestricted && e.preventDefault()}
            draggable={false}
          />

          {/* Protective Overlay */}
          {isRestricted && (
            <div
              className="absolute inset-0 z-10"
              onContextMenu={(e) => e.preventDefault()}
            />
          )}
        </motion.div>

        {/* Navigation Tap Zones (Only when not zoomed) */}
        {images.length > 1 && scale === 1 && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-1/4 z-[10001] cursor-w-resize" onClick={prev} />
            <div className="absolute right-0 top-0 bottom-0 w-1/4 z-[10001] cursor-e-resize" onClick={next} />
          </>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
