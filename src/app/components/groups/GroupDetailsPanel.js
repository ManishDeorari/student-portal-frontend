"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaTimes, FaUsers, FaSearch, FaTrash, FaChevronRight, FaImage, FaDownload } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";

export default function GroupDetailsPanel({ 
    isOpen, 
    onClose, 
    group, 
    messages, 
    currentUser, 
    onRemoveMember,
    onDeleteMedia
}) {
    const { darkMode } = useTheme();
    const [activeTab, setActiveTab] = useState("INFO"); // INFO | MEMBERS | MEDIA
    const [memberSearch, setMemberSearch] = useState("");
    const [mediaList, setMediaList] = useState([]);
    
    const isAdmin = currentUser?.isAdmin || currentUser?.role === "admin" || group?.admin?._id === currentUser?._id;

    useEffect(() => {
        if (messages) {
            const images = messages.filter(m => m.type === "image" && m.mediaUrl);
            setMediaList(images);
        }
    }, [messages]);

    if (!isOpen || !group) return null;

    const filteredMembers = group.members.filter(m => 
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        (m.enrollmentNumber && m.enrollmentNumber.toLowerCase().includes(memberSearch.toLowerCase()))
    );

    return (
        <div className={`fixed inset-y-0 right-0 z-[80] w-[380px] shadow-2xl transition-transform duration-500 transform ${isOpen ? "translate-x-0" : "translate-x-full"} border-l ${darkMode ? "bg-gray-900 border-white/10 text-white" : "bg-[#FAFAFA] border-gray-200 text-gray-900"}`}>
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b dark:border-white/5">
                    <h2 className="text-xl font-black tracking-tighter">Group Details</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#FAFAFA]/5 transition-colors">
                        <FaTimes className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Group Info Section */}
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="relative w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-blue-500/20 shadow-2xl mb-6 group">
                             <Image 
                                 src={group.profileImage || "/default-group.jpg"} 
                                 fill 
                                 className="object-cover transition-transform duration-500 group-hover:scale-110" 
                                 alt={group.name} 
                             />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mb-2">{group.name}</h3>
                        <p className="text-sm font-medium text-gray-500 px-4 leading-relaxed">
                            {group.description || "No description provided for this group."}
                        </p>
                    </div>

                    {/* Stats Row */}
                    <div className="px-6 grid grid-cols-2 gap-4 mb-8">
                        <div className={`p-4 rounded-3xl text-center border-2 ${darkMode ? "bg-gray-950/50 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                            <div className="text-2xl font-black text-blue-500">{group.members.length}</div>
                            <div className="text-[10px] uppercase tracking-widest font-black text-gray-500">Members</div>
                        </div>
                        <div className={`p-4 rounded-3xl text-center border-2 ${darkMode ? "bg-gray-950/50 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                            <div className="text-2xl font-black text-purple-500">{mediaList.length}</div>
                            <div className="text-[10px] uppercase tracking-widest font-black text-gray-500">Images</div>
                        </div>
                    </div>

                    {/* Tabs / Accordion Sections */}
                    <div className="px-6 space-y-4 pb-10">
                        {/* Members Accordion */}
                        <div className={`rounded-3xl border-2 transition-all ${activeTab === "MEMBERS" ? "border-blue-500/30" : "border-transparent"}`}>
                            <button 
                                onClick={() => setActiveTab(activeTab === "MEMBERS" ? "INFO" : "MEMBERS")}
                                className="w-full flex items-center justify-between p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                                        <FaUsers size={16} />
                                    </div>
                                    <span className="font-black text-sm uppercase tracking-widest">Members</span>
                                </div>
                                <FaChevronRight className={`text-gray-400 transition-transform ${activeTab === "MEMBERS" ? "rotate-90" : ""}`} />
                            </button>
                            
                            {activeTab === "MEMBERS" && (
                                <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${darkMode ? "border-white/5 bg-gray-950/50 focus-within:border-blue-500" : "border-gray-100 bg-gray-50 focus-within:border-blue-500"}`}>
                                        <FaSearch className="text-gray-400" size={12} />
                                        <input 
                                            type="text" 
                                            placeholder="Search members..." 
                                            className="bg-transparent border-none outline-none w-full text-xs font-bold"
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredMembers.map(member => (
                                            <div key={member._id} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/10">
                                                        {member.profilePicture ? (
                                                            <Image src={member.profilePicture} fill className="object-cover" alt={member.name} />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-black">{member.name[0]}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black truncate max-w-[120px]">{member.name}</span>
                                                            {(member._id === group.admin?._id || member.role === "admin") && (
                                                                <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-500 text-[8px] font-black uppercase tracking-tighter">Admin</span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 font-medium">@{member.enrollmentNumber || member.role}</span>
                                                    </div>
                                                </div>
                                                {isAdmin && member._id !== currentUser?._id && member._id !== group.admin?._id && (
                                                    <button 
                                                        onClick={() => onRemoveMember(member._id)}
                                                        className="p-2 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all"
                                                        title="Remove Member"
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Media Gallery Accordion */}
                        <div className={`rounded-3xl border-2 transition-all ${activeTab === "MEDIA" ? "border-purple-500/30" : "border-transparent"}`}>
                            <button 
                                onClick={() => setActiveTab(activeTab === "MEDIA" ? "INFO" : "MEDIA")}
                                className="w-full flex items-center justify-between p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                                        <FaImage size={16} />
                                    </div>
                                    <span className="font-black text-sm uppercase tracking-widest">Shared Media</span>
                                </div>
                                <FaChevronRight className={`text-gray-400 transition-transform ${activeTab === "MEDIA" ? "rotate-90" : ""}`} />
                            </button>

                            {activeTab === "MEDIA" && (
                                <div className="p-4 pt-0 animate-in slide-in-from-top-2 duration-300">
                                    {mediaList.length === 0 ? (
                                        <div className="py-10 text-center text-gray-500 font-bold uppercase text-[10px] tracking-widest italic opacity-50">No media shared yet</div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {mediaList.map((msg) => (
                                                <div key={msg._id} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border border-white/5 shadow-sm">
                                                    <Image 
                                                        src={msg.mediaUrl} 
                                                        fill 
                                                        sizes="(max-width: 768px) 33vw, 120px"
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110" 
                                                        alt="Shared Media" 
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                        {isAdmin && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); onDeleteMedia(msg._id); }}
                                                                className="p-1.5 bg-red-600 text-white rounded-lg hover:scale-110 transition-transform"
                                                                title="Delete Media"
                                                            >
                                                                <FaTrash size={10} />
                                                            </button>
                                                        )}
                                                        <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-1.5 bg-[#FAFAFA] text-black rounded-lg hover:scale-110 transition-transform">
                                                            <FaDownload size={10} />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t dark:border-white/5 space-y-3">
                    {isAdmin && (
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 text-center mb-4 italic opacity-80">Admin Privilege Active</p>
                    )}
                </div>
            </div>
        </div>
    );
}
