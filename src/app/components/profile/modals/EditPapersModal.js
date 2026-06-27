import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X, Trash2, Plus, Save, ChevronDown, ChevronRight,
  BookOpen, Calendar, Link as LinkIcon, Building2, Eye, EyeOff, Tag
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

export default function EditPapersModal({ isOpen, onClose, currentPapers, onSave }) {
  const { darkMode } = useTheme();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
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
      setPapers(transformed);
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
      if (!p.title.trim()) newErrors[`${idx}-title`] = "Title is required";
      if (!p.type.trim()) newErrors[`${idx}-type`] = "Type is required";
      if (!p.publisher.trim()) newErrors[`${idx}-publisher`] = "Publisher/Venue is required";
      if (!p.description.trim()) newErrors[`${idx}-description`] = "Description is required";
      if (!p.publishMonth || !p.publishYear) newErrors[`${idx}-publishDate`] = "Publish date is required";
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
      const finalData = papers.map((p) => ({
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

  // Count how many current papers have valid links (for hints)
  const papersWithLinks = papers.filter(p => p.link && p.link.trim().length > 0).length;
  const pointsEarning = Math.min(papersWithLinks, 3) * 20;

  return (
    <>
      <LoadingOverlay isVisible={loading} />
      <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-2 md:p-4">
        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(99,102,241,0.4)] w-full max-w-3xl">
          <div className={`rounded-[calc(1rem-2.5px)] sm:rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden animate-fadeIn max-h-[95dvh] sm:max-h-[90vh] flex flex-col ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"}`}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Edit Publications & Patents
              </h2>
              <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-4 md:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow ${darkMode ? "bg-[#121213]" : "bg-gray-50/30"}`}>
              
              {/* ── Hint Banner ── */}
              <div className="p-[2px] bg-gradient-to-tr from-blue-600 via-violet-500 to-purple-600 rounded-xl">
                <div className={`p-4 rounded-[calc(0.75rem-2px)] flex items-start gap-3 ${darkMode ? 'bg-[#121213] text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
                  <BookOpen className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm leading-relaxed space-y-1">
                    <p className="font-black uppercase tracking-wide">Earn Points for Publications!</p>
                    <p>Add up to <span className="font-black">3 research papers or patents</span> with valid links to earn <span className="font-black">20 points each</span> (maximum <span className="font-black">60 points</span> total).</p>
                    <div className={`mt-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest rounded-lg px-3 py-1.5 w-max ${darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                      <span>
                        {papersWithLinks >= 3
                          ? `✅ ${pointsEarning}/60 pts — Maximum reached!`
                          : `${papersWithLinks}/3 entries with links — Currently earning ${pointsEarning}/60 pts`}
                      </span>
                    </div>
                    <p className={`text-[10px] font-medium mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      Mandatory fields: Title, Type, Publisher/Venue, Publish Date, & Abstract/Description.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Paper Cards ── */}
              {papers.map((paper, index) => (
                <div
                  key={index}
                  className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_10px_30px_rgba(99,102,241,0.2)] transition-all duration-300"
                >
                  <div className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-[calc(2.5rem-2.5px)] overflow-hidden shadow-2xl`}>
                    
                    {/* Card Header */}
                    <div
                      onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                      className={`p-5 flex items-center justify-between cursor-pointer select-none border-b border-dashed ${darkMode ? "border-white/10" : "border-gray-200"} ${expandedIndex === index ? (darkMode ? "bg-blue-600/10" : "bg-blue-50/50") : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-emerald-500">
                          {expandedIndex === index ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className={`font-black uppercase tracking-tight text-sm ${expandedIndex === index ? "text-blue-500" : darkMode ? "text-slate-300" : "text-gray-700"}`}>
                            {paper.title || `New Entry ${index + 1}`}
                          </h3>
                          {paper.link && (
                            <span className="text-[10px] text-green-500 font-black uppercase tracking-wider">✓ Link added — Earning 5 pts</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removePaper(index); }}
                        className={`p-2 rounded-xl transition-all ${darkMode ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}
                        title="Remove Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Card Form */}
                    {expandedIndex === index && (
                      <div className="p-5 sm:p-8 space-y-6">

                        {/* Title Row */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-title`] ? 'text-red-500' : darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            <BookOpen className="w-3.5 h-3.5" /> Title <span className="text-red-500">*</span>
                          </label>
                          <div className={`p-[2px] bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl ${errors[`${index}-title`] ? 'from-red-500 to-red-600' : ''}`}>
                            <input
                              type="text"
                              value={paper.title}
                              onChange={(e) => handleChange(index, "title", e.target.value)}
                              placeholder="e.g. Deep Learning in Healthcare"
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                            />
                          </div>
                          {errors[`${index}-title`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors[`${index}-title`]}</p>}
                        </div>

                        {/* Type & Publisher Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Type */}
                          <div className="space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-type`] ? 'text-red-500' : darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                              <Tag className="w-3.5 h-3.5" /> Type <span className="text-red-500">*</span>
                            </label>
                            <div className={`p-[2px] bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl ${errors[`${index}-type`] ? 'from-red-500 to-red-600' : ''}`}>
                              <select
                                value={paper.type}
                                onChange={(e) => handleChange(index, "type", e.target.value)}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white" : "bg-white text-gray-900"}`}
                              >
                                <option value="">Select Type</option>
                                <option value="Research Paper">Research Paper</option>
                                <option value="Patent">Patent</option>
                                <option value="Journal Article">Journal Article</option>
                                <option value="Conference Proceeding">Conference Proceeding</option>
                                <option value="Book Chapter">Book Chapter</option>
                              </select>
                            </div>
                            {errors[`${index}-type`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors[`${index}-type`]}</p>}
                          </div>

                          {/* Publisher */}
                          <div className="space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-publisher`] ? 'text-red-500' : darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                              <Building2 className="w-3.5 h-3.5" /> Publisher/Venue <span className="text-red-500">*</span>
                            </label>
                            <div className={`p-[2px] bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl ${errors[`${index}-publisher`] ? 'from-red-500 to-red-600' : ''}`}>
                              <input
                                type="text"
                                value={paper.publisher}
                                onChange={(e) => handleChange(index, "publisher", e.target.value)}
                                placeholder="e.g. IEEE, Nature, USPTO"
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                              />
                            </div>
                            {errors[`${index}-publisher`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors[`${index}-publisher`]}</p>}
                          </div>
                        </div>

                        {/* Dates Row */}
                        <div className="space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-publishDate`] ? 'text-red-500' : darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              <Calendar className="w-3.5 h-3.5" /> Publish / Issue Date <span className="text-red-500">*</span>
                            </label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl w-max ${errors[`${index}-publishDate`] ? 'from-red-500 to-red-600' : ''}`}>
                              <div className={`grid grid-cols-2 gap-1 p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                                <select value={paper.publishMonth} onChange={(e) => handleChange(index, "publishMonth", e.target.value)} className={`p-2 rounded-lg text-sm outline-none ${darkMode ? "bg-[#121213] text-white" : "bg-white text-gray-900"}`}>
                                  <option value="">Month</option>
                                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select value={paper.publishYear} onChange={(e) => handleChange(index, "publishYear", e.target.value)} className={`p-2 rounded-lg text-sm outline-none ${darkMode ? "bg-[#121213] text-white" : "bg-white text-gray-900"}`}>
                                  <option value="">Year</option>
                                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                              </div>
                            </div>
                            {errors[`${index}-publishDate`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors[`${index}-publishDate`]}</p>}
                          </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-description`] ? 'text-red-500' : darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                            Abstract / Description <span className="text-red-500">*</span>
                          </label>
                          <div className={`p-[2px] bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl ${errors[`${index}-description`] ? 'from-red-500 to-red-600' : ''}`}>
                            <textarea
                              rows={3}
                              value={paper.description}
                              onChange={(e) => handleChange(index, "description", e.target.value)}
                              placeholder="Describe the research, methodology, and outcome..."
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition resize-none ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                            />
                          </div>
                          {errors[`${index}-description`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors[`${index}-description`]}</p>}
                        </div>

                        {/* Link */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>
                            <LinkIcon className="w-3.5 h-3.5" /> Link / DOI
                            <span className={`text-[10px] font-medium normal-case ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>(Optional — required for points)</span>
                          </label>
                          <div className="p-[2px] bg-gradient-to-tr from-pink-500 to-rose-500 rounded-xl">
                            <input
                              type="url"
                              value={paper.link}
                              onChange={(e) => handleChange(index, "link", e.target.value)}
                              placeholder="https://doi.org/... or journal link"
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                            />
                          </div>

                          {/* Link Visibility Toggle */}
                          <div className={`mt-2 p-[2px] rounded-xl bg-gradient-to-tr ${paper.isLinkPublic ? 'from-green-500 to-emerald-500' : 'from-slate-500 to-gray-600'}`}>
                            <label className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-[calc(0.75rem-2px)] cursor-pointer ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                              <div className="flex items-center gap-2">
                                {paper.isLinkPublic ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                                <div>
                                  <p className={`text-xs font-black uppercase tracking-widest ${paper.isLinkPublic ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-slate-400' : 'text-gray-500')}`}>
                                    {paper.isLinkPublic ? "Link is Public" : "Link is Private"}
                                  </p>
                                  <p className={`text-[10px] font-medium ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                    Faculty & Admin can always see it • {paper.isLinkPublic ? "Other students/alumni can also view" : "Hidden from other students/alumni"}
                                  </p>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={paper.isLinkPublic}
                                onChange={(e) => handleChange(index, "isLinkPublic", e.target.checked)}
                                className="w-4 h-4 accent-green-600"
                              />
                            </label>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Paper Button */}
              <button
                type="button"
                onClick={addPaper}
                className={`w-full py-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:border-solid hover:scale-[1.01] ${darkMode ? "border-blue-500/30 hover:border-blue-500 bg-blue-500/5 text-blue-400" : "border-blue-200 hover:border-blue-500 bg-blue-50 text-blue-600"}`}
              >
                <div className={`p-2 rounded-full ${darkMode ? "bg-blue-500/20" : "bg-blue-100"}`}>
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-bold">Add Publication / Patent</span>
              </button>
            </div>

            {/* Footer */}
            <div className={`p-4 md:p-6 border-t flex justify-end gap-3 flex-shrink-0 ${darkMode ? "bg-slate-800 border-white/5" : "bg-gray-50 border-gray-200"}`}>
              <button
                onClick={onClose}
                className={`px-6 py-2.5 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${darkMode ? "border-white text-white hover:bg-white/10" : "border-black text-black hover:bg-gray-100"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <><Save className="w-5 h-5" /> Save Entries</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
