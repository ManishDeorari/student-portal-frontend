import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Briefcase, BarChart, Settings, Layers, Code, Heart, MapPin, Clock, DollarSign, FileText } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

export default function EditJobInfoModal({ isOpen, onClose, currentProfile, onSave }) {
    const { darkMode } = useTheme();
    const [workProfile, setWorkProfile] = useState({});
    const [jobPreferences, setJobPreferences] = useState({});
    const [skills, setSkills] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentProfile) {
            setWorkProfile(currentProfile.workProfile || {});
            setJobPreferences(currentProfile.jobPreferences || {});
            setSkills(currentProfile.skills ? currentProfile.skills.join(", ") : "");
        }
    }, [currentProfile]);

    if (!isOpen) return null;

    const handleWorkChange = (field, value) => {
        setWorkProfile((prev) => ({ ...prev, [field]: value }));
    };

    const handleJobChange = (field, value) => {
        setJobPreferences((prev) => ({ ...prev, [field]: value }));
    };

    const handleLocationsChange = (value) => {
        const locations = value.split(",").map((loc) => loc.trim());
        setJobPreferences((prev) => ({ ...prev, preferredLocations: locations }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);

            const updateData = {
                workProfile,
                jobPreferences,
                skills: skillsArray,
            };

            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (!res.ok) throw new Error("Failed to update job info");

            const updatedUser = await res.json();
            onSave(updatedUser);
            toast.success("Job Info updated successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating job info");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <LoadingOverlay isVisible={loading} />
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-2xl max-h-[95dvh] sm:max-h-[90vh]">
                <div className={`${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Briefcase className="w-5 h-5" /> Edit Job Info & Skills
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-[#FAFAFA]/20 p-1 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className={`p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                    {/* Work Profile Section */}
                    <div className={`p-5 rounded-2xl border transition-all duration-300 ${darkMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60' : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'}`}>
                        <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                            <Settings className="w-4 h-4" /> Current Work Profile
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: "Functional Area", field: "functionalArea", target: "work" },
                                { label: "Sub-Functional Area", field: "subFunctionalArea", target: "work" },
                                { label: "Experience", field: "experience", target: "work" },
                                { label: "Industry", field: "industry", target: "work" }
                            ].map((item) => (
                                <div key={item.field}>
                                    <label className={`block text-[10px] font-black mb-1.5 uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                        {item.label}
                                    </label>
                                    <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                                        <input
                                            type="text"
                                            className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-slate-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                            value={workProfile[item.field] || ""}
                                            onChange={(e) => handleWorkChange(item.field, e.target.value)}
                                            placeholder={`Enter ${item.label.toLowerCase()}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className={`p-5 rounded-2xl border transition-all duration-300 ${darkMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60' : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'}`}>
                        <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                            <Code className="w-4 h-4" /> Professional Skills
                        </h3>
                        <div>
                            <label className={`block text-[10px] font-black mb-1.5 uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                Skills (comma separated)
                            </label>
                            <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                                <input
                                    type="text"
                                    placeholder="Java, Python, Leadership, etc."
                                    className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-slate-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Job Preferences Section */}
                    <div className={`p-5 rounded-2xl border transition-all duration-300 ${darkMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60' : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'}`}>
                        <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                            <Heart className="w-4 h-4" /> Job Preferences
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-[10px] font-black mb-1.5 uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                    Preferred Functional Area
                                </label>
                                <div className="p-[2px] bg-gradient-to-tr from-blue-600/50 to-purple-600/50 rounded-xl shadow-sm focus-within:from-blue-600 focus-within:to-purple-600 transition-all">
                                    <input
                                        type="text"
                                        className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        value={jobPreferences.functionalArea || ""}
                                        onChange={(e) => handleJobChange("functionalArea", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-[10px] font-black mb-1.5 uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                    Preferred Locations
                                </label>
                                <div className="p-[2px] bg-gradient-to-tr from-blue-600/50 to-purple-600/50 rounded-xl shadow-sm focus-within:from-blue-600 focus-within:to-purple-600 transition-all">
                                    <input
                                        type="text"
                                        className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-slate-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                        value={jobPreferences.preferredLocations ? jobPreferences.preferredLocations.join(", ") : ""}
                                        onChange={(e) => handleLocationsChange(e.target.value)}
                                        placeholder="City names separated by commas"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-[10px] font-black mb-1.5 uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                    Notice Period
                                </label>
                                <div className="p-[2px] bg-gradient-to-tr from-blue-600/50 to-purple-600/50 rounded-xl shadow-sm focus-within:from-blue-600 focus-within:to-purple-600 transition-all">
                                    <input
                                        type="text"
                                        className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        value={jobPreferences.noticePeriod || ""}
                                        onChange={(e) => handleJobChange("noticePeriod", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-[10px] font-black mb-1.5 uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                    Expected Salary
                                </label>
                                <div className="p-[2px] bg-gradient-to-tr from-blue-600/50 to-purple-600/50 rounded-xl shadow-sm focus-within:from-blue-600 focus-within:to-purple-600 transition-all">
                                    <input
                                        type="text"
                                        className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        value={jobPreferences.salary || ""}
                                        onChange={(e) => handleJobChange("salary", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className={`block text-[10px] font-black mb-1.5 uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                    Resume Link
                                </label>
                                <div className="p-[2px] bg-gradient-to-tr from-blue-600/50 to-purple-600/50 rounded-xl shadow-sm focus-within:from-blue-600 focus-within:to-purple-600 transition-all">
                                    <div className="relative">
                                        <FileText className={`absolute left-3 top-2.5 w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                                        <input
                                            type="text"
                                            className={`w-full pl-9 p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-slate-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                            value={jobPreferences.resumeLink || ""}
                                            onChange={(e) => handleJobChange("resumeLink", e.target.value)}
                                            placeholder="https://drive.google.com/..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`p-4 flex justify-end gap-3 border-t flex-shrink-0 transition-all ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                    <button 
                        onClick={onClose} 
                        className={`px-6 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm ${
                            darkMode 
                                ? "border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/5" 
                                : "border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                        {loading ? "Saving..." : "Save All Changes"}
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
                    background: ${darkMode ? '#334155' : '#d1d5db'};
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${darkMode ? '#475569' : '#9ca3af'};
                }
            `}</style>
            </div>
        </div>
        </>
    );
}
