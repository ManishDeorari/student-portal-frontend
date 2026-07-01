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
            localStorage.setItem("user", JSON.stringify(updatedUser));
            onSave(updatedUser);
            toast.success("Bio updated successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating bio");
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    };

    return (
        <>
            <LoadingOverlay isVisible={loading} />
            <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-lg max-h-[95dvh] sm:max-h-[90vh]">
                    <div className={`rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden animate-fadeIn flex flex-col transition-colors duration-500 ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white shrink-0">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Info className="w-5 h-5" /> Edit About
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white/20 p-1 border-2 border-white rounded-xl transition ml-3"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                                        Bio
                                    </label>
                                    <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            rows={6}
                                            className={`w-full p-4 rounded-[calc(0.75rem-2px)] outline-none transition duration-300 resize-none ${darkMode
                                                    ? 'bg-[#1e1e1e] text-white'
                                                    : 'bg-white text-black focus:ring-4 focus:ring-blue-500/10'
                                                }`}
                                            placeholder="Write something about yourself..."
                                        />
                                    </div>
                                </div>
                            </div>
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