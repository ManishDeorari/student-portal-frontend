import React, { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Download, X, Copy, Check, Share2, Link as LinkIcon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";

export default function QrCodeModal({ isOpen, onClose, publicId, name }) {
  const { darkMode } = useTheme();
  const qrRef = useRef(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/profile/${publicId}`
    : `https://portal.com/profile/${publicId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("Profile link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name}'s Profile`,
          text: `Check out ${name}'s profile on the portal!`,
          url: profileUrl,
        });
      } catch (err) {
        // User cancelled share — do nothing
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy();
    }
  };

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${name.replace(/\s+/g, "_")}_QR_Code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm p-[2.5px] bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 rounded-[calc(1rem+2.5px)] shadow-2xl overflow-hidden transform transition-all duration-300 scale-100">
        <div className={`relative w-full h-full rounded-2xl ${darkMode ? "bg-[#121213] text-white" : "bg-white text-gray-900"}`}>

          {/* Header */}
          <div className={`flex items-center justify-between p-5 border-b ${darkMode ? "border-white/10" : "border-gray-100"}`}>
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                Share Profile
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-[2px] rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 group transition-all hover:scale-105`}
            >
              <div className={`p-1 rounded-full ${darkMode ? 'bg-[#121213] group-hover:bg-slate-900' : 'bg-white group-hover:bg-gray-50'}`}>
                  <X className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} />
              </div>
            </button>
          </div>

          <div className="p-6 flex flex-col items-center gap-5">
            {/* QR Code */}
            <div
              ref={qrRef}
              className="p-[3px] bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-[1rem] shadow-lg"
            >
              <div className="bg-white rounded-[calc(1rem-3px)] p-4 flex items-center justify-center">
                <QRCode
                  value={profileUrl}
                  size={180}
                  level="H"
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
            </div>

            {/* Download QR Button */}
            <button
              onClick={downloadQRCode}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-bold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>

            {/* Profile ID label with Copy */}
            <div className="w-full flex flex-col items-center mt-2">
              <p className={`text-xs font-black uppercase tracking-widest mb-2 ${darkMode ? "text-white" : "text-black"}`}>
                Public ID
              </p>
              <div className="flex items-center gap-2 justify-center">
                <span className={`text-lg font-bold px-4 py-2 rounded-lg ${darkMode ? "bg-white/10 text-white" : "bg-gray-100 text-black"}`}>
                  @{publicId}
                </span>
                <button
                  onClick={handleCopy}
                  className={`p-2.5 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10 text-white" : "hover:bg-gray-200 text-black"}`}
                  title="Copy Profile Link"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-bold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>

            {/* Footer Text */}
            <p className={`text-center text-xs font-bold mt-2 ${darkMode ? "text-white" : "text-black"}`}>
              Scan the QR code to instantly view this profile on the portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
