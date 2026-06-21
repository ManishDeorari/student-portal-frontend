import React, { useState, useEffect } from "react";
import { X, Plus, Save } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";

export default function EditSkillsModal({ isOpen, onClose, currentSkills, onSave }) {
    const { darkMode } = useTheme();
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState("");
    const [loading, setLoading] = useState(false);

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

        setSkills([...skills, { name: trimmed, endorsements: [] }]);
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

            const res = await fetch("http://localhost:5000/api/user/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
            <div className={`relative w-full max-w-lg p-[2.5px] bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 rounded-[calc(1.5rem+2.5px)] shadow-2xl overflow-hidden transform transition-all duration-300 scale-100`}>
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
                        {/* Add Skill Form */}
                        <form onSubmit={handleAddSkill} className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="E.g., React.js, Public Speaking, Python"
                                className={`flex-1 px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'} outline-none transition-colors`}
                            />
                            <button
                                type="submit"
                                disabled={!newSkill.trim()}
                                className="px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </form>

                        {/* Skills List */}
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'}`}
                                >
                                    <span className="text-sm font-bold">{skill.name}</span>
                                    <button
                                        onClick={() => handleRemoveSkill(skill.name)}
                                        className={`p-1 rounded-full ${darkMode ? 'hover:bg-slate-700 text-gray-400 hover:text-red-400' : 'hover:bg-gray-200 text-gray-500 hover:text-red-500'} transition-colors`}
                                        title="Remove skill"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            {skills.length === 0 && (
                                <p className={`text-sm italic ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No skills added yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t flex justify-end gap-3 flex-shrink-0 border-opacity-20 border-gray-500">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-5 py-2.5 rounded-xl font-bold transition-transform hover:scale-95 active:scale-95 ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
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
