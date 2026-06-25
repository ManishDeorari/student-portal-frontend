import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Languages, Plus, Trash2, Save } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function EditLanguagesModal({ isOpen, onClose, currentLanguages, onSave }) {
  const { darkMode } = useTheme();
  const [languages, setLanguages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentLanguages && isOpen) {
      setLanguages([...currentLanguages]);
      setInputValue("");
    }
  }, [currentLanguages, isOpen]);

  if (!isOpen) return null;

  const handleAddLanguage = (e) => {
    e?.preventDefault();
    const val = inputValue.trim();
    if (!val) return;

    if (languages.includes(val)) {
      toast.error("Language already added!");
      return;
    }

    setLanguages([...languages, val]);
    setInputValue("");
  };

  const removeLanguage = (langToRemove) => {
    setLanguages(languages.filter((lang) => lang !== langToRemove));
  };

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ languages }),
      });

      if (!res.ok) throw new Error("Failed to update languages");

      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onSave(updatedUser);
      toast.success("Languages updated!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error updating languages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 text-gray-900">
      <div className="p-[2.5px] bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-2xl shadow-[0_20px_60px_rgba(6,182,212,0.4)] w-full max-w-md">
        <div className={`rounded-[calc(1rem-2.5px)] w-full shadow-2xl overflow-hidden animate-fadeIn flex flex-col transition-colors duration-500 ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"}`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 flex justify-between items-center text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Languages className="w-5 h-5" /> Edit Languages
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className={`p-6 space-y-6 flex-grow transition-colors ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
            
            <form onSubmit={handleAddLanguage} className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-cyan-400" : "text-cyan-600"}`}>
                Add a Language
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. English, Hindi, Spanish..."
                  className={`flex-grow p-2.5 rounded-xl border-2 text-sm outline-none transition focus:border-cyan-500 ${darkMode ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${!inputValue.trim() ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-400" : "bg-cyan-500 hover:bg-cyan-600 text-white shadow-md hover:shadow-cyan-500/30"}`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {languages.map((lang, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${darkMode ? "bg-cyan-900/20 border-cyan-500/30 text-cyan-300" : "bg-cyan-50 border-cyan-200 text-cyan-700"}`}
                >
                  <span className="text-sm font-bold">{lang}</span>
                  <button
                    onClick={() => removeLanguage(lang)}
                    className="p-0.5 hover:bg-cyan-500/20 rounded-md transition-colors text-cyan-600 dark:text-cyan-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {languages.length === 0 && (
                <p className={`text-sm italic ${darkMode ? "text-slate-500" : "text-gray-400"}`}>No languages added yet.</p>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className={`p-4 border-t flex justify-end gap-3 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-gray-50 border-gray-200"}`}>
            <button
              onClick={onClose}
              className={`px-6 py-2 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${darkMode ? "border-slate-600 text-slate-300 hover:bg-slate-800" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
