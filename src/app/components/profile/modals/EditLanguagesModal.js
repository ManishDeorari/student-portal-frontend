import React, { useState, useEffect } from "react";
import { X, Plus, Save, Languages } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";

export default function EditLanguagesModal({ isOpen, onClose, currentLanguages, onSave }) {
    const { darkMode } = useTheme();
    const [languages, setLanguages] = useState([]);
    const [newLanguage, setNewLanguage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLanguages(currentLanguages ? [...currentLanguages] : []);
            setNewLanguage("");
        }
    }, [isOpen, currentLanguages]);

    if (!isOpen) return null;

    const handleAddLanguage = (e) => {
        e.preventDefault();
        const trimmed = newLanguage.trim();
        if (!trimmed) return;
        
        // Prevent duplicates
        if (languages.some(l => l.toLowerCase() === trimmed.toLowerCase())) {
            toast.error("Language already added");
            return;
        }

        setLanguages([...languages, trimmed]);
        setNewLanguage("");
    };

    const handleRemoveLanguage = (langName) => {
        setLanguages(languages.filter(l => l !== langName));
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
                body: JSON.stringify({ languages }),
            });

            if (!res.ok) throw new Error("Failed to save languages");
            
            const updatedProfile = await res.json();
            onSave(updatedProfile);
            toast.success("Languages updated successfully!");
            onClose();
        } catch (error) {
            console.error("Error saving languages:", error);
            toast.error("Error updating languages.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 h-[100dvh] w-full z-50 flex justify-center items-center p-4 bg-black/60 backdrop-blur-sm" onClick={!loading ? onClose : undefined}>
            <div className={`relative w-full max-w-lg p-[2.5px] bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 rounded-[calc(1.5rem+2.5px)] shadow-2xl overflow-hidden transform transition-all duration-300 scale-100`} onClick={e => e.stopPropagation()}>
                <div className={`relative w-full h-full rounded-[1.5rem] p-6 flex flex-col max-h-[85vh] ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
                    
                    <div className="flex items-center justify-between mb-6 flex-shrink-0">
                        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 flex items-center gap-2">
                            <Languages className="w-6 h-6 text-blue-500" /> Edit Languages
                        </h2>
                    <button
                        onClick={onClose}
                        className={`p-1 border-2 transition rounded-xl ${darkMode ? 'border-white text-white hover:bg-white/20' : 'border-black text-black hover:bg-black/10'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                        {/* Add Language Form */}
                        <form onSubmit={handleAddLanguage} className="space-y-3">
                            <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                Add New Language
                            </label>
                            <div className="flex gap-3">
                                <div className="relative flex-grow p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl">
                                    <input
                                        type="text"
                                        value={newLanguage}
                                        onChange={e => setNewLanguage(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                                        placeholder="e.g. English, Spanish, French..."
                                        className={`w-full p-3 rounded-[calc(0.75rem-2px)] outline-none transition-colors ${darkMode ? 'bg-[#121213] text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={!newLanguage.trim()}
                                    className={`px-4 rounded-xl flex justify-center items-center font-bold text-white shadow-lg transition-all
                                        ${newLanguage.trim() 
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-blue-500/50 hover:scale-105 active:scale-95' 
                                            : 'bg-gray-400 cursor-not-allowed opacity-50 shadow-none'
                                        }
                                    `}
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>
                        </form>

                        {/* Language List */}
                        <div className="space-y-3">
                            <h3 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Your Languages ({languages.length})
                            </h3>
                            
                            {languages.length === 0 ? (
                                <p className={`text-sm italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    No languages added yet.
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2.5">
                                    {languages.map((lang, idx) => (
                                        <div 
                                            key={idx}
                                            className="p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full group"
                                        >
                                            <div className={`flex items-center gap-2 pl-4 pr-2 py-1.5 rounded-[calc(9999px-2px)] ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                                                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {lang}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveLanguage(lang)}
                                                    className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                                                    title="Remove language"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10 flex justify-end flex-shrink-0">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg transition-all
                                ${loading 
                                    ? 'bg-gray-500 cursor-wait' 
                                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-purple-500/50 hover:scale-105 active:scale-95'
                                }
                            `}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" /> Save Languages
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
