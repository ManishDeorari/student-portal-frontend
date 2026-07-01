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
                        
                        <div className="flex items-center">
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
<button
                        onClick={onClose}
                        className={`p-1 border-2 transition rounded-xl ml-3 ${darkMode ? 'border-white text-white hover:bg-white/20' : 'border-black text-black hover:bg-black/10'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
