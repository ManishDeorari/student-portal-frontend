import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Save, Briefcase, BarChart, Settings, Layers, Code } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

const FUNCTIONAL_AREAS = [
    "Software Engineering", "Frontend Development", "Backend Development", "Full Stack Development",
    "Data Science", "Machine Learning", "Mobile App Development", "UI/UX Design",
    "Product Management", "Project Management", "Marketing", "Sales",
    "Human Resources", "Finance", "Operations", "Quality Assurance"
];

const INDUSTRIES = [
    "IT Services", "E-commerce", "Fintech", "Healthtech", "Edtech",
    "Automotive", "Banking", "Telecommunications", "Manufacturing", "Real Estate"
];

const EXPERIENCE_LEVELS = [
    "Fresher", "0-1 Year", "1-3 Years", "3-5 Years", "5-7 Years", "7-10 Years", "10+ Years"
];

export default function EditWorkProfileModal({ isOpen, onClose, currentWorkProfile, currentSkills, onSave }) {
    const { darkMode } = useTheme();
    const [workProfile, setWorkProfile] = useState({
        functionalArea: "",
        subFunctionalArea: "",
        experience: "",
        industry: ""
    });
    const [skills, setSkills] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setWorkProfile({
                functionalArea: currentWorkProfile?.functionalArea || "",
                subFunctionalArea: currentWorkProfile?.subFunctionalArea || "",
                experience: currentWorkProfile?.experience || "",
                industry: currentWorkProfile?.industry || ""
            });
            setSkills(Array.isArray(currentSkills) ? currentSkills.join(", ") : "");
        }
    }, [currentWorkProfile, currentSkills, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setWorkProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    workProfile,
                    skills: skillsArray
                }),
            });

            if (!res.ok) throw new Error("Failed to update work profile");

            const updatedUser = await res.json();
            onSave(updatedUser);
            toast.success("Work Profile & Skills updated!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating work profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <LoadingOverlay isVisible={loading} />
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-lg max-h-[95dvh] sm:max-h-[90vh]">
                <div className={`${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Briefcase className="w-5 h-5" /> Work Profile & Skills
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-[#FAFAFA]/20 p-1 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className={`p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                    <datalist id="area-suggestions">
                        {FUNCTIONAL_AREAS.map(a => <option key={a} value={a} />)}
                    </datalist>
                    <datalist id="industry-suggestions">
                        {INDUSTRIES.map(i => <option key={i} value={i} />)}
                    </datalist>
                    <datalist id="exp-suggestions">
                        {EXPERIENCE_LEVELS.map(e => <option key={e} value={e} />)}
                    </datalist>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                <BarChart className="w-3.5 h-3.5" /> Functional Area
                            </label>
                            <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                                <input
                                    type="text"
                                    list="area-suggestions"
                                    className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                    value={workProfile.functionalArea}
                                    onChange={(e) => handleChange("functionalArea", e.target.value)}
                                    placeholder="Ex: Software Engineering"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                <Settings className="w-3.5 h-3.5" /> Sub-Functional Area
                            </label>
                            <div className="p-[2px] bg-gradient-to-tr from-blue-600/50 to-purple-600/50 rounded-xl shadow-sm focus-within:from-blue-600 focus-within:to-purple-600 transition-all">
                                <input
                                    type="text"
                                    className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                    value={workProfile.subFunctionalArea}
                                    onChange={(e) => handleChange("subFunctionalArea", e.target.value)}
                                    placeholder="Ex: Backend Development"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                    <Layers className="w-3.5 h-3.5" /> Experience
                                </label>
                                <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                                    <input
                                        type="text"
                                        list="exp-suggestions"
                                        className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                        value={workProfile.experience}
                                        onChange={(e) => handleChange("experience", e.target.value)}
                                        placeholder="Ex: 1-3 Years"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                    <BarChart className="w-3.5 h-3.5" /> Industry
                                </label>
                                <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                                    <input
                                        type="text"
                                        list="industry-suggestions"
                                        className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                        value={workProfile.industry}
                                        onChange={(e) => handleChange("industry", e.target.value)}
                                        placeholder="Ex: Fintech"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Skills Field */}
                        <div className={`space-y-1.5 pt-2 border-t ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                <Code className="w-3.5 h-3.5" /> Key Skills (comma separated)
                            </label>
                            <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-sm">
                                <textarea
                                    className={`w-full p-4 rounded-[calc(1rem-2px)] h-32 outline-none transition custom-scrollbar ${darkMode ? 'bg-[#121213] text-white placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-400'}`}
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    placeholder="Ex: React, Node.js, Python, Leadership"
                                />
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
