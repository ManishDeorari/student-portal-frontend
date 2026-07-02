import React, { useState } from "react";
import SectionCard from "./SectionCard";
import { Languages } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import EditLanguagesModal from "./modals/EditLanguagesModal";

export default function ProfileLanguages({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedUser) => {
        setProfile((prev) => ({ ...prev, ...updatedUser }));
        setIsEditing(false);
    };

    const hasData = profile.languages && profile.languages.length > 0;

    return (
        <>
            <SectionCard title="Languages" hasData={hasData} onEdit={!isPublicView ? () => setIsEditing(true) : undefined} isPublicView={isPublicView}>
                {hasData ? (
                    <div className="flex flex-wrap gap-3 mt-2">
                        {profile.languages.map((lang, idx) => (
                            <div 
                                key={idx} 
                                className={`p-[2px] rounded-full shadow-sm transition-transform duration-300 hover:scale-110 hover:z-20 relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500`}
                            >
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-[calc(9999px-2px)] h-full w-full ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                                    <Languages className={`w-4 h-4 opacity-70 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{lang}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`py-6 text-center rounded-lg border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                        <Languages className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`text-sm font-bold uppercase tracking-widest mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>No languages</p>
                        <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Add languages you speak or write.</p>
                    </div>
                )}
            </SectionCard>

            <EditLanguagesModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                currentLanguages={profile.languages || []}
                onSave={handleSave}
            />
        </>
    );
}
