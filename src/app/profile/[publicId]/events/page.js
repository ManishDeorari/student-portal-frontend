"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import AdminSidebar from "@/app/components/AdminSidebar";
import { ArrowLeft, Calendar, Trophy, Eye } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import AuthGuard from "@/app/components/AuthGuard";
import { GooeyGradientBackground } from "@/app/components/GooeyGradientBackground";
import SmartPostModal from "@/app/components/Post/SmartPostModal";

function EventsContent() {
    const params = useParams();
    const router = useRouter();
    const { darkMode } = useTheme();

    const [eventsData, setEventsData] = useState({ participatedEvents: [], wonEvents: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("participated");
    const [showPostModal, setShowPostModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const [displayLimit, setDisplayLimit] = useState(20);

    const handleShowMore = () => setDisplayLimit(prev => prev + 20);
    const handleShowLess = () => setDisplayLimit(20);

    const publicId = params?.publicId;

    const fetchEvents = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token || !publicId) return;

            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${API_URL}/api/user/${publicId}/events`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to fetch events");

            const data = await res.json();
            setEventsData(data);
            setLoading(false);
        } catch (error) {
            console.error("❌ Error fetching user events:", error.message);
            setLoading(false);
        }
    }, [publicId]);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const userData = JSON.parse(userStr);
            setCurrentUser(userData);
            setIsAdmin(userData?.isAdmin || userData?.role === "admin");
        }
        fetchEvents();
    }, [fetchEvents]);

    const handleViewEvent = (event) => {
        const formattedEvent = {
            ...event,
            type: "Event",
            content: event.description,
            user: typeof event.createdBy === "object" ? event.createdBy : { _id: event.createdBy, name: "Admin" }
        };
        setSelectedPost(formattedEvent);
        setShowPostModal(true);
    };

    const handleViewAnnouncement = (announcement) => {
        setSelectedPost(announcement);
        setShowPostModal(true);
    };

    if (loading) return (
        <GooeyGradientBackground className="min-h-screen text-white flex items-center justify-center p-4" darkMode={true}>
            <div className="flex flex-col items-center gap-6 animate-pulse">
                <div className="w-20 h-20 border-4 border-white/10 border-t-white rounded-full animate-spin shadow-2xl shadow-white/10"></div>
                <div className="text-center space-y-2">
                    <h2 className="font-black tracking-[0.3em] uppercase text-sm">Loading Events...</h2>
                </div>
            </div>
        </GooeyGradientBackground>
    );

    const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;
    const { participatedEvents, wonEvents } = eventsData;

    return (
        <GooeyGradientBackground className="min-h-screen text-white" darkMode={darkMode}>
            <SidebarComponent />

            {/* 🔷 Left-most Back Button */}
            <button
                onClick={() => router.back()}
                className={`fixed top-24 left-8 z-50 flex items-center justify-center p-3 border rounded-xl transition-all backdrop-blur-md group shadow-xl ${darkMode ? 'bg-[#FAFAFA]/10 border-white/20 text-white hover:bg-[#FAFAFA]/20' : 'bg-white/50 border-gray-300 text-gray-800 hover:bg-white/80'}`}
                title="Go Back"
            >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-xl mb-10 overflow-hidden">
                    <div className={`px-8 py-6 rounded-[calc(1.5rem-1px)] ${darkMode ? 'bg-slate-950' : 'bg-[#FAFAFA]'}`}>
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                            <h1 className={`text-3xl font-black tracking-tight uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>Event Participation</h1>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <div className={`relative p-[2px] rounded-xl transition-all ${activeTab === "participated" ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-xl shadow-blue-500/20' : 'bg-transparent border-2 border-gray-400 dark:border-gray-500'}`}>
                        <button
                            onClick={() => setActiveTab("participated")}
                            className={`px-5 py-2.5 rounded-[calc(0.75rem-2px)] text-base font-black transition-all h-full w-full ${activeTab === "participated"
                                ? (darkMode ? "bg-slate-950 text-white" : "bg-white text-blue-600")
                                : (darkMode ? "bg-transparent text-gray-200 hover:text-white" : "bg-transparent text-gray-800 hover:text-black")
                                }`}
                        >
                            Participated ({participatedEvents.length})
                        </button>
                    </div>
                    <div className={`relative p-[2px] rounded-xl transition-all ${activeTab === "won" ? 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-xl shadow-amber-500/20' : 'bg-transparent border-2 border-gray-400 dark:border-gray-500'}`}>
                        <button
                            onClick={() => setActiveTab("won")}
                            className={`px-5 py-2.5 rounded-[calc(0.75rem-2px)] text-base font-black transition-all flex items-center justify-center gap-2 h-full w-full ${activeTab === "won"
                                ? (darkMode ? "bg-slate-950 text-white" : "bg-white text-amber-600")
                                : (darkMode ? "bg-transparent text-gray-200 hover:text-white" : "bg-transparent text-gray-800 hover:text-black")
                                }`}
                        >
                            Won Events ({wonEvents.length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {activeTab === "participated" && (
                        participatedEvents.length === 0 ? (
                            <div className={`py-12 text-center rounded-2xl border-2 border-dashed ${darkMode ? 'bg-slate-800/30 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-bold mb-2">No Participated Events</h3>
                                <p className="text-sm opacity-80">This user hasn't participated in any events yet.</p>
                            </div>
                        ) : (
                            <div className="relative p-[2px] bg-gradient-to-tr from-blue-400/60 to-purple-500/60 rounded-[1.5rem]">
                                <div className={`p-5 rounded-[calc(1.5rem-2px)] ${darkMode ? "bg-[#121212]" : "bg-gray-50"}`}>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {participatedEvents.slice(0, displayLimit).map((ev, idx) => (
                                            <div key={idx} className="relative p-[1.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl transition-transform hover:scale-[1.01]">
                                                <div className={`p-5 rounded-[calc(1rem-1.5px)] h-full flex justify-between items-center gap-4 ${darkMode ? "bg-[#1A1A1B]" : "bg-white"}`}>
                                                    <div className="min-w-0">
                                                        <h3 className={`text-xl font-black leading-tight mb-1 truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{ev.title || "Event"}</h3>
                                                        <div className={`flex flex-wrap items-center gap-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                            <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md"><Calendar className="w-4 h-4" /> {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : "Unknown Date"}</span>
                                                            {ev.startTime && <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-md">{ev.startTime}</span>}
                                                            {ev.eventType && <span className="uppercase tracking-wider text-xs bg-indigo-500/10 text-indigo-500 px-2.5 py-1.5 rounded-md">{ev.eventType.replace("_", " ")}</span>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleViewEvent(ev)}
                                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-0 transition-all font-black shrink-0 shadow-md hover:shadow-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 active:scale-[0.98]`}
                                                    >
                                                        <Eye className="w-5 h-5" /> View
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex flex-col items-center justify-center gap-4 mt-8">
                                        {participatedEvents.length > displayLimit ? (
                                            <button
                                                onClick={handleShowMore}
                                                className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition shadow-md active:scale-95 ${darkMode ? 'bg-[#FAFAFA]/10 hover:bg-[#FAFAFA]/20 border border-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800'}`}
                                            >
                                                Show More
                                            </button>
                                        ) : participatedEvents.length > 20 ? (
                                            <>
                                                <button
                                                    onClick={handleShowLess}
                                                    className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition shadow-md active:scale-95 ${darkMode ? 'bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-400' : 'bg-red-50 hover:bg-red-100 border border-red-200 text-red-600'}`}
                                                >
                                                    Show Less
                                                </button>
                                                <p className="text-center font-bold uppercase tracking-widest text-[10px] italic opacity-50">No more events to show</p>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {activeTab === "won" && (
                        wonEvents.length === 0 ? (
                            <div className={`py-12 text-center rounded-2xl border-2 border-dashed ${darkMode ? 'bg-slate-800/30 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-bold mb-2">No Won Events</h3>
                                <p className="text-sm opacity-80">This user hasn't won any events yet.</p>
                            </div>
                        ) : (
                            <div className="relative p-[2px] bg-gradient-to-tr from-yellow-400/60 to-amber-500/60 rounded-[1.5rem]">
                                <div className={`p-5 rounded-[calc(1.5rem-2px)] ${darkMode ? "bg-[#121212]" : "bg-gray-50"}`}>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {wonEvents.slice(0, displayLimit).map((post, idx) => {
                                            const eventName = post.announcementDetails?.eventName || "Event";
                                            // Target user might be the logged in user or a different public profile
                                            // But we don't have the targetUser's ID strictly here except publicId string.
                                            // Let's find the winner matching any user if we don't know the exact ID, or just map the winner that has highest points?
                                            // Wait, the API ensures this post is in the list because the user won. 
                                            // So we just find the winner that matches the publicId or the current user if publicId is "me"
                                            
                                            // A safer bet is to find a winner whose uniqueId or userId matches.
                                            // Since we don't know the precise _id of the profile owner here, we can just show all winners, or highlight the target.
                                            // Actually, let's just show the event details and "View Announcement" to keep it clean.
                                            
                                            return (
                                                <div key={idx} className="relative p-[1.5px] bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-2xl transition-transform hover:scale-[1.01]">
                                                    <div className={`p-5 rounded-[calc(1rem-1.5px)] h-full flex justify-between items-center gap-4 ${darkMode ? "bg-[#1A1A1B]" : "bg-white"}`}>
                                                        <div className="min-w-0">
                                                            <h3 className={`text-xl font-black leading-tight mb-1 truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{eventName}</h3>
                                                            <div className={`flex flex-wrap items-center gap-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                                <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md"><Calendar className="w-4 h-4" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                                                                <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 px-2.5 py-1 rounded-md uppercase tracking-widest font-black text-[10px]"><Trophy className="w-4 h-4" /> Winner</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleViewAnnouncement(post)}
                                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-0 transition-all font-black shrink-0 shadow-md hover:shadow-lg text-white bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 active:scale-[0.98]`}
                                                        >
                                                            <Eye className="w-5 h-5" /> View
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex flex-col items-center justify-center gap-4 mt-8">
                                        {wonEvents.length > displayLimit ? (
                                            <button
                                                onClick={handleShowMore}
                                                className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition shadow-md active:scale-95 ${darkMode ? 'bg-[#FAFAFA]/10 hover:bg-[#FAFAFA]/20 border border-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800'}`}
                                            >
                                                Show More
                                            </button>
                                        ) : wonEvents.length > 20 ? (
                                            <>
                                                <button
                                                    onClick={handleShowLess}
                                                    className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition shadow-md active:scale-95 ${darkMode ? 'bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-400' : 'bg-red-50 hover:bg-red-100 border border-red-200 text-red-600'}`}
                                                >
                                                    Show Less
                                                </button>
                                                <p className="text-center font-bold uppercase tracking-widest text-[10px] italic opacity-50">No more events to show</p>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {showPostModal && selectedPost && (
                <SmartPostModal 
                    showModal={showPostModal}
                    setShowModal={setShowPostModal}
                    post={selectedPost} 
                    darkMode={darkMode}
                    currentUser={currentUser}
                />
            )}
        </GooeyGradientBackground>
    );
}

export default function EventsPage() {
    return (
        <AuthGuard>
            <Suspense fallback={
                <GooeyGradientBackground className="min-h-screen text-white flex items-center justify-center p-4" darkMode={true}>
                    <div className="flex flex-col items-center gap-6 animate-pulse">
                        <div className="w-20 h-20 border-4 border-white/10 border-t-white rounded-full animate-spin shadow-2xl shadow-white/10"></div>
                        <div className="text-center space-y-2">
                            <h2 className="font-black tracking-[0.3em] uppercase text-sm">Authenticating Route...</h2>
                        </div>
                    </div>
                </GooeyGradientBackground>
            }>
                <EventsContent />
            </Suspense>
        </AuthGuard>
    );
}
