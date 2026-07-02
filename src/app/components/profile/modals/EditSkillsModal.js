import React, { useState, useEffect } from "react";
import { X, Plus, Save, Info } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";

export default function EditSkillsModal({ isOpen, onClose, currentSkills, onSave }) {
    const { darkMode } = useTheme();
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [loading, setLoading] = useState(false);

    const categorySuggestions = ["Languages", "Developer Tools", "Frameworks", "Databases", "Coursework", "Areas of Interest", "Soft Skills", "Core Competencies", "Other"];

    useEffect(() => {
        if (isOpen) {
            setSkills(currentSkills ? [...currentSkills] : []);
            setNewSkill("");
        }
    }, [isOpen, currentSkills]);

    if (!isOpen) return null;

    const handleAddSkill = (e) => {
        e.preventDefault();
        const trimmed = newSkill.trim();
        if (!trimmed) return;
        
        if (skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
            toast.error("Skill already added");
            return;
        }

        const catTrimmed = newCategory.trim() || "Other";
        setSkills([...skills, { name: trimmed, category: catTrimmed, endorsements: [] }]);
        setNewSkill("");
    };

    const handleRemoveSkill = (skillName) => {
        setSkills(skills.filter(s => s.name !== skillName));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ profileSkills: skills }),
            });

            if (!res.ok) throw new Error("Failed to save skills");
            
            const updatedProfile = await res.json();
            onSave(updatedProfile);
            toast.success("Skills updated successfully!");
            onClose();
        } catch (error) {
            console.error("Error saving skills:", error);
            toast.error("Error updating skills.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 h-[100dvh] w-full z-50 flex justify-center items-center p-4 bg-black/60 backdrop-blur-sm" onClick={!loading ? onClose : undefined}>
            <div className={`relative w-full max-w-lg p-[2.5px] bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 rounded-[calc(1.5rem+2.5px)] shadow-2xl overflow-hidden transform transition-all duration-300 scale-100`} onClick={e => e.stopPropagation()}>
                <div className={`relative w-full h-full rounded-[1.5rem] flex flex-col max-h-[85vh] ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                    <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center flex-shrink-0">
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                            Skills & Competencies
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                        <div className="p-[2px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 rounded-xl">
                            <div className={`p-4 rounded-[calc(0.75rem-2px)] flex items-start gap-3 ${darkMode ? 'bg-[#121213] text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
                                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div className="text-sm leading-relaxed">
                                    <p className="font-bold mb-0.5">Automated Points System Active!</p>
                                    <p>Adding skills awards you points automatically based on quantity. Add more skills to earn more points!</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleAddSkill} className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-[2] p-[2px] rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        placeholder="Skill (e.g. React.js)"
                                        className={`w-full h-full px-4 py-3 rounded-[calc(0.75rem-2px)] font-bold ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'} outline-none transition-colors`}
                                    />
                                </div>
                                <div className="flex-[1.5] p-[2px] rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        list="category-suggestions"
                                        placeholder="Category"
                                        className={`w-full h-full px-4 py-3 rounded-[calc(0.75rem-2px)] font-bold ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'} outline-none transition-colors`}
                                    />
                                    <datalist id="category-suggestions">
                                        {categorySuggestions.map(cat => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newSkill.trim()}
                                    className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 transition-all disabled:opacity-50 flex justify-center items-center"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </form>

                        <div className="space-y-6">
                            {skills.length === 0 && (
                                <p className={`text-sm italic ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No skills added yet.</p>
                            )}
                            
                            {Array.from(new Set(skills.map(s => s.category || "Other"))).map(category => (
                                <div key={category} className="p-[2px] rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-sm transition-transform hover:scale-[1.01]">
                                    <div className={`p-4 rounded-[calc(1rem-2px)] h-full ${darkMode ? 'bg-[#121213]' : 'bg-white'} space-y-3`}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm"></div>
                                            <h4 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {category}
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {skills.filter(s => (s.category || "Other") === category).map((skill, idx) => (
                                                <div key={idx} className="p-[2px] rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-md relative z-10">
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[calc(9999px-2px)] ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                                                        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{skill.name}</span>
                                                        <button
                                                            onClick={() => handleRemoveSkill(skill.name)}
                                                            className={`p-1 rounded-full ${darkMode ? 'hover:bg-slate-800 text-gray-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'} transition-colors`}
                                                            title="Remove skill"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3 flex-shrink-0 bg-gray-50 dark:bg-white/5 rounded-b-[1.5rem]">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-95 active:scale-95 transition-transform disabled:opacity-70"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? "Saving..." : "Save Skills"}
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
    );
}


