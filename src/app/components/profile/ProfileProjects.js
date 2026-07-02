import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditProjectsModal from "./modals/EditProjectsModal";
import { FolderGit2, Calendar, ExternalLink, Target, Wrench, Globe, Lock } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileProjects({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedUser) => {
        setProfile((prev) => ({
            ...prev,
            ...updatedUser,
            pointsAwardedForProjects: updatedUser.pointsAwardedForProjects,
        }));
    };

    const viewerRole = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "{}")?.role
        : null;

    const canSeePrivateLink = !isPublicView || viewerRole === "admin" || viewerRole === "faculty";

    const sortedProjects = profile.projects || [];

    return (
        <>
            <SectionCard
                title="Projects"
                hasData={profile.projects?.length > 0}
                onEdit={() => setIsEditing(true)}
                isPublicView={isPublicView}
            >
                <div className="space-y-6">
                    {sortedProjects.map((project, idx) => {
                        const showLink = project.link && (canSeePrivateLink || project.isLinkPublic);

                        return (
                            <div key={idx} className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_10px_30px_rgba(37,99,235,0.2)] group w-full transition-all duration-300 hover:scale-[1.02] hover:z-20 relative">
                                <div className={`p-5 rounded-[calc(2.5rem-2.5px)] flex gap-4 transition duration-300 ${darkMode ? 'bg-[#121213] hover:bg-slate-900' : 'bg-[#FAFAFA] hover:bg-white'}`}>
                                    
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50 shadow-sm'}`}>
                                            <FolderGit2 className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow space-y-3">
                                        {/* Title + Domain + Date */}
                                        <div className="flex flex-col gap-2.5">
                                            <div className="flex flex-col items-start gap-1">
                                                <h3 className={`text-base font-black leading-tight ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'}`}>
                                                    {project.title}
                                                </h3>
                                                {project.domain && (
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${darkMode ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
                                                        {project.domain}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Date Row */}
                                            <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                <Calendar className="w-3.5 h-3.5" />
                                                {project.startDate} — {project.isOngoing ? <span className="text-green-500 font-black">Ongoing</span> : project.endDate}
                                            </div>
                                        </div>

                                        {/* Project Goal */}
                                        <div className={`flex items-start gap-1.5 p-[2px] bg-gradient-to-tr from-orange-500 to-red-500 rounded-xl`}>
                                            <div className={`flex items-start gap-2 px-3 py-2 rounded-[calc(0.75rem-2px)] w-full ${darkMode ? 'bg-[#121213]' : 'bg-orange-50'}`}>
                                                <Target className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                                <p className={`text-xs font-bold leading-snug ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                                                    <span className="font-black uppercase tracking-widest">Goal: </span>{project.goal}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className={`text-sm leading-relaxed font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {project.description}
                                        </p>

                                        {/* Tools Used */}
                                        {project.toolsUsed && project.toolsUsed.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 items-center">
                                                <Wrench className={`w-3 h-3 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                                                {project.toolsUsed.map((tool, i) => (
                                                    <span key={i} className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${darkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-700'}`}>
                                                        {tool}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Link row */}
                                        <div className="flex items-center gap-3 pt-1">
                                            {showLink ? (
                                                <a
                                                    href={project.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all border hover:scale-105 ${darkMode ? 'text-blue-400 border-blue-400/30 hover:bg-blue-400/10' : 'text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                                                >
                                                    <ExternalLink className="w-3 h-3" /> View Project →
                                                </a>
                                            ) : project.link && !project.isLinkPublic && isPublicView ? (
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${darkMode ? 'text-slate-500 border-slate-700' : 'text-gray-400 border-gray-200'}`}>
                                                    <Lock className="w-3 h-3" /> Link Private
                                                </span>
                                            ) : null}

                                            {/* Visibility badge — show only to owner */}
                                            {!isPublicView && project.link && (
                                                <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${project.isLinkPublic ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-slate-500' : 'text-gray-400')}`}>
                                                    {project.isLinkPublic ? <><Globe className="w-3 h-3" /> Public</> : <><Lock className="w-3 h-3" /> Private</>}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {(!profile.projects || profile.projects.length === 0) && (
                        <div className={`py-6 text-center rounded-lg border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                            <FolderGit2 className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className={`font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No projects added yet.</p>
                        </div>
                    )}
                </div>
            </SectionCard>

            <EditProjectsModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                currentProjects={profile.projects || []}
                onSave={handleSave}
            />
        </>
    );
}

