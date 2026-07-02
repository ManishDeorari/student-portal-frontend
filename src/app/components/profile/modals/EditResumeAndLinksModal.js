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
            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                {/* Guide Text */}
                <div className="p-[2px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 rounded-xl">
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
                  <div className="flex justify-between items-center mb-4">
                      <label className={`block text-xs font-black uppercase tracking-widest ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                          Custom Links
                      </label>
                  </div>
                  
                  <div className="space-y-4">
                      {formData.customLinks.map((link, index) => (
                          <div key={index} className="p-[2px] rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 shadow-sm transition-transform hover:scale-[1.01]">
                              <div className={`p-4 rounded-[calc(1rem-2px)] ${darkMode ? 'bg-[#121213]' : 'bg-white'} space-y-3`}>
                                  <div className="flex justify-between items-center mb-1">
                                      <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm"></div>
                                          <h4 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                              Link {index + 1}
                                          </h4>
                                      </div>
                                      <button
                                          type="button"
                                          onClick={() => removeCustomLink(index)}
                                          className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-slate-800 text-gray-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'} transition-colors`}
                                          title="Remove Link"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>

                                  <div className="space-y-3">
                                      <div className={`p-[2px] bg-gradient-to-tr from-purple-600/50 to-pink-600/50 rounded-xl`}>
                                          <input
                                              type="text"
                                              value={link.title}
                                              onChange={(e) => handleCustomLinkChange(index, "title", e.target.value)}
                                              placeholder="Link Title (e.g. Medium, Dev.to)"
                                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition text-sm ${darkMode ? 'bg-[#121213] text-white focus:bg-slate-900/50' : 'bg-white text-gray-900 focus:bg-gray-50'}`}
                                          />
                                      </div>
                                      <div className={`p-[2px] bg-gradient-to-tr from-purple-600/50 to-pink-600/50 rounded-xl`}>
                                          <input
                                              type="url"
                                              value={link.url}
                                              onChange={(e) => handleCustomLinkChange(index, "url", e.target.value)}
                                              placeholder="https://..."
                                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition text-sm ${darkMode ? 'bg-[#121213] text-white focus:bg-slate-900/50' : 'bg-white text-gray-900 focus:bg-gray-50'}`}
                                          />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                      {formData.customLinks.length === 0 && (
                          <p className={`text-sm italic ${darkMode ? 'text-gray-500' : 'text-gray-400'} text-center py-2`}>No custom links added.</p>
                      )}

                      <button
                          type="button"
                          onClick={addCustomLink}
                          className="w-full mt-4 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg"
                      >
                          <Plus className="w-5 h-5" /> Add New Link
                      </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className={`p-6 border-t flex justify-end gap-3 flex-shrink-0 rounded-b-[1.5rem] ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
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