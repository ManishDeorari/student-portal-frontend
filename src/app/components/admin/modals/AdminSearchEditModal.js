"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Edit2, User } from "lucide-react";

export default function AdminSearchEditModal({ isOpen, onClose, users, onEditUser, darkMode }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredUsers = searchQuery.trim().length > 0 
        ? users.filter(u => 
            !u.isMainAdmin && (
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.enrollmentNumber && u.enrollmentNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (u.employeeId && u.employeeId.toLowerCase().includes(searchQuery.toLowerCase()))
        ))
        : [];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 shadow-2xl"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative p-[2px] bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={`relative ${darkMode ? "bg-black" : "bg-white"} rounded-[calc(2.5rem-2px)] p-6 sm:p-10 h-full w-full max-h-[80vh] flex flex-col`}>
                        <div className="flex items-center justify-between mb-8 flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/20">
                                    <Search className="w-7 h-7 text-purple-500" />
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"} leading-none`}>Global Member Search</h3>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 ${darkMode ? "text-purple-400" : "text-purple-600"}`}>
                                        Find and Edit any User
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className={`p-3 rounded-full hover:bg-gray-100/10 transition-all ${darkMode ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-900"}`}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="relative mb-6 flex-shrink-0">
                            <div className={`p-[1.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl`}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`w-full pl-12 pr-4 py-4 rounded-[calc(1rem-1.5px)] outline-none text-sm font-bold ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}
                                        autoFocus
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(u => (
                                    <div 
                                        key={u._id}
                                        onClick={() => onEditUser(u)}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${darkMode ? "bg-white/5 border-white/5 hover:border-purple-500/50 hover:bg-white/10" : "bg-gray-50 border-gray-100 hover:border-purple-500/50 hover:bg-purple-50/50"}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[1px]">
                                                {u.profilePicture ? (
                                                    <img src={u.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <div className={`w-full h-full rounded-full ${darkMode ? "bg-slate-800" : "bg-white"} flex items-center justify-center font-bold text-sm`}>
                                                        {u.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{u.name}</p>
                                                <p className={`text-[10px] font-bold ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{u.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
                                                {u.role}
                                            </span>
                                            <div className={`p-2 rounded-xl transition-all ${darkMode ? "bg-white/5 text-white/20 group-hover:text-purple-400 group-hover:bg-purple-500/20" : "bg-white text-gray-300 group-hover:text-purple-600 group-hover:bg-purple-100"}`}>
                                                <Edit2 className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-40">
                                    <User className="w-12 h-12 mb-4" />
                                    <p className="text-sm font-black uppercase tracking-[0.2em]">
                                        {searchQuery.trim() ? "No members found" : "Enter name or email to start"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
