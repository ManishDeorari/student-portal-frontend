import React, { useState } from "react";
import SectionCard from "./SectionCard";
import { Languages } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import EditLanguagesModal from "./modals/EditLanguagesModal";

export default function ProfileLanguages({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedUser) => {
        setProfile(updatedUser);
        setIsEditing(false);
    };

    const hasData = profile.languages && profile.languages.length > 0;

    return (
        <>
            <SectionCard title="Languages" hasData={hasData} onEdit={() => setIsEditing(true)} isPublicView={isPublicView}>
                <div className={`p-5 rounded-2xl border-2 transition-colors ${darkMode ? 'bg-slate-800/30 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    {hasData ? (
                        <div className="flex flex-wrap gap-2.5">
                            {profile.languages.map((lang, idx) => (
                                <div 
                                    key={idx}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm transition-all hover:scale-105 ${darkMode ? 'bg-cyan-900/20 text-cyan-300 border border-cyan-500/20' : 'bg-white text-cyan-700 border border-cyan-100 shadow-cyan-100'}`}
                                >
                                    <Languages className="w-4 h-4 opacity-70" />
                                    <span className="text-sm font-bold tracking-wide">{lang}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <Languages className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className={`text-sm font-bold uppercase tracking-widest mb-1 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>No languages</p>
                            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Add languages you speak or write.</p>
                        </div>
                    )}
                </div>
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
