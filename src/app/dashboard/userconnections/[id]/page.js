"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Link from "next/link";
import Image from "next/image";
import { getUserConnections, sendConnectionRequest } from "@/api/connect";
import { useParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { GooeyGradientBackground } from "../../../components/GooeyGradientBackground";

const UserConnectionsPage = () => {
    const { id } = useParams();
    const { darkMode } = useTheme();
    const [connections, setConnections] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requested, setRequested] = useState({});

    // ⚡ OPTIMISTIC HYDRATION
    useEffect(() => {
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
            setCurrentUser(JSON.parse(cachedUser));
        }
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem("token");
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            try {
                // ⚡ PARALLEL FETCH: Load user info and connections simultaneously
                const [meRes, connectionsData] = await Promise.all([
                    fetch(`${BASE_URL}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } }),
                    getUserConnections(id)
                ]);
                
                const meData = await meRes.json();
                if (meRes.ok) {
                    setCurrentUser(meData);
                    localStorage.setItem("user", JSON.stringify(meData)); // Refresh cache
                }
                setConnections(connectionsData || []);
            } catch (err) {
                console.error("Fetch initial data error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id]);

    const handleConnect = async (toUserId) => {
        if (currentUser && toUserId === currentUser._id) return;
        try {
            await sendConnectionRequest(toUserId);
            setRequested((prev) => ({ ...prev, [toUserId]: true }));
        } catch (err) {
            console.error("Connect error:", err);
        }
    };

    return (
        <GooeyGradientBackground className="min-h-screen text-white" darkMode={darkMode}>
            <Sidebar />
            <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
                <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl overflow-hidden">
                    <div className={`px-8 py-6 rounded-[calc(1.5rem-1px)] ${darkMode ? 'bg-black text-white' : 'bg-[#FAFAFA] text-slate-900'} flex flex-col md:flex-row items-center justify-between gap-6`}>
                        <div className="flex items-center gap-4">
                            <button onClick={() => window.history.back()} className={`p-2.5 rounded-xl transition-all border ${darkMode ? "bg-[#FAFAFA]/5 border-white/10 hover:bg-[#FAFAFA]/10 text-white" : "bg-gray-100 border-gray-200 hover:bg-gray-200 text-slate-900 shadow-gray-200/50"}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <div>
                                <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Connections</h1>
                                <p className={`text-sm font-medium ${darkMode ? 'text-blue-100/60' : 'text-slate-500'}`}>Networking Circle</p>
                            </div>
                        </div>
                        <div className={`px-5 py-2 border rounded-2xl text-[10px] font-black uppercase tracking-widest ${darkMode ? 'bg-[#FAFAFA]/5 border-white/10 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                            {connections.length} Members
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-white/20 border-t-blue-400 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-white/80 font-black uppercase tracking-[0.2em] text-[11px] animate-pulse">Syncing Circle</p>
                    </div>
                ) : connections.length === 0 ? (
                    <div className={`text-center py-24 rounded-[3.5rem] border border-dashed backdrop-blur-md transition-all ${darkMode ? 'bg-slate-950/40 border-white/10' : 'bg-[#FAFAFA]/40 border-gray-200'}`}>
                        <p className={`font-black uppercase tracking-widest text-[11px] ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>No connections found for this user.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-20">
                        {connections.map((user) => (
                            <div key={user._id} className="relative p-[1px] bg-gradient-to-br from-blue-400/50 to-purple-400/50 rounded-[3rem] group hover:from-blue-400 hover:to-purple-400 transition-all duration-500 shadow-xl hover:shadow-2xl">
                                <div className={`p-6 rounded-[3rem] border flex items-center justify-between gap-6 transition-all relative overflow-hidden h-full ${darkMode ? 'bg-[#121213] border-white/5' : 'bg-[#FAFAFA] border-gray-100'}`}>
                                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-colors ${darkMode ? 'bg-blue-500/5 group-hover:bg-blue-500/10' : 'bg-blue-50/5 group-hover:bg-blue-100/50'}`}></div>
                                    <div className="flex items-center gap-5 min-w-0 relative z-10 flex-1">
                                        <div className="relative p-[2px] bg-gradient-to-br from-blue-400 to-purple-400 rounded-full shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                            <Image
                                                src={user.profilePicture || "/default-profile.jpg"}
                                                width={90}
                                                height={90}
                                                className={`w-16 h-16 rounded-full object-cover border-2 ${darkMode ? 'border-slate-800' : 'border-white'}`}
                                                alt={user.name || "User"}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <Link href={`/profile/${user.publicId || user._id}`}>
                                                <h3 className={`font-black tracking-tight truncate transition-colors text-lg ${darkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>{user.name}</h3>
                                            </Link>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{user.course} • {user.year}</p>
                                            <div className={`mt-2 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border w-fit ${darkMode ? 'text-blue-400 border-blue-400/20 bg-blue-400/5' : 'text-blue-600 border-blue-100 bg-blue-50'}`}>
                                                {user.workProfile?.industry || "Student"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10 shrink-0">
                                        {currentUser && user._id === currentUser._id ? (
                                            <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${darkMode ? "bg-blue-600/20 text-blue-300 border-blue-500/30" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
                                                You
                                            </span>
                                        ) : user.connectionStatus === "connected" ? (
                                            <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${darkMode ? "bg-green-600/20 text-green-300 border-green-500/30" : "bg-green-50 text-green-600 border-green-200"}`}>
                                                Friends
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleConnect(user._id)}
                                                disabled={requested[user._id]}
                                                className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${requested[user._id]
                                                    ? "bg-[#FAFAFA]/5 text-white/30 cursor-not-allowed border border-white/5"
                                                    : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20 shadow-lg"
                                                    }`}
                                            >
                                                {requested[user._id] ? "Pending" : "Connect"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </GooeyGradientBackground>
    );
};

export default UserConnectionsPage;
