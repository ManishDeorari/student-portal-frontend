"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import AdminSidebar from "@/app/components/AdminSidebar";
import { ArrowLeft, Calendar, Trophy, Eye } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import AuthGuard from "@/app/components/AuthGuard";
import { GooeyGradientBackground } from "@/app/components/GooeyGradientBackground";
import PostModal from "@/app/components/Post/Visual/PostModal";

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

            <div className="max-w-4xl mx-auto px-4 pt-24 pb-20">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className={`p-3 rounded-xl border transition-all ${darkMode ? 'bg-[#FAFAFA]/10 border-white/20 hover:bg-[#FAFAFA]/20' : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'}`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Event Participation</h1>
                </div>

                {/* Tabs */}
                <div className={`flex gap-4 mb-6 border-b pb-2 ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <button
                        onClick={() => setActiveTab("participated")}
                        className={`text-lg font-bold transition-colors pb-2 -mb-[10px] ${activeTab === "participated"
                            ? (darkMode ? "text-blue-400 border-b-2 border-blue-400" : "text-blue-600 border-b-2 border-blue-600")
                            : (darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700")
                            }`}
                    >
                        Participated ({participatedEvents.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("won")}
                        className={`text-lg font-bold transition-colors pb-2 -mb-[10px] flex items-center gap-2 ${activeTab === "won"
                            ? (darkMode ? "text-yellow-400 border-b-2 border-yellow-400" : "text-yellow-600 border-b-2 border-yellow-600")
                            : (darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700")
                            }`}
                    >
                        Won Events ({wonEvents.length})
                    </button>
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
                            <div className="grid gap-4">
                                {participatedEvents.map((ev, idx) => (
                                    <div key={idx} className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${darkMode ? "bg-[#1A1A1B] border-white/10" : "bg-white border-gray-200"}`}>
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className={`text-xl font-black mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{ev.title || "Event"}</h3>
                                                <div className={`flex flex-wrap items-center gap-4 text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : "Unknown Date"}</span>
                                                    {ev.startTime && <span>• {ev.startTime}</span>}
                                                    {ev.eventType && <span className="uppercase tracking-wider text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-md">{ev.eventType.replace("_", " ")}</span>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleViewEvent(ev)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-bold ${darkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
                                            >
                                                <Eye className="w-4 h-4" /> View
                                            </button>
                                        </div>
                                    </div>
                                ))}
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
                            <div className="grid gap-4">
                                {wonEvents.map((post, idx) => {
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
                                        <div key={idx} className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${darkMode ? "bg-[#1A1A1B] border-white/10" : "bg-white border-gray-200"}`}>
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h3 className={`text-xl font-black mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{eventName}</h3>
                                                    <div className={`flex flex-wrap items-center gap-4 text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-1.5 text-yellow-500"><Trophy className="w-4 h-4" /> Winner</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleViewAnnouncement(post)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-bold ${darkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
                                                >
                                                    <Eye className="w-4 h-4" /> View Post
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>
            </div>

            {showPostModal && selectedPost && (
                <PostModal 
                    post={selectedPost} 
                    onClose={() => setShowPostModal(false)} 
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
