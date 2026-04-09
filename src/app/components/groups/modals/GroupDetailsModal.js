"use client";
import React from "react";
import { FaTimes, FaUsers, FaImage, FaChevronRight } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import GroupAvatar from "../GroupAvatar";

export default function GroupDetailsModal({ 
    isOpen, 
    onClose, 
    group, 
    memberCount, 
    mediaCount,
    onOpenMembers,
    onOpenMedia,
    onViewImage
}) {
    const { darkMode } = useTheme();

    if (!isOpen || !group) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95dvh] sm:max-h-[90vh]">
                <div className={`relative w-full rounded-[calc(2.5rem-2.5px)] overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}>
                    
                    {/* Header */}
                    <div className="p-6 border-b dark:border-white/10 flex justify-between items-center">
                        <h2 className={`text-xl font-black tracking-tight uppercase ${darkMode ? "text-white" : "text-slate-900"}`}>Group Overview</h2>
                        <button onClick={onClose} className={`p-2 rounded-full transition-colors ${darkMode ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-900"}`}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        <div className="flex flex-col items-center text-center mb-10">
                            <div 
                                onClick={() => onViewImage(group.profileImage || "/default-group.jpg")}
                                className="p-[2px] rounded-[2.5rem] bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 shadow-2xl mb-6 scale-110 cursor-zoom-in hover:scale-[1.15] transition-transform"
                            >
                                <div className={`relative w-32 h-32 rounded-[calc(2.5rem-2px)] overflow-hidden ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
                                    <GroupAvatar group={group} size={128} />
                                </div>
                            </div>
                            <h3 className={`text-3xl font-black tracking-tighter mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>{group.name}</h3>
                            <div className="p-[1.5px] rounded-3xl bg-gradient-to-r from-blue-500/30 to-purple-500/30">
                                <div className={`px-6 py-4 rounded-[calc(1.5rem-1.5px)] text-sm font-black leading-relaxed ${darkMode ? "bg-slate-950 text-slate-400" : "bg-white text-slate-900"}`}>
                                    {group.description || "In a world of constant communication, this group serves as a dedicated space for collaboration and community."}
                                </div>
                            </div>
                        </div>

                        {/* Quick Access Buttons */}
                        <div className="space-y-5">
                            <div className="p-[1.5px] rounded-[2rem] bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg transition-all hover:scale-[1.02]">
                                <button 
                                    onClick={onOpenMembers}
                                    className={`w-full p-6 rounded-[calc(2rem-1.5px)] flex items-center justify-between transition-all group ${darkMode ? "bg-slate-950" : "bg-white"}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 shadow-inner">
                                            <FaUsers size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-[10px] uppercase tracking-[0.3em] text-blue-500 mb-0.5">Community</p>
                                            <p className={`font-black text-xl ${darkMode ? "text-white" : "text-slate-900"}`}>{memberCount} Members</p>
                                        </div>
                                    </div>
                                    <FaChevronRight className="text-slate-500 group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>

                            <div className="p-[1.5px] rounded-[2rem] bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg transition-all hover:scale-[1.02]">
                                <button 
                                    onClick={onOpenMedia}
                                    className={`w-full p-6 rounded-[calc(2rem-1.5px)] flex items-center justify-between transition-all group ${darkMode ? "bg-slate-950" : "bg-white"}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-500 shadow-inner">
                                            <FaImage size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-[10px] uppercase tracking-[0.3em] text-purple-500 mb-0.5">Gallery</p>
                                            <p className={`font-black text-xl ${darkMode ? "text-white" : "text-slate-900"}`}>{mediaCount} Shared Files</p>
                                        </div>
                                    </div>
                                    <FaChevronRight className="text-slate-500 group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Decoration */}
                    <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />
                </div>
            </div>
        </div>

    );
}
