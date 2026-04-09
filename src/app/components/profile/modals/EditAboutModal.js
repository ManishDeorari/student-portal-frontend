import React, { useState } from "react";
import toast from "react-hot-toast";
import { X, Save, Info } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

export default function EditAboutModal({ isOpen, onClose, currentBio, onSave }) {
    const { darkMode } = useTheme();
    const [bio, setBio] = useState(currentBio || "");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ bio }),
            });

            if (!res.ok) throw new Error("Failed to update bio");

            const updatedUser = await res.json();
            onSave(updatedUser);
            toast.success("Bio updated successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating bio");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <LoadingOverlay isVisible={loading} />
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-lg max-h-[95dvh] sm:max-h-[90vh]">
                <div className={`rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden animate-fadeIn transition-colors duration-500 ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Info className="w-5 h-5" /> Edit About
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-[#FAFAFA]/20 p-1 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <Info className="w-3.5 h-3.5" /> Your Bio
                        </label>
                        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-sm">
                            <textarea
                                className={`w-full p-4 rounded-[calc(1rem-2.5px)] h-48 outline-none transition custom-scrollbar ${darkMode ? 'bg-[#121213] text-white placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-400'}`}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Write something about yourself..."
                            />
                        </div>
                    </div>
                </div>

                <div className={`p-4 flex justify-end gap-3 border-t transition-all ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
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
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    background: #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
            </div>
        </div>
        </>
    );
}
