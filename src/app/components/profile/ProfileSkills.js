import React, { useState } from "react";
import SectionCard from "./SectionCard";
import { useTheme } from "@/context/ThemeContext";
import { ThumbsUp, Wrench, BadgeCheck } from "lucide-react";
import EditSkillsModal from "./modals/EditSkillsModal";
import toast from "react-hot-toast";

export default function ProfileSkills({ profile, setProfile, isPublicView, currentUserId }) {
    const { darkMode } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [skills, setSkills] = useState(profile?.profileSkills || []);

    // Sync local state when profile prop updates (e.g. after data fetch finishes)
    React.useEffect(() => {
        if (profile?.profileSkills) {
            setSkills(profile.profileSkills);
        }
    }, [profile?.profileSkills]);

    const hasSkills = skills && skills.length > 0;

    const handleSave = (updatedProfile) => {
        setSkills(updatedProfile.profileSkills || []);
        setProfile((prev) => ({
            ...prev,
            ...updatedProfile,
        }));
    };

    const toggleEndorsement = async (skillName) => {
        if (!isPublicView) return; // Cannot endorse yourself
        if (!currentUserId) return; // Must be logged in
        if (currentUserId === profile._id) return; // Redundant check

        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/skills/endorse/${profile._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ skillName }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to endorse skill");
            }

            const updatedSkills = await res.json();
            setSkills(updatedSkills);
            toast.success("Endorsement updated!");
        } catch (error) {
            console.error("Error endorsing skill:", error);
            toast.error(error.message || "Error toggling endorsement");
        }
    };

    return (
        <>
            <SectionCard
                title="Skills & Endorsements"
                hasData={hasSkills}
                onEdit={!isPublicView ? () => setIsEditing(true) : undefined}
                isPublicView={isPublicView}
            >
                {hasSkills ? (
                    <div className="flex flex-col gap-6 mt-2">
                        {Array.from(new Set(skills.map(s => s.category || "Other"))).map(category => (
                            <div key={category} className="p-[2px] rounded-2xl bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 shadow-sm">
                                <div className={`p-5 rounded-[calc(1rem-2px)] space-y-4 ${darkMode ? 'bg-slate-800/90' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm"></div>
                                    <h4 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {category}
                                    </h4>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {skills.filter(s => (s.category || "Other") === category).map((skill, idx) => {
                                        const endorsementCount = skill.endorsements?.length || 0;
                                        const hasEndorsed = skill.endorsements?.includes(currentUserId);
                                        
                                        return (
                                            <div key={idx} className={`p-[2px] rounded-full shadow-sm transition-transform duration-300 hover:scale-110 hover:z-20 relative ${hasEndorsed ? 'bg-gradient-to-tr from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'}`}>
                                                <button
                                                    onClick={() => isPublicView && toggleEndorsement(skill.name)}
                                                    disabled={!isPublicView && true}
                                                    className={`relative group flex items-center gap-2 px-4 py-2 rounded-[calc(9999px-2px)] transition-all duration-300 h-full w-full
                                                        ${isPublicView ? "cursor-pointer active:scale-95" : "cursor-default"}
                                                        ${hasEndorsed 
                                                            ? (darkMode ? "bg-blue-900/40" : "bg-blue-50")
                                                            : (darkMode ? "bg-[#121213] hover:bg-slate-800" : "bg-white hover:bg-gray-50")
                                                        }
                                                    `}
                                                    title={isPublicView ? (hasEndorsed ? "Remove endorsement" : "Endorse this skill") : ""}
                                                >
                                                    <span className={`text-sm font-bold ${hasEndorsed ? (darkMode ? 'text-blue-300' : 'text-blue-700') : (darkMode ? 'text-white' : 'text-gray-900')}`}>
                                                        {skill.name}
                                                    </span>
                                                    
                                                    {endorsementCount > 0 && (
                                                        <div className={`flex items-center gap-1 pl-2 border-l ${hasEndorsed ? 'border-blue-400' : (darkMode ? 'border-gray-600' : 'border-gray-300')} opacity-80`}>
                                                            <BadgeCheck className={`w-4 h-4 ${hasEndorsed ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-gray-400' : 'text-gray-500')}`} />
                                                            <span className={`text-xs font-black ${hasEndorsed ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                                                                {endorsementCount}
                                                            </span>
                                                        </div>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`py-6 text-center rounded-lg border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                        <Wrench className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'} font-medium`}>No skills added yet.</p>
                    </div>
                )}
            </SectionCard>

            {!isPublicView && (
                <EditSkillsModal
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    currentSkills={skills}
                    onSave={handleSave}
                />
            )}
        </>
    );
}


