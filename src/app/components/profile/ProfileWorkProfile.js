import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditWorkProfileModal from "./modals/EditWorkProfileModal";
import { Briefcase, BarChart, Settings, Layers, Code } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileWorkProfile({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedUser) => {
        setProfile((prev) => ({
            ...prev,
            workProfile: updatedUser.workProfile,
            skills: updatedUser.skills,
        }));
    };

    const hasData = profile.workProfile?.functionalArea || profile.workProfile?.industry;

    return (
        <>
            <SectionCard title="Work Profile" hasData={Object.keys(profile.workProfile || {}).length > 0} onEdit={() => setIsEditing(true)} isPublicView={isPublicView}>
                {hasData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[1.5rem] shadow-[0_10px_25px_rgba(37,99,235,0.15)]">
                            <div className={`p-4 rounded-[calc(1.5rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} shadow-sm`}>
                                    <BarChart className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Functional Area</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profile.workProfile?.functionalArea || "Not specified"}</span>
                            </div>
                        </div>

                        <div className="p-[2.5px] bg-gradient-to-tr from-purple-600 to-fuchsia-600 rounded-[1.5rem] shadow-[0_10px_25px_rgba(147,51,234,0.15)]">
                            <div className={`p-4 rounded-[calc(1.5rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'} shadow-sm`}>
                                    <Settings className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Sub-Functional Area</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profile.workProfile?.subFunctionalArea || "Not specified"}</span>
                            </div>
                        </div>

                        <div className="p-[2.5px] bg-gradient-to-tr from-orange-600 to-red-600 rounded-[1.5rem] shadow-[0_10px_25px_rgba(234,88,12,0.15)]">
                            <div className={`p-4 rounded-[calc(1.5rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-orange-900/20' : 'bg-orange-50'} shadow-sm`}>
                                    <Layers className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Total Experience</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profile.workProfile?.experience || "Not specified"}</span>
                            </div>
                        </div>

                        <div className="p-[2.5px] bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-[1.5rem] shadow-[0_10px_25px_rgba(5,150,105,0.15)]">
                            <div className={`p-4 rounded-[calc(1.5rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'} shadow-sm`}>
                                    <Briefcase className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Industry</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profile.workProfile?.industry || "Not specified"}</span>
                            </div>
                        </div>

                        {profile.skills?.length > 0 && (
                            <div className="col-span-full pt-2">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-2 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                                        <Code className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Key Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map((skill, i) => (
                                                <span key={i} className={`px-3 py-1 text-xs font-semibold rounded-full border ${darkMode ? 'bg-slate-800 text-gray-300 border-white/10' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={`py-6 text-center rounded-lg border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                        <Briefcase className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No work profile details added yet.</p>
                    </div>
                )}
            </SectionCard>

            <EditWorkProfileModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                currentWorkProfile={profile.workProfile}
                currentSkills={profile.skills || []}
                onSave={handleSave}
            />
        </>
    );
}
