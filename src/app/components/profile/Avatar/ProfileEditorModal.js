"use client";

import { X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import ProfileImageCropper from "./ProfileImageCropper";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

export default function ProfileEditorModal({ onClose, onUploaded, userId, currentImage, currentFocus }) {
  const { darkMode } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || "/default-profile.jpg");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // default to null as requested by user
  const [profileImageFocus, setProfileImageFocus] = useState(currentFocus || null);
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    
    // Fix initial focus for PFP if pctX is missing
    if (currentFocus && currentFocus.x !== undefined && currentFocus.pctX === undefined && currentImage) {
      const img = new window.Image();
      img.onload = () => {
        if (img.width && img.height) {
          setProfileImageFocus({
            x: currentFocus.x,
            y: currentFocus.y,
            pctX: (currentFocus.x / img.width) * 100,
            pctY: (currentFocus.y / img.height) * 100
          });
        }
      };
      if (/^https?:\/\//i.test(currentImage)) img.crossOrigin = "anonymous";
      img.src = currentImage;
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [currentFocus, currentImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === "image/gif") {
      toast.error("GIFs or animated images are not allowed for profile pictures.");
      e.target.value = null;
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setProfileImageFocus(null); // Reset focus for new image
  };

  const handleRotate = async (degrees) => {
    if (!previewUrl || previewUrl.includes("default-profile.jpg")) return;
    try {
      setUploading(true);
      const img = new window.Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        if (/^https?:\/\//i.test(previewUrl)) img.crossOrigin = "anonymous";
        img.src = previewUrl;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (degrees === 90 || degrees === 270 || degrees === -90 || degrees === -270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      canvas.toBlob((blob) => {
        if (!blob) {
          setUploading(false);
          return toast.error("Failed to rotate image.");
        }
        const newFile = new File([blob], `rotated_${Date.now()}.jpg`, { type: "image/jpeg" });
        const newUrl = URL.createObjectURL(blob);
        setSelectedFile(newFile);
        setPreviewUrl(newUrl);
        setProfileImageFocus(null); // Focus invalid after rotation
        setUploading(false);
      }, "image/jpeg", 0.95);
    } catch (e) {
      console.error(e);
      toast.error("Failed to rotate image.");
      setUploading(false);
    }
  };

  const handleApplyUpload = async () => {
    if (!selectedFile && !profileImageFocus && !userId) {
      toast.error("Please select an image or set focus first.");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("token");

      const latestProfileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const latestProfile = await latestProfileRes.json();
      const latestImage = latestProfile?.profilePicture || null;

      let uploadedUrl = null;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", "student/profiles/avatars");
        const newPublicId = `avatar_${crypto.randomUUID()}_${Date.now()}`;
        formData.append("public_id", newPublicId);

        const uploadRes = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, { method: "POST", body: formData });
        const uploadJson = await uploadRes.json();

        if (!uploadRes.ok || !uploadJson.secure_url) {
          toast.error("❌ Upload to Cloudinary failed.");
          return;
        }
        uploadedUrl = uploadJson.secure_url;
      }

      const updatePayload = {
        profileImageFocus: profileImageFocus || undefined
      };
      
      if (uploadedUrl) {
        updatePayload.profileImage = uploadedUrl;
        updatePayload.oldImageUrl = latestImage && !latestImage.includes("default-profile.jpg") ? latestImage : null;
      }

      const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatePayload),
      });

      if (!backendRes.ok) {
        toast.error("❌ Failed to update profile in backend.");
        return;
      }

      if (typeof onUploaded === "function") onUploaded(uploadedUrl || latestImage);

      if (typeof onUploaded === "function") onUploaded(uploadedUrl || latestImage);

      toast.success("✅ Profile updated!");
      setSelectedFile(null);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!userId) return toast.error("No user found.");

    try {
      const token = localStorage.getItem("token");

      const latestProfileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const latestProfile = await latestProfileRes.json();
      const latestImage = latestProfile?.profilePicture || null;

      const defaultImageUrl = "/default-profile.jpg";

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          profileImage: defaultImageUrl,
          oldImageUrl: latestImage && !latestImage.includes("default-profile.jpg") ? latestImage : null,
        }),
      });

      if (!res.ok) return toast.error("Failed to delete photo.");

      setPreviewUrl(defaultImageUrl);
      if (typeof onUploaded === "function") onUploaded(defaultImageUrl);

      toast.success("✅ Photo deleted and set to default!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while deleting.");
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
    <LoadingOverlay isVisible={uploading} message="Processing..." />
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-start justify-center p-4 pt-[5vh] overflow-y-auto custom-scrollbar">
      <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-3xl">
        <div className={`rounded-[calc(2.5rem-2.5px)] p-6 relative max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-[#121213] text-white' : 'bg-[#FAFAFA] text-black'}`}>
          <button onClick={onClose} className={`absolute top-4 right-4 transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
            <X size={24} />
          </button>

        <h2 className={`text-xl font-black uppercase tracking-widest mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile Image</h2>

        <div className="flex justify-center mb-6">
          <div className="relative w-40 h-40 rounded-full p-[3.5px] bg-gradient-to-tr from-blue-600 to-purple-600 shadow-[0_10px_30px_rgba(37,99,235,0.4)]">
            <Image
              src={previewUrl || currentImage || "/default-profile.jpg"}
              alt="Preview"
              fill
              className={`object-cover border-4 ${darkMode ? 'border-[#121213]' : 'border-[#FAFAFA]'} rounded-full`}
              style={profileImageFocus?.pctX ? { objectPosition: `${profileImageFocus.pctX}% ${profileImageFocus.pctY}%` } : {}}
            />
          </div>
        </div>

        {/* Tools row */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 items-center border-b border-dashed border-gray-200 dark:border-white/10 pb-6 shadow-sm">
          <div className={`p-[2.5px] bg-gradient-to-tr ${activeTab === 'crop' ? 'from-blue-600 to-purple-600' : 'from-gray-400 to-gray-500'} rounded-xl shadow-lg transition transform hover:-translate-y-0.5 active:scale-95`}>
            <button
              onClick={() => setActiveTab(activeTab === "crop" ? null : "crop")}
              className={`px-6 py-2.5 rounded-[calc(0.75rem-2.5px)] text-[10px] font-black uppercase tracking-widest w-full h-full ${
                  activeTab === "crop" 
                      ? (darkMode ? "bg-black text-blue-400" : "bg-white text-blue-600") 
                      : (darkMode ? "bg-black text-gray-400 hover:bg-slate-900" : "bg-white text-gray-600 hover:bg-gray-50")
              }`}
            >
              Focus
            </button>
          </div>

          <div className="p-[2.5px] bg-gradient-to-tr from-gray-400 to-gray-500 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 active:scale-95">
            <button
              onClick={() => handleRotate(-90)}
              className={`px-4 py-2.5 rounded-[calc(0.75rem-2.5px)] text-[10px] font-black uppercase tracking-widest w-full h-full ${darkMode ? "bg-black text-gray-400 hover:bg-slate-900" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              title="Rotate Left"
            >
              Rotate Left
            </button>
          </div>

          <div className="p-[2.5px] bg-gradient-to-tr from-gray-400 to-gray-500 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 active:scale-95">
            <button
              onClick={() => handleRotate(90)}
              className={`px-4 py-2.5 rounded-[calc(0.75rem-2.5px)] text-[10px] font-black uppercase tracking-widest w-full h-full ${darkMode ? "bg-black text-gray-400 hover:bg-slate-900" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              title="Rotate Right"
            >
              Rotate Right
            </button>
          </div>

          {(selectedFile || profileImageFocus) && (
            <div className="p-[2.5px] bg-gradient-to-tr from-orange-500 to-red-500 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 active:scale-95">
              <button
                onClick={() => {
                  setPreviewUrl(currentImage || "/default-profile.jpg");
                  setSelectedFile(null);
                  setProfileImageFocus(currentFocus || null);
                  setActiveTab("crop");
                }}
                className={`px-6 py-2.5 rounded-[calc(0.75rem-2.5px)] text-[10px] font-black uppercase tracking-widest w-full h-full ${
                    darkMode ? "bg-black text-orange-400 hover:bg-slate-900 hover:text-orange-300" : "bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                }`}
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Cropper Section */}
        {activeTab === "crop" && !previewUrl.includes("default-profile.jpg") && (
          <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-xl relative top-0 z-10 w-full animate-fadeIn">
            <div className={`flex justify-center items-center py-6 px-6 rounded-[calc(1rem-2.5px)] min-h-[160px] ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
              <ProfileImageCropper
                imageSrc={previewUrl}
                onComplete={(croppedImg, focusPoint) => {
                  if (focusPoint) {
                    setProfileImageFocus(focusPoint);
                    toast.success("Focus point set! Click Apply Changes to save.");
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-8 pt-4 border-t border-dashed border-gray-200 dark:border-white/10">
          
          <div className="w-full sm:w-auto p-[2.5px] bg-gradient-to-tr from-red-500 to-rose-600 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 active:scale-95">
            <button
              onClick={handleDeletePhoto}
              className={`px-8 py-3 rounded-[calc(0.75rem-2.5px)] text-xs font-black uppercase tracking-widest w-full h-full ${
                  darkMode ? "bg-black text-rose-500 hover:bg-slate-900" : "bg-white text-rose-600 hover:bg-rose-50"
              }`}
            >
              Delete Photo
            </button>
          </div>

          <div className="w-full sm:w-auto">
            {selectedFile ? (
              <div className="p-[2.5px] bg-gradient-to-tr from-gray-400 to-gray-500 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 active:scale-95 w-full">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(currentImage || "/default-profile.jpg");
                    setProfileImageFocus(currentFocus || null);
                  }}
                  className={`px-8 py-3 rounded-[calc(0.75rem-2.5px)] text-xs font-black uppercase tracking-widest w-full h-full ${
                      darkMode ? "bg-black text-gray-400 hover:bg-slate-900" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
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
                >
                  Change Photo
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
            >
              {uploading ? "Applying..." : "Apply Changes"}
            </button>
          </div>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
      </div>
    </div>
    </>,
    document.body
  );
}
