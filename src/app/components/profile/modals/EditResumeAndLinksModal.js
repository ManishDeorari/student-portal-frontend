"use client";

import React, { useState, useEffect } from "react";
import { X, FileText, Github, Globe, Loader2, Info, Link as LinkIcon, Plus, Trash2, Save } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

export default function EditResumeAndLinksModal({ isOpen, onClose, currentData, onSave }) {
  const { darkMode } = useTheme();
  
  const [formData, setFormData] = useState({
    resumeLink: "",
    github: "",
    portfolio: "",
    customLinks: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentData && isOpen) {
      setFormData({
        resumeLink: currentData.resume || "",
        github: currentData.github || "",
        portfolio: currentData.portfolio || "",
        customLinks: currentData.customLinks || [],
      });
    }
  }, [currentData, isOpen]);

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
    <>
      <LoadingOverlay isVisible={isSaving} />
      <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
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
              <button onClick={onClose} className={`p-1 border-2 transition rounded-xl ml-3 ${darkMode ? 'border-white text-white hover:bg-white/20' : 'border-black text-black hover:bg-black/10'}`}>
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
                <div className={`p-[2px] bg-gradient-to-tr from-gray-600 to-gray-800 rounded-xl shadow-sm`}>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="https://github.com/..."
                    className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                  />
                </div>
              </div>

              {/* Portfolio URL */}
              <div>
                <label className={`block text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  <Globe className="w-4 h-4" /> Portfolio / Website
                </label>
                <div className={`p-[2px] bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl shadow-sm`}>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                  />
                </div>
              </div>

              {/* Custom Links */}
              <div>
                <div className="flex justify-between items-center mb-2">
                    <label className={`block text-xs font-black uppercase tracking-widest ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                        Custom Links
                    </label>
                    <button
                        type="button"
                        onClick={addCustomLink}
                        className={`text-xs font-bold flex items-center gap-1 hover:underline ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}
                    >
                        <Plus className="w-3 h-3" /> Add Link
                    </button>
                </div>
                
                <div className="space-y-3">
                    {formData.customLinks.map((link, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                                <input
                                    type="text"
                                    value={link.title}
                                    onChange={(e) => handleCustomLinkChange(index, "title", e.target.value)}
                                    placeholder="Link Title (e.g. Medium, Dev.to)"
                                    className={`w-full p-2 rounded-lg border-2 outline-none transition text-sm ${darkMode ? 'bg-[#121213] text-white border-white/10 focus:border-purple-500' : 'bg-white text-gray-900 border-gray-200 focus:border-purple-500'}`}
                                />
                                <input
                                    type="url"
                                    value={link.url}
                                    onChange={(e) => handleCustomLinkChange(index, "url", e.target.value)}
                                    placeholder="https://..."
                                    className={`w-full p-2 rounded-lg border-2 outline-none transition text-sm ${darkMode ? 'bg-[#121213] text-white border-white/10 focus:border-purple-500' : 'bg-white text-gray-900 border-gray-200 focus:border-purple-500'}`}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeCustomLink(index)}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition mt-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {formData.customLinks.length === 0 && (
                        <p className={`text-sm italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No custom links added.</p>
                    )}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 flex justify-end">
                  <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isSaving ? "Saving..." : "Save Links"}
                  </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}