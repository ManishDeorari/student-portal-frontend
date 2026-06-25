import React, { useState } from "react";
import SectionCard from "./SectionCard";
import { BookOpen, Calendar, Link as LinkIcon, Building2, Tag } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import EditPapersModal from "./modals/EditPapersModal";

export default function ProfilePapers({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedUser) => {
        setProfile(updatedUser);
        setIsEditing(false);
    };

    const hasData = profile.researchPapers && profile.researchPapers.length > 0;

    return (
        <>
            <SectionCard title="Publications & Patents" hasData={hasData} onEdit={() => setIsEditing(true)} isPublicView={isPublicView}>
                <div className="space-y-4 sm:space-y-6">
                    {hasData && profile.researchPapers.map((paper, index) => {
                        const showLink = paper.link && (!isPublicView || paper.isLinkPublic);

                        return (
                            <div key={index} className="group relative">
                                {/* Desktop hover effect bg */}
                                <div className={`absolute -inset-x-4 -inset-y-3 sm:-inset-x-6 sm:-inset-y-4 rounded-2xl sm:rounded-3xl transition-all duration-300 opacity-0 sm:group-hover:opacity-100 ${darkMode ? 'bg-blue-500/5' : 'bg-blue-50'}`} />

                                <div className="relative flex gap-4 sm:gap-6">
                                    {/* Timeline Line */}
                                    <div className="absolute left-[19px] sm:left-[23px] top-12 bottom-[-24px] sm:bottom-[-32px] w-[2px] bg-gradient-to-b from-blue-500/30 to-transparent group-last:hidden" />

                                    {/* Icon */}
                                    <div className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${darkMode ? 'bg-gradient-to-br from-blue-600 to-purple-700 shadow-blue-900/50' : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-200'}`}>
                                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow space-y-3">
                                        {/* Title + Type + Date */}
                                        <div className="flex flex-col gap-2.5">
                                            <div className="flex flex-col items-start gap-1">
                                                <h3 className={`text-base font-black leading-tight ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'}`}>
                                                    {paper.title}
                                                </h3>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${darkMode ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
                                                    <Tag className="w-3 h-3" />
                                                    {paper.type}
                                                </span>
                                            </div>

                                            {/* Date Row */}
                                            <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                <Calendar className="w-3.5 h-3.5" />
                                                Published: {paper.publishDate}
                                            </div>
                                        </div>

                                        {/* Publisher/Venue */}
                                        <div className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            <Building2 className="w-3.5 h-3.5 text-orange-500" />
                                            {paper.publisher}
                                        </div>

                                        {/* Description */}
                                        <p className={`text-sm leading-relaxed font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {paper.description}
                                        </p>

                                        {/* Link */}
                                        {showLink && (
                                            <div className="pt-1 flex">
                                                <a
                                                    href={paper.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${darkMode ? 'bg-white/10 hover:bg-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/20' : 'bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-transparent hover:border-blue-200'}`}
                                                >
                                                    <LinkIcon className="w-3.5 h-3.5" /> View Publication
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {!hasData && (
                        <div className={`py-6 text-center rounded-lg border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                            <p className={`text-sm font-bold uppercase tracking-widest mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>No publications</p>
                            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Add research papers or patents to your profile.</p>
                        </div>
                    )}
                </div>
            </SectionCard>

            <EditPapersModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                currentPapers={profile.researchPapers || []}
                onSave={handleSave}
            />
        </>
    );
}
