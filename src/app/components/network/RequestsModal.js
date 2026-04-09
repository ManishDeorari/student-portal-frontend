"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
    getPendingRequests,
    getSentRequests,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest,
} from "@/api/connect";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

const RequestsModal = ({ isOpen, onClose, onActionComplete }) => {
    const { darkMode } = useTheme();
    const [activeTab, setActiveTab] = useState("received"); // 'received' or 'sent'
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data =
                activeTab === "received"
                    ? await getPendingRequests()
                    : await getSentRequests();
            setRequests(data || []);
        } catch (err) {
            console.error("Fetch requests error:", err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        if (isOpen) {
            fetchRequests();
        }
    }, [isOpen, activeTab, fetchRequests]);

    const handleAction = async (userId, action) => {
        try {
            if (action === "accept") await acceptConnectionRequest(userId);
            else if (action === "reject") await rejectConnectionRequest(userId);
            else if (action === "cancel") await cancelConnectionRequest(userId);

            // Refresh list
            fetchRequests();
            if (onActionComplete) onActionComplete();
        } catch (err) {
            alert(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`relative p-[1px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[85vh]`}>
                <div className={`flex flex-col h-full rounded-[calc(1.5rem-1px)] ${darkMode ? 'bg-black text-white' : 'bg-[#FAFAFA] text-slate-900'} overflow-hidden`}>
                    <div className={`p-6 border-b flex justify-between items-center ${darkMode ? 'border-white/10 bg-[#FAFAFA]/5' : 'border-gray-100 bg-gray-50'}`}>
                        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Manage Requests</h2>
                        <button onClick={onClose} className={`transition-colors text-2xl leading-none ${darkMode ? 'text-white/50 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                            &times;
                        </button>
                    </div>

                    <div className={`p-1 mx-6 mt-6 rounded-2xl border ${darkMode ? 'bg-black/40 border-white/10' : 'bg-gray-100 border-gray-200'} p-[2px] bg-gradient-to-r from-blue-500/20 to-purple-500/20`}>
                        <div className="flex p-0.5 w-full h-full">
                            <button
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === "received"
                                    ? (darkMode ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl" : "bg-white text-blue-600 shadow-md")
                                    : (darkMode ? "text-white opacity-40 hover:opacity-100 hover:bg-white/5" : "text-slate-500 hover:text-slate-900")
                                    }`}
                                onClick={() => setActiveTab("received")}
                            >
                                Received
                            </button>
                            <button
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === "sent"
                                    ? (darkMode ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl" : "bg-white text-blue-600 shadow-md")
                                    : (darkMode ? "text-white opacity-40 hover:opacity-100 hover:bg-white/5" : "text-slate-500 hover:text-slate-900")
                                    }`}
                                onClick={() => setActiveTab("sent")}
                            >
                                Sent
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className={`w-10 h-10 border-4 border-blue-500 border-t-purple-600 rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]`}></div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-900'}`}>Syncing requests...</p>
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-20 flex flex-col items-center gap-5">
                                <div className={`p-6 rounded-full ${darkMode ? 'bg-white/5 shadow-inner' : 'bg-gray-100 shadow-sm'}`}>
                                    <svg className={`w-12 h-12 ${darkMode ? 'text-white opacity-10' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </div>
                                <p className={`text-xs font-bold italic ${darkMode ? 'text-white opacity-40' : 'text-slate-500'}`}>No {activeTab} requests found</p>
                            </div>
                        ) : (
                            requests.map((user) => (
                                <div key={user._id} className="relative p-[1.5px] bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-2xl group transition-all duration-500 hover:from-blue-400 hover:to-purple-400">
                                    <div className={`flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl transition-all relative overflow-hidden ${darkMode ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-900'}`}>
                                        <div className="flex items-center gap-4 min-w-0 z-10">
                                            <div className="relative p-[1.5px] bg-gradient-to-br from-blue-400 to-purple-400 rounded-full shadow-md shrink-0">
                                                <Image
                                                    src={user.profilePicture || "/default-profile.jpg"}
                                                    alt={user.name}
                                                    width={56}
                                                    height={56}
                                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover aspect-square border-2 ${darkMode ? 'border-slate-800' : 'border-white'}`}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <Link href={`/profile/${user.publicId || user._id}`} onClick={onClose}>
                                                    <h3 className={`font-black text-sm transition-colors truncate uppercase tracking-tight ${darkMode ? 'text-white hover:text-blue-400' : 'text-slate-900 hover:text-blue-600'}`}>{user.name}</h3>
                                                </Link>
                                                {/* Enrollment ID */}
                                                {user.role !== "admin" && (
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mt-0.5">
                                                        {user.enrollmentNumber || user.employeeId || (user.role === "faculty" ? "Faculty" : "Alumni")}
                                                    </p>
                                                )}
                                                <p className={`text-[9px] font-black uppercase tracking-widest truncate mt-1 ${darkMode ? 'text-white' : 'text-slate-600'}`}>
                                                    {user.course || (user.role === "faculty" ? "Faculty" : "Alumni")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 z-10 shrink-0">
                                            {activeTab === "received" ? (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(user._id, "accept")}
                                                        className="relative group/abtn p-[1px] bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg overflow-hidden transition-all active:scale-90"
                                                    >
                                                        <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-[calc(0.5rem-1px)]">
                                                            Accept
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(user._id, "reject")}
                                                        className="px-3 sm:px-5 py-2 sm:py-2.5 bg-red-500/10 border-2 border-red-500/30 text-red-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-500 hover:text-white transition-all active:scale-90"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleAction(user._id, "cancel")}
                                                    className="relative group/cbtn p-[1.5px] bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg overflow-hidden transition-all active:scale-90 shadow-lg shadow-orange-500/20"
                                                >
                                                    <div className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-[calc(0.5rem-1.5px)]">
                                                        Cancel
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestsModal;
