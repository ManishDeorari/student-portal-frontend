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
        let processedValue = value;
        if (field === "experience") {
            processedValue = processedValue.replace(/[^0-9\.]/g, '');
        } else if (field === "industry" || field === "functionalArea" || field === "subFunctionalArea") {
            processedValue = processedValue.replace(/[^a-zA-Z0-9\s\.\-]/g, '');
        }
        setWorkProfile((prev) => ({ ...prev, [field]: processedValue }));
    };

    const handleJobChange = (field, value) => {
        let processedValue = value;
        if (field === "preferredRoles") {
            processedValue = processedValue.replace(/[^a-zA-Z0-9\s\.\-,]/g, '');
        }
        setJobPreferences((prev) => ({ ...prev, [field]: processedValue }));
    };

    const handleLocationsChange = (value) => {
        let processedValue = value.replace(/[^a-zA-Z\s\-,]/g, '');
        const locations = processedValue.split(",").map((loc) => loc.trim());
        setJobPreferences((prev) => ({ ...prev, preferredLocations: locations }));
    };

    const handleSave = async () => {
        if (loading) return;
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
            localStorage.setItem("user", JSON.stringify(updatedUser));
            onSave(updatedUser);
            toast.success("Job Info updated successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating job info");
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };

    return (
        <>
        <LoadingOverlay isVisible={loading} />
        <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-2xl max-h-[95dvh] sm:max-h-[90vh]">
                <div className={`${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Briefcase className="w-5 h-5" /> Edit Job Info & Skills
                    </h2>
                    
                    <div className="flex items-center">
<button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                        {loading ? "Saving..." : "Save All Changes"}
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
