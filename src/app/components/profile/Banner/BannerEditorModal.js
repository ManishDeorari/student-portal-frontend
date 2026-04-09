"use client";

import { X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import BannerImageCropper from "./BannerImageCropper";
import BannerImageFilters from "./BannerImageFilters";
import BannerImageAdjust from "./BannerImageAdjust";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

export default function BannerEditorModal({ onClose, onUploaded, userId, currentImage }) {
  const { darkMode } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || "/default_banner.jpg");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const adjustOriginalRef = useRef({ url: null, file: null });
  const [adjustKey, setAdjustKey] = useState(0);


  const fileInputRef = useRef();

  // When user selects a new file, store it as the ORIGINAL
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 🚫 Block GIFs and animated formats
    if (file.type === "image/gif") {
      toast.error("GIFs or animated images are not allowed for banners.");
      e.target.value = null; // reset input
      return;
    }

    const url = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(url);

    // Save original for Reset
    adjustOriginalRef.current = { url, file };
  };

  const handleApplyUpload = async () => {
    if (!selectedFile || !userId) {
      toast.error("Please select a banner image first.");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("token");

      // Fetch latest profile to get current banner
      const latestProfileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const latestProfile = await latestProfileRes.json();
      const latestBanner = latestProfile?.bannerImage || null;

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      const newPublicId = `user_${userId}_banner_${Date.now()}`;
      formData.append("public_id", newPublicId);

      const uploadRes = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();

      if (!uploadRes.ok || !uploadJson.secure_url) {
        toast.error("❌ Upload to Cloudinary failed.");
        return;
      }

      // Update backend (bannerImage field)
      const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bannerImage: uploadJson.secure_url,
          oldImageUrl: latestBanner && !latestBanner.includes("default_banner.jpg") ? latestBanner : null,
        }),
      });

      if (!backendRes.ok) {
        toast.error("❌ Failed to update banner in backend.");
        return;
      }

      if (typeof onUploaded === "function") onUploaded(uploadJson.secure_url);

      // Optional: delete old Cloudinary banner
      if (latestBanner && !latestBanner.includes("default_banner.jpg")) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/delete-old-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ imageUrl: latestBanner }),
        }).catch((err) => console.warn("⚠ Failed to delete old banner:", err));
      }

      toast.success("✅ Banner updated!");
      setSelectedFile(null);
      setActiveTab(null);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!userId) return toast.error("No user found.");

    try {
      const token = localStorage.getItem("token");

      const latestProfileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const latestProfile = await latestProfileRes.json();
      const latestBanner = latestProfile?.bannerImage || null;

      const defaultBannerUrl = "/default_banner.jpg";

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bannerImage: defaultBannerUrl, oldImageUrl: latestBanner && !latestBanner.includes("default-banner.jpg") ? latestBanner : null }),
      });

      if (!res.ok) return toast.error("Failed to delete banner.");

      setPreviewUrl(defaultBannerUrl);
      if (typeof onUploaded === "function") onUploaded(defaultBannerUrl);
      toast.success("✅ Banner deleted and set to default!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while deleting.");
    }
  };

  return (
    <>
    <LoadingOverlay isVisible={uploading} message="Uploading Banner..." />
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-5xl">
        <div className={`rounded-[calc(2.5rem-2.5px)] p-6 relative max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-[#121213] text-white' : 'bg-[#FAFAFA] text-black'}`}>
          <button onClick={onClose} className={`absolute top-4 right-4 transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
            <X size={24} />
          </button>

        <h2 className={`text-xl font-black uppercase tracking-widest mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>Banner Image</h2>

        <div className="flex justify-center mb-6 w-full">
          <div className="relative w-full h-[192px] p-[3.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)]">
            <Image
              src={previewUrl || currentImage || "/default_banner.jpg"}
              alt="Preview"
              fill
              className={`object-cover rounded-[calc(1rem-3.5px)] border-4 ${darkMode ? 'border-[#121213]' : 'border-[#FAFAFA]'} shadow-inner`}
            />
          </div>
        </div>

        {/* Tabs + Reset */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 items-center border-b border-dashed border-gray-200 dark:border-white/10 pb-6 shadow-sm">
          {["crop", "filters", "adjust"].map((tab) => (
            <div key={tab} className={`p-[1.5px] bg-gradient-to-tr ${activeTab === tab ? 'from-blue-500 to-purple-500' : (darkMode ? 'from-slate-700 to-slate-800' : 'from-gray-300 to-gray-400')} rounded-xl shadow-sm transition-all`}>
              <button
                onClick={() => { if (!selectedFile) return; setActiveTab(activeTab === tab ? null : tab); }}
                disabled={!selectedFile}
                className={`px-6 py-2.5 rounded-[calc(0.75rem-1.5px)] text-[10px] font-black uppercase tracking-widest transition-colors ${
                    activeTab === tab 
                        ? (darkMode ? "bg-blue-900/40 text-blue-400" : "bg-blue-50 text-blue-700") 
                        : (darkMode ? "bg-[#121213] text-gray-400 hover:text-white" : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50")
                } ${!selectedFile ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                title={!selectedFile ? "Select a new banner first" : `Open ${tab}`}
              >
                {tab}
              </button>
            </div>
          ))}

          {/* Reset Button */}
          {selectedFile && (
            <div className="p-[1.5px] bg-gradient-to-tr from-orange-500 to-red-500 rounded-xl shadow-sm transition-all">
              <button
                onClick={() => {
                  const { url, file } = adjustOriginalRef.current || {};
                  if (url) setPreviewUrl(url);
                  if (file) setSelectedFile(file);
                  setActiveTab(null);
                  setAdjustKey((k) => k + 1); // re-render adjust tool cleanly
                }}
                className={`px-6 py-2.5 rounded-[calc(0.75rem-1.5px)] text-[10px] font-black uppercase tracking-widest ${
                    darkMode ? "bg-[#121213] text-orange-400 hover:text-orange-300 hover:bg-orange-950/30" : "bg-white text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                }`}
                title="Reset adjustments"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Subsection */}
        {activeTab && (
          <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-xl relative top-0 z-10 w-full animate-fadeIn">
            <div className={`flex justify-center items-center py-6 px-6 rounded-[calc(1rem-2.5px)] min-h-[160px] ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
            {activeTab === "crop" && selectedFile && (
              <BannerImageCropper
                imageSrc={previewUrl}
                onComplete={(croppedImg) => {
                  setPreviewUrl(croppedImg);
                  fetch(croppedImg)
                    .then((res) => res.blob())
                    .then((blob) =>
                      setSelectedFile(
                        new File([blob], "banner.jpg", { type: blob.type })
                      )
                    );
                }}
                aspectRatio={16 / 5}
              />
            )}

            {activeTab === "filters" && selectedFile && (
              <BannerImageFilters
                imageSrc={previewUrl}
                onComplete={(img, css) => {
                  setPreviewUrl(img);
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");
                  const image = new Image();
                  image.src = img;
                  image.onload = () => {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.filter = css;
                    ctx.drawImage(image, 0, 0, image.width, image.height);
                    canvas.toBlob((blob) => {
                      if (blob) {
                        setSelectedFile(
                          new File([blob], "banner_filtered.jpg", {
                            type: blob.type,
                          })
                        );
                        setPreviewUrl(URL.createObjectURL(blob));
                      }
                    }, "image/jpeg");
                  };
                }}
              />
            )}

            {activeTab === "adjust" && selectedFile && (
              <BannerImageAdjust
                key={adjustKey}
                imageUrl={previewUrl}
                onApply={(url, file) => {
                  setPreviewUrl(url);
                  setSelectedFile(file);
                }}
                onReset={() => {
                  const { url, file } = adjustOriginalRef.current || {};
                  if (url) setPreviewUrl(url);
                  if (file) setSelectedFile(file);
                  setAdjustKey((k) => k + 1);
                }}
              />
            )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-8 pt-4 border-t border-dashed border-gray-200 dark:border-white/10">
          
          <div className="w-full sm:w-auto p-[2.5px] bg-gradient-to-tr from-red-500 to-rose-600 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 active:scale-95">
            <button
              onClick={handleDeleteBanner}
              className={`px-8 py-3 rounded-[calc(0.75rem-2.5px)] text-xs font-black uppercase tracking-widest w-full h-full ${
                  darkMode ? "bg-black text-rose-500 hover:bg-slate-900" : "bg-white text-rose-600 hover:bg-rose-50"
              }`}
              title="Delete current banner and set default"
            >
              Delete Banner
            </button>
          </div>

          <div className="w-full sm:w-auto">
            {selectedFile ? (
              <div className="p-[2.5px] bg-gradient-to-tr from-gray-400 to-gray-500 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 active:scale-95 w-full">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(currentImage || "/default_banner.jpg");
                    setActiveTab(null);
                  }}
                  className={`px-8 py-3 rounded-[calc(0.75rem-2.5px)] text-xs font-black uppercase tracking-widest w-full h-full ${
                      darkMode ? "bg-black text-gray-400 hover:bg-slate-900" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Cancel changes and keep previous banner"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 active:scale-95 w-full">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className={`px-8 py-3 rounded-[calc(0.75rem-2.5px)] text-xs font-black uppercase tracking-widest w-full h-full ${
                      darkMode 
                          ? "bg-[#121213] text-white hover:bg-slate-900/80" 
                          : "bg-[#FAFAFA] text-gray-900 hover:bg-white"
                  }`}
                  title="Select a new banner to change"
                >
                  Change Banner
                </button>
              </div>
            )}
          </div>

          <div className="w-full sm:w-auto p-[2.5px] bg-gradient-to-tr from-green-500 to-teal-500 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 active:scale-95">
            <button
              onClick={handleApplyUpload}
              disabled={uploading}
              className={`px-8 py-3 rounded-[calc(0.75rem-2.5px)] text-xs font-black uppercase tracking-widest w-full h-full disabled:opacity-50 ${
                  darkMode ? "bg-black text-white hover:bg-slate-900" : "bg-white text-green-700 hover:bg-green-50"
              }`}
              title="Apply all changes and update banner"
            >
              {uploading ? "Applying..." : "Apply Changes"}
            </button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        </div>
      </div>
    </div>
    </>
  );
}
