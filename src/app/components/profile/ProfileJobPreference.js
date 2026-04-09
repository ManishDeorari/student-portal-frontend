import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditJobPreferenceModal from "./modals/EditJobPreferenceModal";
import { Heart, MapPin, Clock, DollarSign, FileText, ExternalLink, Globe } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileJobPreference({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedUser) => {
        setProfile((prev) => ({
            ...prev,
            jobPreferences: updatedUser.jobPreferences,
        }));
    };

    const hasData = profile.jobPreferences?.functionalArea || profile.jobPreferences?.preferredLocations?.length > 0;

    return (
        <>
            <SectionCard
                title="Job Preferences"
                hasData={Object.keys(profile.jobPreferences || {}).length > 0}
                onEdit={() => setIsEditing(true)}
                isPublicView={isPublicView}
            >
                {hasData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-[2.5px] bg-gradient-to-tr from-red-600 to-pink-600 rounded-[1.5rem] shadow-[0_10px_25px_rgba(220,38,38,0.15)]">
                            <div className={`p-4 rounded-[calc(1.5rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} shadow-sm`}>
                                    <Heart className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Preferred Area</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profile.jobPreferences?.functionalArea || "Not specified"}</span>
                            </div>
                        </div>

                        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[1.5rem] shadow-[0_10px_25px_rgba(37,99,235,0.15)]">
                            <div className={`p-4 rounded-[calc(1.5rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} shadow-sm`}>
                                    <MapPin className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Preferred Locations</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {profile.jobPreferences?.preferredLocations?.length > 0 
                                      ? profile.jobPreferences.preferredLocations.join(", ") 
                                      : "Not specified"}
                                </span>
                            </div>
                        </div>

                        <div className="p-[2.5px] bg-gradient-to-tr from-orange-600 to-yellow-600 rounded-[1.5rem] shadow-[0_10px_25px_rgba(234,88,12,0.15)]">
                            <div className={`p-4 rounded-[calc(1.5rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-orange-900/20' : 'bg-orange-50'} shadow-sm`}>
                                    <Clock className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Notice Period</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profile.jobPreferences?.noticePeriod || "Not specified"}</span>
                            </div>
                        </div>

                        <div className="p-[2.5px] bg-gradient-to-tr from-green-600 to-emerald-600 rounded-[1.5rem] shadow-[0_10px_25px_rgba(5,150,105,0.15)]">
                            <div className={`p-4 rounded-[calc(1.5rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-green-900/20' : 'bg-green-50'} shadow-sm`}>
                                    <DollarSign className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Expected Salary</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profile.jobPreferences?.salary || "Not specified"}</span>
                            </div>
                        </div>

                        {profile.jobPreferences?.resumeLink && (
                            <div className="p-[2.5px] bg-gradient-to-tr from-purple-600 to-fuchsia-600 rounded-[1.5rem] shadow-[0_10px_25px_rgba(147,51,234,0.15)] md:col-span-1">
                                <div className={`p-4 rounded-[calc(1.5rem-2.5px)] h-full flex flex-col items-center text-center justify-center ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Resume / CV</label>
                                    <a href={profile.jobPreferences.resumeLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg transition shadow-sm ${darkMode ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30' : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'}`}>
                                        <FileText className="w-4 h-4" /> View Professional Resume <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                </div>
                            </div>
                        )}

                        {profile.jobPreferences?.portfolioLink && (
                            <div className="p-[2.5px] bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-[1.5rem] shadow-[0_10px_25px_rgba(8,145,178,0.15)] md:col-span-1">
                                <div className={`p-4 rounded-[calc(1.5rem-2.5px)] h-full flex flex-col items-center text-center justify-center ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-3 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>Portfolio Website</label>
                                    <a href={profile.jobPreferences.portfolioLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg transition shadow-sm ${darkMode ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200'}`}>
                                        <Globe className="w-4 h-4" /> Visit Portfolio <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={`py-6 text-center rounded-lg border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                        <Heart className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No job preferences added yet.</p>
                    </div>
                )}
            </SectionCard>

            <EditJobPreferenceModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                currentPreferences={profile.jobPreferences}
                onSave={handleSave}
            />
        </>
    );
}
