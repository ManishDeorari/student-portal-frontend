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

    // Predefined suggestions for autocomplete
    const categorySuggestions = ["Languages", "Developer Tools", "Frameworks", "Databases", "Coursework", "Areas of Interest", "Soft Skills", "Core Competencies", "Other"];

    useEffect(() => {
        if (isOpen) {
            // Copy existing skills and preserve endorsements
            setSkills(currentSkills ? [...currentSkills] : []);
            setNewSkill("");
        }
    }, [isOpen, currentSkills]);

    if (!isOpen) return null;

    const handleAddSkill = (e) => {
        e.preventDefault();
        const trimmed = newSkill.trim();
        if (!trimmed) return;
        
        // Prevent duplicates
        if (skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
            toast.error("Skill already added");
            return;
        }

        const catTrimmed = newCategory.trim() || "Other";
        setSkills([...skills, { name: trimmed, category: catTrimmed, endorsements: [] }]);
        setNewSkill("");
        // Intentionally keep category same to allow fast entry of multiple skills in one category
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
                <div className={`relative w-full h-full rounded-[1.5rem] p-6 flex flex-col max-h-[85vh] ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
                    
                    <div className="flex items-center justify-between mb-6 flex-shrink-0">
                        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                            Edit Skills
                        </h2>
                        <button 
                            onClick={onClose}
                            disabled={loading}
                            className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                        {/* Guide Text */}
                        <div className="p-[2px] bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-xl">
                            <div className={`p-4 rounded-[calc(0.75rem-2px)] flex items-start gap-3 ${darkMode ? 'bg-[#121213] text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
                                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div className="text-sm leading-relaxed">
                                    <p className="font-bold mb-0.5">Earn Points for Skills!</p>
                                    <p>You automatically earn <span className="font-bold">+1 point</span> for every skill you add, up to a maximum of <span className="font-bold">10 points</span>. Points are added to your Engagement score.</p>
                                </div>
                            </div>
                        </div>

                        {/* Add Skill Form */}
                        <form onSubmit={handleAddSkill} className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-1 p-[2px] rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        placeholder="Skill Name (e.g. React.js, Public Speaking)"
                                        className={`w-full h-full px-4 py-3 rounded-[calc(0.75rem-2px)] font-bold ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'} outline-none transition-colors`}
                                    />
                                </div>
                                <div className="flex-1 p-[2px] rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        list="category-suggestions"
                                        placeholder="Category (e.g. Frameworks)"
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

                        {/* Skills List Grouped by Category */}
                        <div className="space-y-6">
                            {skills.length === 0 && (
                                <p className={`text-sm italic ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No skills added yet.</p>
                            )}
                            
                            {Array.from(new Set(skills.map(s => s.category || "Other"))).map(category => (
                                <div key={category} className="space-y-3">
                                    <h4 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} pb-1`}>
                                        {category}
                                    </h4>
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
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t flex justify-end gap-3 flex-shrink-0 border-opacity-20 border-gray-500">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-5 py-2.5 rounded-xl border-[2px] font-bold transition-all active:scale-95 ${darkMode ? 'border-white text-white hover:bg-white/10' : 'border-black text-black hover:bg-gray-100'}`}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-95 active:scale-95 transition-transform disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Save Skills
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
