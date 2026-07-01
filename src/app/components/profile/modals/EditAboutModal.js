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
        if (loading) return;
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
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };

    return (
        <>
        <LoadingOverlay isVisible={loading} />
        <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-lg max-h-[95dvh] sm:max-h-[90vh]">
                <div className={`rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden animate-fadeIn transition-colors duration-500 ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Info className="w-5 h-5" /> Edit About
                    </h2>
                    
                    <div className="flex items-center">
<button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
<button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-1 border-2 border-white rounded-xl transition ml-3"
                    >
                        <X className="w-5 h-5" />
                    </button>
</div>
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
