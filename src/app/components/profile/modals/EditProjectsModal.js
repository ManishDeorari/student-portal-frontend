import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X, Trash2, Plus, Save, ChevronDown, ChevronRight,
  FolderGit2, Calendar, Link as LinkIcon, Target, Eye, EyeOff, Wrench
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
  const [collapsedCards, setCollapsedCards] = useState({});

  const toggleCollapse = (index) =>
    setCollapsedCards((prev) => ({ ...prev, [index]: !prev[index] }));

  useEffect(() => {
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
          toolsUsed: (p.toolsUsed || []).join(", "),
          link: p.link || "",
          isLinkPublic: p.isLinkPublic || false,
        };
      });
      setProjects(transformed);
      setCollapsedCards({});
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
    setCollapsedCards(prev => ({ ...prev, [projects.length]: false }));
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    projects.forEach((p, idx) => {
      if (!p.title.trim()) newErrors[`${idx}-title`] = "Project title is required";
      if (!p.domain?.trim()) newErrors[`${idx}-domain`] = "Domain is required";
      if (!p.goal.trim()) newErrors[`${idx}-goal`] = "Project goal is required";
      if (!p.description.trim()) newErrors[`${idx}-description`] = "Description is required";
      if (!p.startMonth || !p.startYear) newErrors[`${idx}-startDate`] = "Start date is required";
      if (!p.isOngoing && (!p.endMonth || !p.endYear)) newErrors[`${idx}-endDate`] = "End date is required (or check 'Currently Ongoing')";
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
      const finalData = projects.map((p) => ({
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

  // Count how many current projects have valid links (for hints)
  const projectsWithLinks = projects.filter(p => p.link && p.link.trim().length > 0).length;
  const pointsEarning = Math.min(projectsWithLinks, 2) * 5;

  return (
    <>
      <LoadingOverlay isVisible={loading} />
      <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-2 md:p-4">
        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-3xl">
          <div className={`rounded-[calc(1rem-2.5px)] sm:rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden animate-fadeIn max-h-[95dvh] sm:max-h-[90vh] flex flex-col ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"}`}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FolderGit2 className="w-5 h-5" /> Edit Projects
              </h2>
              <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-4 md:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow ${darkMode ? "bg-[#121213]" : "bg-gray-50/30"}`}>
              
              {/* ── Hint Banner ── */}
              <div className="p-[2px] bg-gradient-to-tr from-violet-500 via-blue-500 to-cyan-500 rounded-xl">
                <div className={`p-4 rounded-[calc(0.75rem-2px)] flex items-start gap-3 ${darkMode ? 'bg-[#121213] text-violet-300' : 'bg-violet-50 text-violet-800'}`}>
                  <FolderGit2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm leading-relaxed space-y-1">
                    <p className="font-black uppercase tracking-wide">Earn Points for Projects!</p>
                    <p>Add up to <span className="font-black">2 projects with valid links</span> to earn <span className="font-black">5 points each</span> (maximum <span className="font-black">10 points</span> total).</p>
                    <div className={`mt-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest rounded-lg px-3 py-1.5 w-max ${darkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
                      <span>
                        {projectsWithLinks >= 2
                          ? `✅ ${pointsEarning}/10 pts — Maximum reached!`
                          : `${projectsWithLinks}/2 projects with links — Currently earning ${pointsEarning}/10 pts`}
                      </span>
                    </div>
                    <p className={`text-[10px] font-medium mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      Mandatory fields: Title, Project Goal, Description, Start & End Date.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Project Cards ── */}
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_10px_30px_rgba(37,99,235,0.2)] transition-all duration-300"
                >
                  <div className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-[calc(2.5rem-2.5px)] overflow-hidden shadow-2xl`}>
                    
                    {/* Card Header */}
                    <div
                      onClick={() => toggleCollapse(index)}
                      className={`p-5 flex items-center justify-between cursor-pointer select-none border-b border-dashed ${darkMode ? "border-white/10" : "border-gray-200"} ${!collapsedCards[index] ? (darkMode ? "bg-blue-600/10" : "bg-blue-50/50") : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-blue-500">
                          {!collapsedCards[index] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className={`font-black uppercase tracking-tight text-sm ${!collapsedCards[index] ? "text-blue-500" : darkMode ? "text-slate-300" : "text-gray-700"}`}>
                            {project.title || `New Project ${index + 1}`}
                          </h3>
                          {project.link && (
                            <span className="text-[10px] text-green-500 font-black uppercase tracking-wider">✓ Link added — Earning 5 pts</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeProject(index); }}
                        className={`p-2 rounded-xl transition-all ${darkMode ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}
                        title="Remove Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Card Form */}
                    {!collapsedCards[index] && (
                      <div className="p-5 sm:p-8 space-y-6">

                        {/* Title Row */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-title`] ? 'text-red-500' : darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <FolderGit2 className="w-3.5 h-3.5" /> Project Title <span className="text-red-500">*</span>
                          </label>
                          <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl ${errors[`${index}-title`] ? 'from-red-500 to-red-600' : ''}`}>
                            <input
                              type="text"
                              value={project.title}
                              onChange={(e) => handleChange(index, "title", e.target.value)}
                              placeholder="e.g. Campus Connect Portal"
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                            />
                          </div>
                          {errors[`${index}-title`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors[`${index}-title`]}</p>}
                        </div>

                        {/* Domain Row */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-domain`] ? 'text-red-500' : darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            Domain / Type <span className="text-red-500">*</span>
                          </label>
                          <div className={`p-[2px] bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl ${errors[`${index}-domain`] ? 'from-red-500 to-red-600' : ''}`}>
                            <input
                              type="text"
                              value={project.domain || ""}
                              onChange={(e) => handleChange(index, "domain", e.target.value)}
                              placeholder="e.g. Web Dev, Machine Learning"
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                            />
                          </div>
                          {errors[`${index}-domain`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors[`${index}-domain`]}</p>}
                        </div>

                        {/* Project Goal */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-goal`] ? 'text-red-500' : darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                            <Target className="w-3.5 h-3.5" /> Project Goal <span className="text-red-500">*</span>
                          </label>
                          <div className={`p-[2px] bg-gradient-to-tr from-orange-500 to-red-500 rounded-xl ${errors[`${index}-goal`] ? 'from-red-500 to-red-600' : ''}`}>
                            <input
                              type="text"
                              value={project.goal}
                              onChange={(e) => handleChange(index, "goal", e.target.value)}
                              placeholder="e.g. Build a platform for college students to network"
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                            />
                          </div>
                          {errors[`${index}-goal`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors[`${index}-goal`]}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-description`] ? 'text-red-500' : darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                            Description <span className="text-red-500">*</span>
                          </label>
                          <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl ${errors[`${index}-description`] ? 'from-red-500 to-red-600' : ''}`}>
                            <textarea
                              rows={3}
                              value={project.description}
                              onChange={(e) => handleChange(index, "description", e.target.value)}
                              placeholder="Describe what you built, your role, and the impact..."
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition resize-none ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                            />
                          </div>
                          {errors[`${index}-description`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors[`${index}-description`]}</p>}
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Start Date */}
                          <div className="space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-startDate`] ? 'text-red-500' : darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              <Calendar className="w-3.5 h-3.5" /> Start Date <span className="text-red-500">*</span>
                            </label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl ${errors[`${index}-startDate`] ? 'from-red-500 to-red-600' : ''}`}>
                              <div className={`grid grid-cols-2 gap-1 p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                                <select value={project.startMonth} onChange={(e) => handleChange(index, "startMonth", e.target.value)} className={`p-2 rounded-lg text-sm outline-none ${darkMode ? "bg-[#121213] text-white" : "bg-white text-gray-900"}`}>
                                  <option value="">Month</option>
                                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select value={project.startYear} onChange={(e) => handleChange(index, "startYear", e.target.value)} className={`p-2 rounded-lg text-sm outline-none ${darkMode ? "bg-[#121213] text-white" : "bg-white text-gray-900"}`}>
                                  <option value="">Year</option>
                                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                              </div>
                            </div>
                            {errors[`${index}-startDate`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors[`${index}-startDate`]}</p>}
                          </div>

                          {/* End Date */}
                          <div className="space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-endDate`] ? 'text-red-500' : darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              <Calendar className="w-3.5 h-3.5" /> End Date {!project.isOngoing && <span className="text-red-500">*</span>}
                            </label>
                            {project.isOngoing ? (
                              <div className={`px-4 py-3 rounded-xl text-sm font-bold italic ${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                Currently Ongoing ✓
                              </div>
                            ) : (
                              <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl ${errors[`${index}-endDate`] ? 'from-red-500 to-red-600' : ''}`}>
                                <div className={`grid grid-cols-2 gap-1 p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                                  <select value={project.endMonth} onChange={(e) => handleChange(index, "endMonth", e.target.value)} className={`p-2 rounded-lg text-sm outline-none ${darkMode ? "bg-[#121213] text-white" : "bg-white text-gray-900"}`}>
                                    <option value="">Month</option>
                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                  </select>
                                  <select value={project.endYear} onChange={(e) => handleChange(index, "endYear", e.target.value)} className={`p-2 rounded-lg text-sm outline-none ${darkMode ? "bg-[#121213] text-white" : "bg-white text-gray-900"}`}>
                                    <option value="">Year</option>
                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                  </select>
                                </div>
                              </div>
                            )}
                            {errors[`${index}-endDate`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors[`${index}-endDate`]}</p>}

                            {/* Ongoing Checkbox */}
                            <label className="flex items-center gap-2 cursor-pointer mt-1.5 w-max">
                              <input
                                type="checkbox"
                                checked={project.isOngoing}
                                onChange={(e) => {
                                  handleChange(index, "isOngoing", e.target.checked);
                                  if (e.target.checked) {
                                    handleChange(index, "endMonth", "");
                                    handleChange(index, "endYear", "");
                                  }
                                }}
                                className="w-4 h-4 accent-blue-600"
                              />
                              <span className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Currently Ongoing</span>
                            </label>
                          </div>
                        </div>

                        {/* Tools Used */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                            <Wrench className="w-3.5 h-3.5" /> Tools / Technologies Used
                            <span className={`text-[10px] font-medium normal-case ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>(Optional)</span>
                          </label>
                          <div className="p-[2px] bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-xl">
                            <input
                              type="text"
                              value={project.toolsUsed}
                              onChange={(e) => handleChange(index, "toolsUsed", e.target.value)}
                              placeholder="e.g. React, Node.js, MongoDB (comma-separated)"
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                            />
                          </div>
                        </div>

                        {/* Project Link */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>
                            <LinkIcon className="w-3.5 h-3.5" /> Project Link
                            <span className={`text-[10px] font-medium normal-case ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>(Optional — required for points)</span>
                          </label>
                          <div className="p-[2px] bg-gradient-to-tr from-pink-500 to-rose-500 rounded-xl">
                            <input
                              type="url"
                              value={project.link}
                              onChange={(e) => handleChange(index, "link", e.target.value)}
                              placeholder="https://github.com/... or https://your-project.com"
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                            />
                          </div>

                          {/* Link Visibility Toggle */}
                          <div className={`mt-2 p-[2px] rounded-xl bg-gradient-to-tr ${project.isLinkPublic ? 'from-green-500 to-emerald-500' : 'from-slate-500 to-gray-600'}`}>
                            <label className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-[calc(0.75rem-2px)] cursor-pointer ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                              <div className="flex items-center gap-2">
                                {project.isLinkPublic ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                                <div>
                                  <p className={`text-xs font-black uppercase tracking-widest ${project.isLinkPublic ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-slate-400' : 'text-gray-500')}`}>
                                    {project.isLinkPublic ? "Link is Public" : "Link is Private"}
                                  </p>
                                  <p className={`text-[10px] font-medium ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                    Faculty & Admin can always see it • {project.isLinkPublic ? "Other students/alumni can also view" : "Hidden from other students/alumni"}
                                  </p>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={project.isLinkPublic}
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

              {/* Add Project Button */}
              <button
                type="button"
                onClick={addProject}
                className={`w-full py-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:border-solid hover:scale-[1.01] ${darkMode ? "border-blue-500/30 hover:border-blue-500 bg-blue-500/5 text-blue-400" : "border-blue-200 hover:border-blue-500 bg-blue-50 text-blue-600"}`}
              >
                <div className={`p-2 rounded-full ${darkMode ? "bg-blue-500/20" : "bg-blue-100"}`}>
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-bold">Add Project</span>
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
                  <><Save className="w-5 h-5" /> Save Projects</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
