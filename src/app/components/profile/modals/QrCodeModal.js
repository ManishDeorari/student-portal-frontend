import React, { useRef } from "react";
import QRCode from "react-qr-code";
import { Download, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function QrCodeModal({ isOpen, onClose, publicId, name }) {
  const { darkMode } = useTheme();
  const qrRef = useRef(null);

  if (!isOpen) return null;

  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/profile/${publicId}` : `https://portal.com/profile/${publicId}`;

  const downloadQRCode = () => {
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    // Convert SVG to data URL
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Add white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${name.replace(/\s+/g, '_')}_QR_Code.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Modal */}
      <div className={`relative w-full max-w-sm rounded-2xl p-6 shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Connect with {name}</h2>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div 
            ref={qrRef}
            className="p-4 bg-white rounded-xl shadow-inner border border-gray-100"
          >
            <QRCode
              value={profileUrl}
              size={200}
              level="H"
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
          
          <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Scan this code to instantly view and connect on the portal.
          </p>

          {/* Download Button */}
          <button
            onClick={downloadQRCode}
            className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105"
          >
            <Download className="w-5 h-5" />
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
}
