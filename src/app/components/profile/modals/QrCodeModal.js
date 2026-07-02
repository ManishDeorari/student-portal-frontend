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
              className={`p-1 border-2 transition rounded-xl ${darkMode ? "border-white text-white hover:bg-white/20" : "border-black text-black hover:bg-black/10"}`}
            >
              <X className="w-5 h-5" />
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

            {/* Profile ID label */}
            <div className="text-center">
              <p className={`text-xs font-black uppercase tracking-widest mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Public ID
              </p>
              <span className={`text-base font-bold px-3 py-1 rounded-lg ${darkMode ? "bg-white/5 text-white" : "bg-gray-100 text-gray-800"}`}>
                @{publicId}
              </span>
            </div>

            {/* Copyable URL row */}
            <div className="w-full">
              <p className={`text-xs font-black uppercase tracking-widest mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Profile URL
              </p>
              <div className="p-[2px] bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl">
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                  <LinkIcon className={`w-4 h-4 flex-shrink-0 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                  <span className={`text-xs font-semibold truncate flex-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {profileUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10 text-blue-400" : "hover:bg-blue-50 text-blue-600"}`}
                    title="Copy link"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full grid grid-cols-2 gap-3">
              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-2.5 font-bold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              {/* Download QR */}
              <button
                onClick={downloadQRCode}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 font-bold rounded-xl border-2 hover:scale-[1.02] active:scale-95 transition-all ${darkMode ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
              >
                <Download className="w-4 h-4" />
                Download QR
              </button>
            </div>

            <p className={`text-center text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              Scan the QR code to instantly view this profile on the portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
