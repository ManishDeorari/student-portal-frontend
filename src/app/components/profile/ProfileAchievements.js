import React, { useState } from "react";
import SectionCard from "./SectionCard";
import { Award, Calendar, ExternalLink, Globe, Lock, ImageIcon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import EditAchievementsModal from "./modals/EditAchievementsModal";
import ImageViewerModal from "./ImageViewerModal";

export default function ProfileAchievements({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProofImage, setSelectedProofImage] = useState(null);

    const handleSave = (updatedUser) => {
        setProfile(updatedUser);
        setIsEditing(false);
    };

    const viewerRole = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "{}")?.role
        : null;

    const canSeePrivate = !isPublicView || viewerRole === "admin" || viewerRole === "faculty";

    const hasData = profile.achievements && profile.achievements.length > 0;

    return (
        <>
            <SectionCard title="Honors & Awards" hasData={hasData} onEdit={() => setIsEditing(true)} isPublicView={isPublicView}>
                <div className="space-y-6">
                    {hasData && profile.achievements.map((ach, index) => {
                        const showLink = ach.link && (canSeePrivate || ach.isLinkPublic);
                        const showImage = ach.proofImage && (canSeePrivate || ach.isProofPublic);

                        return (
                            <div key={index} className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_10px_30px_rgba(37,99,235,0.2)] group w-full transition-all duration-300 hover:scale-[1.02] hover:z-20 relative">
                                <div className={`p-5 rounded-[calc(2.5rem-2.5px)] flex flex-col sm:flex-row gap-4 transition duration-300 ${darkMode ? 'bg-[#121213] hover:bg-slate-900' : 'bg-[#FAFAFA] hover:bg-white'}`}>
                                    
                                    {/* Icon / Image */}
                                    <div className="flex-shrink-0">
                                        {showImage ? (
                                            <div className="relative group/img cursor-pointer" onClick={() => setSelectedProofImage(ach.proofImage)}>
                                                <img 
                                                    src={ach.proofImage} 
                                                    alt={ach.title}
                                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-sm border border-gray-200 dark:border-slate-700"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                    <span className="text-white text-[10px] font-bold">View</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50 shadow-sm'}`}>
                                                <Award className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow space-y-3">
                                        {/* Title + Date */}
                                        <div className="flex flex-col gap-1.5">
                                            <h3 className={`text-base font-black leading-tight ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'}`}>
                                                {ach.title}
                                            </h3>
                                            
                                            {/* Date Row */}
                                            <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                <Calendar className="w-3.5 h-3.5" />
                                                {ach.date}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className={`text-sm leading-relaxed font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {ach.description}
                                        </p>

                                        {/* Link & Privacy Badges Row */}
                                        <div className="flex flex-wrap items-center gap-3 pt-1">
                                            {showLink ? (
                                                <a
                                                    href={ach.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all border hover:scale-105 ${darkMode ? 'text-blue-400 border-blue-400/30 hover:bg-blue-400/10' : 'text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                                                >
                                                    <ExternalLink className="w-3 h-3" /> View Proof →
                                                </a>
                                            ) : ach.link && !ach.isLinkPublic && isPublicView ? (
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${darkMode ? 'text-slate-500 border-slate-700' : 'text-gray-400 border-gray-200'}`}>
                                                    <Lock className="w-3 h-3" /> Link Private
                                                </span>
                                            ) : null}

                                            {/* Visibility Badges — show only to owner */}
                                            {!isPublicView && (ach.link || ach.proofImage) && (
                                                <div className="flex items-center gap-2">
                                                    {ach.link && (
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${ach.isLinkPublic ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-slate-500' : 'text-gray-400')}`} title="Link Privacy">
                                                            {ach.isLinkPublic ? <><Globe className="w-3 h-3" /> Link Public</> : <><Lock className="w-3 h-3" /> Link Private</>}
                                                        </span>
                                                    )}
                                                    {ach.proofImage && (
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${ach.isProofPublic ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-slate-500' : 'text-gray-400')}`} title="Image Privacy">
                                                            {ach.isProofPublic ? <><Globe className="w-3 h-3" /> Img Public</> : <><Lock className="w-3 h-3" /> Img Private</>}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {!hasData && (
                        <div className={`py-6 text-center rounded-lg border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                            <Award className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className={`text-sm font-bold uppercase tracking-widest mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>No awards</p>
                            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Add honors or awards to your profile.</p>
                        </div>
                    )}
                </div>
            </SectionCard>

            <EditAchievementsModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                currentAchievements={profile.achievements || []}
                onSave={handleSave}
            />

            {selectedProofImage && (
                <ImageViewerModal
                    imageUrl={selectedProofImage}
                    onClose={() => setSelectedProofImage(null)}
                />
            )}
        </>
    );
}
