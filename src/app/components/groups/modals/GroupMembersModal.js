"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FaTimes, FaSearch, FaUserPlus, FaCheck, FaChevronDown } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

export default function GroupMembersModal({ 
    isOpen, 
    onClose, 
    members, 
    currentUser, 
    onConnect 
}) {
    const { darkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    if (!isOpen) return null;

    // Filter members
    const filtered = members.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.enrollmentNumber && m.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const mRole = (m.role || (m.isMainAdmin ? "admin" : "student")).toUpperCase();
        const matchesRole = roleFilter === "ALL" || mRole === roleFilter;

        return matchesSearch && matchesRole;
    });

    // Sort: Admin -> Faculty -> Student
    const sortedMembers = [...filtered].sort((a, b) => {
        const roleOrder = { "admin": 1, "faculty": 2, "student": 3 };
        const roleA = a.role || (a.isMainAdmin ? "admin" : "student");
        const roleB = b.role || (b.isMainAdmin ? "admin" : "student");
        return (roleOrder[roleA] || 4) - (roleOrder[roleB] || 4);
    });

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-xl p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95dvh] sm:max-h-[90vh]">
                <div className={`relative w-full rounded-[calc(2.5rem-2.5px)] overflow-hidden flex flex-col h-[80vh] ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}>
                    
                    {/* Header */}
                    <div className="p-6 border-b dark:border-white/10 flex justify-between items-center">
                        <div>
                            <h2 className={`text-xl font-black tracking-tight uppercase ${darkMode ? "text-white" : "text-slate-900"}`}>Group Community</h2>
                            <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">{members.length} Total Members</p>
                        </div>
                        <button onClick={onClose} className={`p-2 rounded-full transition-colors ${darkMode ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-900"}`}>
                            <FaTimes />
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="px-6 pt-6 flex gap-3">
                        <div className="flex-1 p-[1.5px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg">
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-[calc(1rem-1.5px)] h-full transition-all ${darkMode ? "bg-black focus-within:bg-slate-950" : "bg-white"}`}>
                                <FaSearch className="text-blue-500" size={14} />
                                <input 
                                    type="text" 
                                    placeholder="Search members..." 
                                    className={`bg-transparent border-none outline-none w-full font-black text-sm ${darkMode ? "text-white" : "text-slate-900"}`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-md">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className={`px-4 py-3 rounded-[calc(1rem-1.5px)] h-full appearance-none font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer pr-12 ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}
                            >
                                <option value="ALL">ALL</option>
                                <option value="ADMIN">ADMINS</option>
                                <option value="FACULTY">FACULTY</option>
                                <option value="STUDENT">STUDENT</option>
                            </select>
                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-purple-500" size={12} />
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                        {sortedMembers.map((member) => {
                            const isMe = String(member._id) === String(currentUser?._id);
                            
                            // Check if member is in currentUser's connections array
                            const isConnected = currentUser?.connections?.some(connId => 
                                String(connId) === String(member._id)
                            );
                            
                            const role = member.role || (member.isMainAdmin ? "admin" : "student");

                            return (
                                <div key={member._id} className="p-[1.5px] rounded-[2rem] bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 shadow-lg transition-all hover:scale-[1.01]">
                                    <div className={`p-4 rounded-[calc(2rem-1.5px)] flex items-center justify-between ${darkMode ? "bg-slate-950" : "bg-white"}`}>
                                        <div className="flex items-center gap-5">
                                            <div className="p-[2.5px] rounded-2xl bg-gradient-to-tr from-blue-400 to-pink-500 shadow-xl">
                                                <div className="relative w-14 h-14 rounded-[calc(1rem-2.5px)] overflow-hidden bg-slate-800">
                                                    <Image 
                                                        src={member.profilePicture || "/default-profile.jpg"} 
                                                        fill 
                                                        className="object-cover" 
                                                        alt={member.name} 
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Link 
                                                        href={`/profile/${member.publicId || member._id}`} 
                                                        className={`font-black tracking-tight text-[15px] hover:text-blue-500 underline underline-offset-4 decoration-blue-500/0 hover:decoration-blue-500/50 transition-all cursor-pointer ${darkMode ? "text-white" : "text-slate-900"}`}
                                                    >
                                                        {member.name}
                                                    </Link>
                                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                                                        role === 'admin' ? 'bg-yellow-500/20 text-yellow-500' : 
                                                        role === 'faculty' ? 'bg-purple-500/20 text-purple-500' : 
                                                        'bg-blue-500/20 text-blue-500'
                                                    }`}>
                                                        {role}
                                                    </span>
                                                </div>
                                                {!member.isMainAdmin ? (
                                                    <p className={`text-[10px] font-black uppercase tracking-[0.1em] mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                                        {(role === 'faculty' || role === 'admin') 
                                                            ? (member.employeeId || "Faculty") 
                                                            : (member.enrollmentNumber || "Student")}
                                                    </p>
                                                ) : (
                                                    <div className="h-3" />
                                                )}
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>

    );
}
