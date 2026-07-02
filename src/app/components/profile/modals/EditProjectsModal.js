import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X, Trash2, Plus, Save, ChevronDown, ChevronRight,
  FolderGit2, Calendar, Link as LinkIcon, Target, Eye, EyeOff, Wrench, Info, Globe, Lock
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

export default function EditProjectsModal({ isOpen, onClose, currentProjects, onSave }) {
  const { darkMode } = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setExpandedIndex(null);
    }
    if (currentProjects && isOpen) {
      const transformed = currentProjects.map((p) => {
        const parseDate = (dateStr) => {
          if (!dateStr) return { month: "", year: "" };
          const parts = dateStr.split(" ");
          return parts.length === 2
            ? { month: parts[0], year: parts[1] }
            : { month: "", year: "" };
        };
        const start = parseDate(p.startDate);
        const end = parseDate(p.endDate);
        return {
          title: p.title || "",
          domain: p.domain || "",
          goal: p.goal || "",
          description: p.description || "",
          startMonth: start.month,
          startYear: start.year,
          endMonth: end.month,
          endYear: end.year,
          isOngoing: p.isOngoing || false,
          toolsUsed: Array.isArray(p.toolsUsed) ? p.toolsUsed.join(", ") : (p.toolsUsed || ""),
          link: p.link || "",
          isLinkPublic: p.isLinkPublic || false,
        };
      });
      setProjects(transformed.length ? transformed : [{
        title: "", domain: "", goal: "", description: "",
        startMonth: "", startYear: "", endMonth: "", endYear: "",
        isOngoing: false, toolsUsed: "", link: "", isLinkPublic: false
      }]);
    } else {
        setProjects([]);
    }
  }, [currentProjects, isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const addProject = () => {
    setProjects([...projects, {
      title: "", domain: "", goal: "", description: "",
      startMonth: "", startYear: "",
      endMonth: "", endYear: "",
      isOngoing: false,
      toolsUsed: "",
      link: "",
      isLinkPublic: false,
    }]);
    setExpandedIndex(projects.length);
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    projects.forEach((p, idx) => {
      const hasData = p.title || p.domain || p.goal || p.description;
      if (hasData) {
          if (!p.title.trim()) newErrors[`${idx}-title`] = "Project title is required";
          if (!p.domain?.trim()) newErrors[`${idx}-domain`] = "Domain is required";
          if (!p.goal.trim()) newErrors[`${idx}-goal`] = "Project goal is required";
          if (!p.description.trim()) newErrors[`${idx}-description`] = "Description is required";
          if (!p.startMonth || !p.startYear) newErrors[`${idx}-startDate`] = "Start date is required";
          if (!p.isOngoing && (!p.endMonth || !p.endYear)) newErrors[`${idx}-endDate`] = "End date is required (or check 'Currently Ongoing')";
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
      const validProjects = projects.filter(p => p.title || p.domain || p.goal || p.description);

      const finalData = validProjects.map((p) => ({
        title: p.title.trim(),
        domain: p.domain.trim(),
        goal: p.goal.trim(),
        description: p.description.trim(),
        startDate: `${p.startMonth} ${p.startYear}`,
        endDate: p.isOngoing ? "Present" : `${p.endMonth} ${p.endYear}`,
        isOngoing: p.isOngoing,
        toolsUsed: p.toolsUsed ? p.toolsUsed.split(",").map(t => t.trim()).filter(Boolean) : [],
        link: p.link.trim(),
        isLinkPublic: p.isLinkPublic,
      }));

      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projects: finalData }),
      });

      if (!res.ok) throw new Error("Failed to update projects");

      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onSave(updatedUser);
      toast.success("Projects updated successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error updating projects");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const projectsWithLinks = projects.filter(p => p.link && p.link.trim().length > 0).length;
  const pointsEarning = Math.min(projectsWithLinks, 3) * 10;

  return (
    <>
      <LoadingOverlay isVisible={loading} />
      <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-4xl max-h-[95dvh] sm:max-h-[90vh]">
          <div className={`rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden animate-fadeIn flex flex-col transition-colors duration-500 max-h-[90vh] ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white shrink-0">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5" /> Edit Projects
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
                          <p>Add project URLs to earn profile points! (Max 3 URLs, 10 pts each). Current points: <span className="font-bold text-blue-600 dark:text-blue-400">{pointsEarning} / 30</span></p>
                      </div>
                  </div>
              </div>
              {projects.map((project, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-2 transition-all ${expandedIndex === idx ? (darkMode ? 'bg-[#1e1e1e] border-blue-500' : 'bg-blue-50 border-blue-400') : (darkMode ? 'bg-transparent border-white/5 hover:border-white/10' : 'bg-white border-gray-100 hover:border-gray-200')}`}>
                    <div 
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setExpandedIndex(expandedIndex === idx ? -1 : idx)}
                    >
                        <div className="flex items-center gap-3">
                            <FolderGit2 className="w-5 h-5 text-blue-500" />
                            <div>
                                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {project.title || "New Project"}
                                </h3>
                                {project.domain && <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{project.domain}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); removeProject(idx); }}
                                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            {expandedIndex === idx ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                    </div>

                    {expandedIndex === idx && (
                        <div className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-white/10">
                            
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Project Title <span className="text-red-500">*</span></label>
                                    <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-title`] ? 'from-red-500 to-red-600' : ''}`}>
                                        <input
                                            type="text"
                                            value={project.title}
                                            onChange={(e) => handleChange(idx, "title", e.target.value)}
                                            className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                            placeholder="Ex: E-commerce Website"
                                        />
                                    </div>
                                    {errors[`${idx}-title`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-title`]}</p>}
                                </div>
                                
                                <div>
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Domain <span className="text-red-500">*</span></label>
                                    <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-domain`] ? 'from-red-500 to-red-600' : ''}`}>
                                        <input
                                            type="text"
                                            value={project.domain}
                                            onChange={(e) => handleChange(idx, "domain", e.target.value)}
                                            className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                            placeholder="Ex: Web Development, Machine Learning"
                                        />
                                    </div>
                                    {errors[`${idx}-domain`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-domain`]}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>Start Date <span className="text-red-500">*</span></label>
                                    <div className={`flex gap-2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-startDate`] ? 'from-red-500 to-red-600' : ''}`}>
                                        <select
                                            value={project.startMonth}
                                            onChange={(e) => handleChange(idx, "startMonth", e.target.value)}
                                            className={`w-1/2 p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        >
                                            <option value="">Month</option>
                                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select
                                            value={project.startYear}
                                            onChange={(e) => handleChange(idx, "startYear", e.target.value)}
                                            className={`w-1/2 p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        >
                                            <option value="">Year</option>
                                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    {errors[`${idx}-startDate`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-startDate`]}</p>}
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className={`block text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>End Date</label>
                                        <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                                            <input type="checkbox" checked={project.isOngoing} onChange={(e) => handleChange(idx, "isOngoing", e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                            Currently Ongoing
                                        </label>
                                    </div>
                                    <div className={`flex gap-2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-endDate`] ? 'from-red-500 to-red-600' : (project.isOngoing ? 'opacity-50' : '')}`}>
                                        <select
                                            value={project.endMonth}
                                            onChange={(e) => handleChange(idx, "endMonth", e.target.value)}
                                            disabled={project.isOngoing}
                                            className={`w-1/2 p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        >
                                            <option value="">Month</option>
                                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select
                                            value={project.endYear}
                                            onChange={(e) => handleChange(idx, "endYear", e.target.value)}
                                            disabled={project.isOngoing}
                                            className={`w-1/2 p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        >
                                            <option value="">Year</option>
                                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    {errors[`${idx}-endDate`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-endDate`]}</p>}
                                </div>
                            </div>

                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Goal <span className="text-red-500">*</span></label>
                                <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-goal`] ? 'from-red-500 to-red-600' : ''}`}>
                                    <textarea
                                        value={project.goal}
                                        onChange={(e) => handleChange(idx, "goal", e.target.value)}
                                        rows={2}
                                        className={`w-full p-3 rounded-[calc(0.75rem-2px)] outline-none transition resize-none ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        placeholder="What was the purpose of this project?"
                                    />
                                </div>
                                {errors[`${idx}-goal`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-goal`]}</p>}
                            </div>

                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Description <span className="text-red-500">*</span></label>
                                <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-description`] ? 'from-red-500 to-red-600' : ''}`}>
                                    <textarea
                                        value={project.description}
                                        onChange={(e) => handleChange(idx, "description", e.target.value)}
                                        rows={3}
                                        className={`w-full p-3 rounded-[calc(0.75rem-2px)] outline-none transition resize-none ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        placeholder="Detail your contributions and the outcomes..."
                                    />
                                </div>
                                {errors[`${idx}-description`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-description`]}</p>}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-fuchsia-400' : 'text-fuchsia-600'}`}>Tools / Tech (comma separated)</label>
                                    <div className={`relative p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                                        <Wrench className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                                        <input
                                            type="text"
                                            value={project.toolsUsed}
                                            onChange={(e) => handleChange(idx, "toolsUsed", e.target.value)}
                                            className={`w-full p-2.5 pl-10 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                            placeholder="React, Node.js, Python..."
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Project Link <span className="text-pink-500 font-bold lowercase tracking-normal bg-pink-500/10 px-1.5 py-0.5 rounded ml-1">(Needed for points)</span></label>
                                    <div className="flex flex-col gap-2">
                                        <div className={`relative p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                                            <LinkIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                                            <input
                                                type="text"
                                                value={project.link}
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
                                                        project.isLinkPublic 
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
                                                        !project.isLinkPublic 
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
                        </div>
                    )}
                </div>
              ))}

              <button
                  onClick={addProject}
                  className={`w-full py-4 border-2 border-dashed rounded-xl transition flex items-center justify-center gap-2 font-bold ${darkMode ? 'border-white/10 text-blue-400 hover:border-blue-500 hover:bg-blue-500/10' : 'border-gray-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50'}`}
              >
                  <Plus className="w-5 h-5" /> Add Another Project
              </button>
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
                  background: ${darkMode ? '#333' : '#d1d5db'};
                  border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: ${darkMode ? '#555' : '#9ca3af'};
              }
          `}</style>
        </div>
      </div>
    </>
  );
}