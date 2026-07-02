import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X, Trash2, Plus, Save, ChevronDown, ChevronRight,
  BookOpen, Calendar, Link as LinkIcon, Building2, Eye, EyeOff, Tag, Info, Globe, Lock
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const YEARS = Array.from({ length: new Date().getFullYear() - 1950 + 1 }, (_, i) => new Date().getFullYear() - i);
const TYPES = ["Research Paper", "Patent", "Publication", "Whitepaper", "Article"];

export default function EditPapersModal({ isOpen, onClose, currentPapers, onSave }) {
  const { darkMode } = useTheme();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setExpandedIndex(null);
    }
    if (currentPapers && isOpen) {
      const transformed = currentPapers.map((p) => {
        const parseDate = (dateStr) => {
          if (!dateStr) return { month: "", year: "" };
          const parts = dateStr.split(" ");
          return parts.length === 2
            ? { month: parts[0], year: parts[1] }
            : { month: "", year: "" };
        };
        const pub = parseDate(p.publishDate);
        return {
          title: p.title || "",
          type: p.type || "",
          publisher: p.publisher || "",
          description: p.description || "",
          publishMonth: pub.month,
          publishYear: pub.year,
          link: p.link || "",
          isLinkPublic: p.isLinkPublic || false,
        };
      });
      setPapers(transformed.length ? transformed : [{
        title: "", type: "", publisher: "", description: "",
        publishMonth: "", publishYear: "",
        link: "", isLinkPublic: false,
      }]);
    } else {
        setPapers([]);
    }
  }, [currentPapers, isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, field, value) => {
    const updated = [...papers];
    updated[index][field] = value;
    setPapers(updated);
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const addPaper = () => {
    setPapers([...papers, {
      title: "", type: "", publisher: "", description: "",
      publishMonth: "", publishYear: "",
      link: "", isLinkPublic: false,
    }]);
    setExpandedIndex(papers.length);
  };

  const removePaper = (index) => {
    setPapers(papers.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    papers.forEach((p, idx) => {
      const hasData = p.title || p.type || p.publisher || p.description;
      if (hasData) {
        if (!p.title.trim()) newErrors[`${idx}-title`] = "Title is required";
        if (!p.type.trim()) newErrors[`${idx}-type`] = "Type is required";
        if (!p.publisher.trim()) newErrors[`${idx}-publisher`] = "Publisher/Venue is required";
        if (!p.description.trim()) newErrors[`${idx}-description`] = "Description is required";
        if (!p.publishMonth || !p.publishYear) newErrors[`${idx}-publishDate`] = "Publish date is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (loading) return;
    if (!validate()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const validPapers = papers.filter(p => p.title || p.type || p.publisher || p.description);

      const finalData = validPapers.map((p) => ({
        title: p.title.trim(),
        type: p.type.trim(),
        publisher: p.publisher.trim(),
        description: p.description.trim(),
        publishDate: `${p.publishMonth} ${p.publishYear}`,
        link: p.link.trim(),
        isLinkPublic: p.isLinkPublic,
      }));

      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ researchPapers: finalData }),
      });

      if (!res.ok) throw new Error("Failed to update research papers");

      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onSave(updatedUser);
      toast.success("Research & Patents updated successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error updating papers");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const papersWithLinks = papers.filter(p => p.link && p.link.trim().length > 0).length;
  const pointsEarning = Math.min(papersWithLinks, 3) * 20;

  return (
    <>
      <LoadingOverlay isVisible={loading} />
      <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(99,102,241,0.4)] w-full max-w-4xl max-h-[95dvh] sm:max-h-[90vh]">
          <div className={`rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden animate-fadeIn flex flex-col transition-colors duration-500 max-h-[90vh] ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white shrink-0">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Edit Publications & Patents
                </h2>
                <button
                    onClick={onClose}
                    className="text-white hover:bg-white/20 p-1 border-2 border-white rounded-xl transition ml-3"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              
              {/* Guide Text */}
              <div className="p-[2px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 rounded-xl mb-6">
                  <div className={`p-4 rounded-[calc(0.75rem-2px)] flex items-start gap-3 ${darkMode ? 'bg-[#121213] text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
                      <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="text-sm leading-relaxed">
                          <p className="font-bold mb-0.5">Automated Points System Active!</p>
                          <p>Add publication/patent URLs to earn profile points! (Max 3 URLs, 20 pts each). Current points: <span className="font-bold text-blue-600 dark:text-blue-400">{pointsEarning} / 60</span></p>
                      </div>
                  </div>
              </div>

              {papers.map((paper, idx) => (
                <div key={idx} className={`p-[2px] rounded-xl shadow-sm transition-all duration-300 bg-gradient-to-tr from-blue-600 to-purple-600 ${expandedIndex === idx ? 'scale-[1.01]' : 'hover:scale-[1.01]'}`}>
                  <div className={`p-4 rounded-[calc(1rem-2px)] h-full ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                    <div 
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setExpandedIndex(expandedIndex === idx ? -1 : idx)}
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                            <div>
                                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {paper.title || "New Publication"}
                                </h3>
                                {paper.type && <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{paper.type}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); removePaper(idx); }}
                                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            {expandedIndex === idx ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                    </div>

                    {expandedIndex === idx && (
                        <div className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-white/10">
                            
                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Title <span className="text-red-500">*</span></label>
                                <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-title`] ? 'from-red-500 to-red-600' : ''}`}>
                                    <input
                                        type="text"
                                        value={paper.title}
                                        onChange={(e) => handleChange(idx, "title", e.target.value)}
                                        className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        placeholder="Title of Publication or Patent"
                                    />
                                </div>
                                {errors[`${idx}-title`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-title`]}</p>}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Type <span className="text-red-500">*</span></label>
                                    <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-type`] ? 'from-red-500 to-red-600' : ''}`}>
                                        <select
                                            value={paper.type}
                                            onChange={(e) => handleChange(idx, "type", e.target.value)}
                                            className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        >
                                            <option value="">Select Type</option>
                                            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    {errors[`${idx}-type`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-type`]}</p>}
                                </div>

                                <div>
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>Publisher / Venue <span className="text-red-500">*</span></label>
                                    <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-publisher`] ? 'from-red-500 to-red-600' : ''}`}>
                                        <input
                                            type="text"
                                            value={paper.publisher}
                                            onChange={(e) => handleChange(idx, "publisher", e.target.value)}
                                            className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                            placeholder="Ex: IEEE, Springer, Patent Office"
                                        />
                                    </div>
                                    {errors[`${idx}-publisher`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-publisher`]}</p>}
                                </div>
                            </div>

                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>Publish Date <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <div className={`w-1/2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-publishDate`] ? 'from-red-500 to-red-600' : ''}`}>
                                        <select
                                            value={paper.publishMonth}
                                            onChange={(e) => handleChange(idx, "publishMonth", e.target.value)}
                                            className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        >
                                            <option value="">Month</option>
                                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className={`w-1/2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-publishDate`] ? 'from-red-500 to-red-600' : ''}`}>
                                        <select
                                            value={paper.publishYear}
                                            onChange={(e) => handleChange(idx, "publishYear", e.target.value)}
                                            className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        >
                                            <option value="">Year</option>
                                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {errors[`${idx}-publishDate`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-publishDate`]}</p>}
                            </div>

                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Description (Abstract) <span className="text-red-500">*</span></label>
                                <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-description`] ? 'from-red-500 to-red-600' : ''}`}>
                                    <textarea
                                        value={paper.description}
                                        onChange={(e) => handleChange(idx, "description", e.target.value)}
                                        rows={3}
                                        className={`w-full p-3 rounded-[calc(0.75rem-2px)] outline-none transition resize-none ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        placeholder="Brief abstract or description..."
                                    />
                                </div>
                                {errors[`${idx}-description`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-description`]}</p>}
                            </div>

                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>URL Link <span className="text-pink-500 font-bold lowercase tracking-normal bg-pink-500/10 px-1.5 py-0.5 rounded ml-1">(Needed for points)</span></label>
                                <div className="flex flex-col gap-2">
                                    <div className={`relative p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                                        <LinkIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                                        <input
                                            type="text"
                                            value={paper.link}
                                            onChange={(e) => handleChange(idx, "link", e.target.value)}
                                            className={`w-full p-2.5 pl-10 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm mt-1`}>
                                        <div className={`p-1.5 rounded-[calc(0.75rem-2px)] flex gap-1 ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); handleChange(idx, "isLinkPublic", true); }}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                                                    paper.isLinkPublic 
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' 
                                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/5'
                                                }`}
                                            >
                                                <Globe className="w-4 h-4" /> Public
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); handleChange(idx, "isLinkPublic", false); }}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                                                    !paper.isLinkPublic 
                                                        ? 'bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-md' 
                                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/5'
                                                }`}
                                            >
                                                <Lock className="w-4 h-4" /> Private
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm w-full transition-all hover:scale-[1.01]">
                  <button
                      onClick={addPaper}
                      className={`w-full py-4 rounded-[calc(0.75rem-2px)] flex items-center justify-center gap-2 font-bold ${darkMode ? 'bg-[#121213] text-white hover:bg-[#1a1a1b]' : 'bg-white text-black hover:bg-gray-50'}`}
                  >
                      <Plus className="w-5 h-5" /> Add Another Publication
                  </button>
              </div>
            </div>

            {/* Footer */}
            <div className={`p-4 flex justify-end gap-3 flex-shrink-0 ${darkMode ? 'bg-slate-800/50 border-t border-white/5' : 'bg-gray-50 border-t'}`}>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
          </div>

          <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: linear-gradient(to bottom, #2563eb, #9333ea);
                  border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: linear-gradient(to bottom, #1d4ed8, #7e22ce);
              }
          `}</style>
        </div>
      </div>
    </>
  );
}

