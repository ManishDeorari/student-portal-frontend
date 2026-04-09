"use client";
import React, { useEffect, useState, Suspense } from "react";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import Link from "next/link";
import Image from "next/image";
import { getMyConnections, getUserConnections, sendConnectionRequest } from "@/api/connect";
import { useTheme } from "@/context/ThemeContext";
import { useSearchParams } from "next/navigation";

const MyConnectionsContent = () => {
    const { darkMode } = useTheme();
    const searchParams = useSearchParams();
    const userIdInParam = searchParams.get("id");

    const [connections, setConnections] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [ownerName, setOwnerName] = useState("My");
    const [requested, setRequested] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

                // Fetch current user info for status comparison
                const meRes = await fetch(`${BASE_URL}/api/user/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const meData = await meRes.json();
                setCurrentUser(meData);

                let data;
                if (userIdInParam) {
                    const res = await fetch(`${BASE_URL}/api/connect/user/${userIdInParam}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    data = await res.json();
                    
                    // Also try to get the owner name if possible (or title logic)
                    if (userIdInParam !== meData?._id) {
                        setOwnerName("Alumni's"); // Generic fallback or fetch logic
                    }
                } else {
                    data = await getMyConnections();
                    setOwnerName("My");
                }
                setConnections(data || []);
            } catch (err) {
                console.error("Fetch connections error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userIdInParam]);

    const handleConnect = async (toUserId) => {
        try {
            await sendConnectionRequest(toUserId);
            setRequested(prev => ({ ...prev, [toUserId]: true }));
        } catch (err) {
            console.error("Connect error:", err);
        }
    };

    const isConnected = (targetId) => {
        return currentUser?.connections?.includes(targetId) || userIdInParam === null;
    };

    const filteredConnections = connections.filter(conn =>
        conn.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        const userObj = currentUser || JSON.parse(localStorage.getItem("user"));
        setIsAdmin(userObj?.isAdmin || userObj?.role === "admin");
    }, [currentUser]);

    const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white relative">
            <SidebarComponent />
            <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-10 space-y-4 sm:space-y-10 pb-24 md:pb-8">
                <div className="relative p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl overflow-hidden">
                    <div className={`px-4 sm:px-8 py-4 sm:py-8 rounded-[calc(1.5rem-2.5px)] ${darkMode ? 'bg-black text-white' : 'bg-white text-slate-900'} flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8`}>
                        <div className="flex items-center gap-3 sm:gap-6">
                            <Link href="/dashboard/network" className={`p-3 rounded-2xl transition-all border ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:scale-105' : 'bg-slate-50 border-gray-200 hover:bg-gray-100 hover:scale-105 text-slate-900 shadow-sm'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </Link>
                            <div>
                                <h1 className={`text-2xl sm:text-4xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>{ownerName} Network</h1>
                                <p className={`text-xs sm:text-sm font-black uppercase tracking-widest mt-0.5 sm:mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{connections.length} Total Connections</p>
                            </div>
                        </div>
                        <div className="relative w-full md:w-96 p-[1.5px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl focus-within:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
                            <input
                                type="text"
                                placeholder="Filter connections..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-2xl outline-none transition-all font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] ${darkMode ? 'bg-black text-white placeholder-white/30' : 'bg-white text-slate-900 placeholder-gray-400'}`}
                            />
                            <svg className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-opacity ${darkMode ? 'text-white/40' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <p className="text-white font-black uppercase tracking-widest text-[10px]">Syncing your network...</p>
                    </div>
                ) : filteredConnections.length === 0 ? (
                    <div className="relative p-[2.5px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-[3rem]">
                        <div className={`text-center py-24 rounded-[calc(3rem-2.5px)] border border-white/5 backdrop-blur-md ${darkMode ? 'bg-black/50' : 'bg-white shadow-xl'}`}>
                            <div className={`p-6 w-fit mx-auto rounded-full mb-8 ${darkMode ? 'bg-white/5 shadow-inner' : 'bg-blue-50'}`}>
                                <svg className={`w-12 h-12 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <p className={`${darkMode ? 'text-white' : 'text-slate-900'} font-black text-lg mb-8 uppercase tracking-widest`}>
                                {searchQuery ? "No matching connections" : "The network is quiet"}
                            </p>
                            <Link href="/dashboard/network" className="relative p-[1.5px] bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl inline-block group hover:scale-105 transition-transform active:scale-95">
                                <span className={`block px-8 py-4 ${darkMode ? 'bg-black text-white' : 'bg-white text-blue-700'} rounded-[calc(1rem-1.5px)] font-black uppercase tracking-[0.2em] text-xs`}>
                                    Expand Your Network
                                </span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 pb-20">
                        {filteredConnections.map((user) => {
                            const isUserConnected = isConnected(user._id);
                            const isSent = requested[user._id];
                            
                            return (
                                <div key={user._id} className="relative p-[1.5px] bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-pink-500/40 rounded-3xl group hover:from-blue-500 hover:to-pink-500 transition-all duration-500 shadow-xl overflow-hidden">
                                    <div className={`p-3 sm:p-6 rounded-[calc(1.5rem-1.5px)] flex flex-col items-center text-center transition-all relative overflow-hidden h-full ${darkMode ? 'bg-[#0f172a] hover:bg-black' : 'bg-white hover:bg-slate-50'}`}>
                                        
                                        {/* Avatar Section */}
                                        <Link 
                                            href={`/profile/${user.publicId || user._id}`}
                                            className="relative p-[2px] bg-gradient-to-br from-blue-400/80 to-purple-400/80 rounded-full shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-xl mt-2 mb-4 block"
                                        >
                                            <Image
                                                src={user.profilePicture || "/default-profile.jpg"}
                                                width={80}
                                                height={80}
                                                className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full object-cover border-2 transition-all ${darkMode ? 'border-slate-800' : 'border-white'}`}
                                                alt={user.name || "User"}
                                            />
                                        </Link>
 
                                        {/* Name and ID Section */}
                                        <div className="w-full min-w-0 space-y-1">
                                            <Link href={`/profile/${user.publicId || user._id}`}>
                                                <h3 className={`font-black tracking-tight truncate transition-colors text-xs sm:text-base uppercase ${darkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>
                                                    {user.name}
                                                </h3>
                                            </Link>
                                            
                                            {/* Enrollment / Employee ID */}
                                            {user.role !== "admin" && (
                                                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-500">
                                                    {user.enrollmentNumber || user.employeeId || (user.role === "faculty" ? "Faculty" : "Alumni")}
                                                </p>
                                            )}
                                            
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {user.course || "Alumni"} {user.year}
                                            </p>
                                        </div>
 
                                        {/* Action Section */}
                                        <div className="mt-3 sm:mt-6 w-full">
                                            {isUserConnected ? (
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 border border-emerald-500/20 py-3 rounded-2xl bg-emerald-500/5 w-full shadow-inner">
                                                    Connected
                                                </div>
                                            ) : isSent ? (
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 border border-amber-500/20 py-3 rounded-2xl bg-amber-500/5 w-full">
                                                    Pending
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => handleConnect(user._id)}
                                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg active:scale-95"
                                                >
                                                    Connect
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

const MyConnectionsPage = () => (
    <Suspense fallback={
        <div className="min-h-screen bg-[#121213] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    }>
        <MyConnectionsContent />
    </Suspense>
);

export default MyConnectionsPage;
