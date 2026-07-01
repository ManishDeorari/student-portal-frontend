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
  const [activeTab, setActiveTab] = useState("crop"); // default to crop since it's the only tab
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

      if (uploadedUrl && latestImage && !latestImage.includes("default-profile.jpg")) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/delete-old-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ imageUrl: latestImage }),
        }).catch((err) => console.warn("⚠ Failed to delete old image:", err));
      }

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
      const latestImage = latestProfile?.profileImage || null;

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
              src={previewUrl || currentImage || "/default-profile.jpg\
        <h2 className={`text-xl font-black uppercase tracking-widest mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile Image</h2>

        <div className="flex justify-center mb-6">
          <div className="relative w-40 h-40 rounded-full p-[3.5px] bg-gradient-to-tr from-blue-600 to-purple-600 shadow-[0_10px_30px_rgba(37,99,235,0.4)]">
            <Image
              src={previewUrl || currentImage || "/default-profile.jpg\