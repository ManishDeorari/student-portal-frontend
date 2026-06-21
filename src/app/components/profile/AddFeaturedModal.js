import React, { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { X, Youtube, Github, Link as LinkIcon, Briefcase, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddFeaturedModal({ onClose, onSave, editItem }) {
  const { darkMode } = useTheme();
  const [title, setTitle] = useState(editItem?.title || "");
  const [url, setUrl] = useState(editItem?.url || "");
  const [type, setType] = useState(editItem?.type || "other");

  useEffect(() => {
    if (!editItem) {
      if (url.includes("github.com")) setType("github");
      else if (url.includes("youtube.com") || url.includes("youtu.be")) setType("youtube");
      else if (url.includes("/posts/")) setType("post");
      else setType("other");
    }
  }, [url, editItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !url) return;
    onSave({ ...(editItem || {}), title, url, type });
  };

  const types = [
    { id: "github", icon: Github, label: "GitHub" },
    { id: "youtube", icon: Youtube, label: "YouTube" },
    { id: "portfolio", icon: Briefcase, label: "Portfolio" },
    { id: "post", icon: FileText, label: "Post" },
    { id: "other", icon: LinkIcon, label: "Link" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full max-w-md p-6 rounded-2xl shadow-2xl border ${
          darkMode ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            darkMode ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-black"
          }`}
        >
          <X size={20} />
        </button>

        <h2 className={`text-xl font-black mb-6 ${darkMode ? "text-white" : "text-black"}`}>
          {editItem ? "Edit Featured Item" : "Add Featured Item"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              URL Link
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required
              className={`w-full p-3 rounded-xl border font-bold ${
                darkMode
                  ? "bg-black/50 border-white/10 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  : "bg-gray-50 border-gray-200 text-black focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              } outline-none transition-all`}
            />
          </div>

          <div>
            <label className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Display Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Next.js Project"
              required
              className={`w-full p-3 rounded-xl border font-bold ${
                darkMode
                  ? "bg-black/50 border-white/10 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  : "bg-gray-50 border-gray-200 text-black focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              } outline-none transition-all`}
            />
          </div>

          <div>
            <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Link Type
            </label>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      isSelected
                        ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                        : darkMode
                        ? "bg-white/5 text-gray-400 hover:bg-white/10"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Icon size={16} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black hover:opacity-90 transition-opacity"
          >
            {editItem ? "Save Changes" : "Add to Profile"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
