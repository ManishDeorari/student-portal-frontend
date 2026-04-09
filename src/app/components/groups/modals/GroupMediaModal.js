"use client";
import React from "react";
import Image from "next/image";
import { FaTimes, FaDownload, FaTrash } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";

export default function GroupMediaModal({ 
    isOpen, 
    onClose, 
    mediaList, 
    isAdmin, 
    onDelete,
    onViewImage 
}) {
    const { darkMode } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-4xl p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95dvh] sm:max-h-[90vh]">
                <div className={`relative w-full rounded-[calc(2.5rem-2.5px)] overflow-hidden flex flex-col h-[85vh] ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}>
                    
                    {/* Header */}
                    <div className="p-6 border-b dark:border-white/10 flex justify-between items-center">
                        <div>
                            <h2 className={`text-xl font-black tracking-tight uppercase ${darkMode ? "text-white" : "text-slate-900"}`}>Shared Memories</h2>
                            <p className="text-[10px] font-black uppercase text-purple-500 tracking-[0.2em]">{mediaList.length} Images Shared</p>
                        </div>
                        <button onClick={onClose} className={`p-2 rounded-full transition-colors ${darkMode ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-900"}`}>
                            <FaTimes />
                        </button>
                    </div>

                    {/* Media Grid */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {mediaList.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 italic">
                                <div className="p-8 rounded-full bg-slate-500/10 mb-6 group-hover:scale-110 transition-transform">
                                    <p className="text-6xl">📸</p>
                                </div>
                                <p className="font-black text-[12px] uppercase tracking-[0.4em]">No shared artifacts found in this sector</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {mediaList.map((msg) => (
                                    <div 
                                        key={msg._id} 
                                        onClick={() => onViewImage(msg.mediaUrl)}
                                        className="p-[1.5px] rounded-3xl bg-gradient-to-tr from-purple-400 to-pink-500 group relative aspect-square overflow-hidden shadow-xl hover:scale-105 transition-all duration-500 cursor-zoom-in"
                                    >
                                        <div className="relative w-full h-full rounded-[calc(1.5rem-1.5px)] overflow-hidden bg-slate-900">
                                            <Image 
                                                src={msg.mediaUrl} 
                                                fill 
                                                className="object-cover transition-transform duration-700 group-hover:scale-110" 
                                                alt="Shared Group Media" 
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]">
                                                <a 
                                                    href={msg.mediaUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    onClick={e => e.stopPropagation()} 
                                                    className="p-4 bg-white text-black rounded-2xl hover:scale-110 transition-all shadow-2xl hover:bg-blue-500 hover:text-white"
                                                    title="View Full Size"
                                                >
                                                    <FaDownload size={16} />
                                                </a>
                                                {isAdmin && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onDelete(msg._id); }}
                                                        className="p-4 bg-red-600 text-white rounded-2xl hover:scale-110 transition-all shadow-2xl hover:bg-red-500"
                                                        title="Delete Image"
                                                    >
                                                        <FaTrash size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer decoration */}
                    <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />
                </div>
            </div>
        </div>

    );
}
