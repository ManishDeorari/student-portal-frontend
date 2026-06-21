"use client";

import React, { useState } from "react";
import { X, FileText, Github, Globe, Loader2, UploadCloud, Info } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";

export default function EditResumeAndLinksModal({ isOpen, onClose, currentData, onSave }) {
  const { darkMode } = useTheme();
  
  const isInitialCloudinary = currentData?.resume?.includes("res.cloudinary.com") || !currentData?.resume;
  const [resumeInputType, setResumeInputType] = useState(isInitialCloudinary ? "file" : "link");
  const [resumeFile, setResumeFile] = useState(null);
  const [isDeletedLocally, setIsDeletedLocally] = useState(false);
  const [formData, setFormData] = useState({
    resumeLink: !isInitialCloudinary ? (currentData?.resume || "") : "",
    github: currentData?.github || "",
    portfolio: currentData?.portfolio || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("❌ Resume size must be less than 5MB.");
        e.target.value = "";
        return;
      }
      setResumeFile(file);
    } else if (file) {
      toast.error("❌ Only PDF files are allowed.");
      e.target.value = "";
    }
  };

  const uploadResumeToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    data.append("folder", "documents/resume");

    const RAW_UPLOAD_URL = process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL?.replace('/image/upload', '/raw/upload') || "https://api.cloudinary.com/v1_1/djw8l0wxn/raw/upload";

    const res = await fetch(RAW_UPLOAD_URL, {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      throw new Error("Failed to upload to Cloudinary");
    }

    const json = await res.json();
    return json.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let uploadedResumeUrl = currentData?.resume || "";

      if (resumeInputType === "file") {
        if (resumeFile) {
          uploadedResumeUrl = await uploadResumeToCloudinary(resumeFile);
        } else if (isDeletedLocally || !isInitialCloudinary) {
          uploadedResumeUrl = ""; // Switched to file but no file selected or deleted
        }
      } else {
        uploadedResumeUrl = formData.resumeLink;
      }

      const payload = {
        resume: uploadedResumeUrl,
        github: formData.github,
        portfolio: formData.portfolio,
      };

      // Ensure old file is deleted from Cloudinary if changed or removed
      if (currentData?.resume?.includes("res.cloudinary.com") && uploadedResumeUrl !== currentData.resume) {
        payload.oldImageUrl = currentData.resume;
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Resume and Links updated!");
      onSave(data);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error updating details");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative p-[2px] bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className={`relative w-full h-full overflow-hidden rounded-[calc(1rem-2px)] ${darkMode ? 'bg-[#1a1a1b] text-white' : 'bg-white text-gray-900'}`}>
        
        {/* Header */}
        <div className={`p-4 flex items-center justify-between border-b ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide">Resume & Links</h2>
              <p className={`text-xs font-medium uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Update your professional links
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Guide Text */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${darkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                  <p className="font-bold mb-0.5">Earn Points for Resumes & Links!</p>
                  <p>Adding your Resume and Portfolios makes your profile much stronger. Once verified by an Admin, you will be awarded Profile Completion points!</p>
              </div>
          </div>
          
          {/* Resume Upload / Link */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                <UploadCloud className="w-4 h-4" /> Resume
              </label>
              <div className={`flex items-center gap-2 p-1 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                <button
                  type="button"
                  onClick={() => setResumeInputType("file")}
                  className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${resumeInputType === "file" ? (darkMode ? 'bg-white/20 text-white' : 'bg-white text-gray-900 shadow-sm') : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
                >
                  Upload PDF
                </button>
                <button
                  type="button"
                  onClick={() => setResumeInputType("link")}
                  className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${resumeInputType === "link" ? (darkMode ? 'bg-white/20 text-white' : 'bg-white text-gray-900 shadow-sm') : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
                >
                  Drive Link
                </button>
              </div>
            </div>

            {resumeInputType === "file" ? (
              <>
                <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                  <div className={`flex items-center gap-3 p-2.5 rounded-[calc(0.75rem-2px)] ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                </div>
                {!isDeletedLocally && isInitialCloudinary && currentData?.resume && !resumeFile && (
                  <div className={`mt-3 flex items-center justify-between p-2.5 rounded-xl border ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                    <span className={`text-xs font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                      <FileText className="w-4 h-4 text-blue-500" />
                      Current Uploaded File
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDeletedLocally(true)}
                      className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                <input
                  type="url"
                  name="resumeLink"
                  value={formData.resumeLink}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                />
              </div>
            )}
          </div>

          {/* GitHub URL */}
          <div>
            <label className={`block text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Github className="w-4 h-4" /> GitHub Profile
            </label>
            <div className={`p-[2px] bg-gradient-to-tr from-gray-500 to-gray-700 rounded-xl shadow-sm`}>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
              />
            </div>
          </div>

          {/* Portfolio URL */}
          <div>
            <label className={`block text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              <Globe className="w-4 h-4" /> Portfolio Website
            </label>
            <div className={`p-[2px] bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl shadow-sm`}>
              <input
                type="url"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
