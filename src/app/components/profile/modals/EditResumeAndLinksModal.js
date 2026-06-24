"use client";

import React, { useState } from "react";
import { X, FileText, Github, Globe, Loader2, Info, Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";

export default function EditResumeAndLinksModal({ isOpen, onClose, currentData, onSave }) {
  const { darkMode } = useTheme();
  
  const [formData, setFormData] = useState({
    resumeLink: currentData?.resume || "",
    github: currentData?.github || "",
    portfolio: currentData?.portfolio || "",
    customLinks: currentData?.customLinks || [],
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomLinkChange = (index, field, value) => {
    const updatedLinks = [...formData.customLinks];
    updatedLinks[index][field] = value;
    setFormData({ ...formData, customLinks: updatedLinks });
  };

  const addCustomLink = () => {
    setFormData({
      ...formData,
      customLinks: [...formData.customLinks, { title: "", url: "" }]
    });
  };

  const removeCustomLink = (index) => {
    const updatedLinks = formData.customLinks.filter((_, i) => i !== index);
    setFormData({ ...formData, customLinks: updatedLinks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        resume: formData.resumeLink,
        github: formData.github,
        portfolio: formData.portfolio,
        customLinks: formData.customLinks.filter(link => link.title.trim() !== "" && link.url.trim() !== ""),
      };

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
      <div className="relative p-[2px] bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className={`relative w-full h-full overflow-y-auto overflow-x-hidden rounded-[calc(1rem-2px)] ${darkMode ? 'bg-[#1a1a1b] text-white' : 'bg-white text-gray-900'}`}>
        
        {/* Header */}
        <div className={`p-4 flex items-center justify-between border-b ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg`}>
              <LinkIcon className="w-5 h-5" />
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
          <div className="p-[2px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 rounded-xl mb-6">
              <div className={`p-4 rounded-[calc(0.75rem-2px)] flex items-start gap-3 ${darkMode ? 'bg-[#121213] text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
                  <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm leading-relaxed">
                      <p className="font-bold mb-0.5">Automated Points System Active!</p>
                      <p>Adding your Resume link and External Portfolios automatically awards you points. Removing them will deduct points instantly.</p>
                  </div>
              </div>
          </div>
          
          {/* Resume Link */}
          <div>
            <label className={`block text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              <FileText className="w-4 h-4" /> Resume Link
            </label>
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

          {/* Custom Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>
                <LinkIcon className="w-4 h-4" /> Custom Links (LeetCode, Behance, Blogs)
              </label>
            </div>
            
            <div className="space-y-3">
              {formData.customLinks.map((link, index) => (
                <div key={index} className={`flex items-center gap-2 p-[2px] bg-gradient-to-tr from-pink-500 to-rose-600 rounded-xl shadow-sm`}>
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleCustomLinkChange(index, "title", e.target.value)}
                    placeholder="Title (e.g. LeetCode)"
                    className={`w-1/3 p-2.5 text-sm rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleCustomLinkChange(index, "url", e.target.value)}
                    placeholder="URL (https://...)"
                    className={`flex-1 p-2.5 text-sm rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomLink(index)}
                    className="flex items-center gap-1 px-2.5 py-2 mr-1 bg-red-500 hover:bg-red-600 text-white font-black rounded-lg transition-all hover:scale-105 active:scale-95 shadow-sm"
                    title="Remove link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="p-[2px] bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 rounded-xl shadow-md w-max mt-1">
                <button
                  type="button"
                  onClick={addCustomLink}
                  className={`flex items-center gap-2 text-xs font-black px-4 py-2 rounded-[calc(0.75rem-2px)] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                >
                  <Plus className="w-4 h-4" /> Add Custom Link
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2.5 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm ${darkMode ? "border-white text-white hover:bg-white/10" : "border-black text-black hover:bg-gray-100"}`}
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
