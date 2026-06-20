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
import socket from "@/utils/socket";

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

    // ⚡ Real-time events list socket updater
    useEffect(() => {
        if (!socket) return;

        const updateEventInState = (updated) => {
            setEventsData((prev) => {
                const participated = (prev.participatedEvents || []).map((item) => {
                    if (item._id === updated._id) {
                        return { ...item, ...updated };
                    }
                    return item;
                });

                const won = (prev.wonEvents || []).map((item) => {
                    if (item._id === updated._id) {
                        return { ...item, ...updated };
                    }
                    if (item.announcementDetails?.originalEventId?._id === updated._id) {
                        return {
                            ...item,
                            announcementDetails: {
                                ...item.announcementDetails,
                                originalEventId: {
                                    ...item.announcementDetails.originalEventId,
                                    ...updated
                                }
                            }
                        };
                    }
                    return item;
                });

                return {
                    participatedEvents: participated,
                    wonEvents: won
                };
            });
        };

        const removeEventFromState = ({ postId }) => {
            setEventsData((prev) => {
                const participated = (prev.participatedEvents || []).filter((item) => item._id !== postId);
                const won = (prev.wonEvents || []).filter((item) => item._id !== postId).map((item) => {
                    if (item.announcementDetails?.originalEventId?._id === postId) {
                        return {
                            ...item,
                            announcementDetails: {
                                ...item.announcementDetails,
                                originalEventId: null
                            }
                        };
                    }
                    return item;
                });
                return {
                    participatedEvents: participated,
                    wonEvents: won
                };
            });
        };

        socket.on("postUpdated", updateEventInState);
        socket.on("postReacted", updateEventInState);
        socket.on("updatePost", updateEventInState);
        socket.on("postDeleted", removeEventFromState);

        return () => {
            socket.off("postUpdated", updateEventInState);
            socket.off("postReacted", updateEventInState);
            socket.off("updatePost", updateEventInState);
            socket.off("postDeleted", removeEventFromState);
        };
    }, []);

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

            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                    <button
                        onClick={() => router.back()}
                        className={`p-3 rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center shrink-0 ${darkMode ? "bg-black hover:bg-gray-900 text-white shadow-white/5 border border-gray-800" : "bg-white hover:bg-gray-50 text-black shadow-black/5 border border-gray-200"}`}
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-xl overflow-hidden flex-1 w-full">
                    <div className={`px-8 py-6 rounded-[calc(1.5rem-1px)] ${darkMode ? 'bg-slate-950' : 'bg-[#FAFAFA]'}`}>
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                            <h1 className={`text-3xl font-black tracking-tight uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>Event Participation</h1>
                        </div>
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
                                                        <h3 className={`text-xl font-black leading-tight mb-1 truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                                                            Event Name: <span className="font-medium">{ev.title || "Event"}</span>
                                                        </h3>
                                                        <div className={`text-xs font-bold mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                            Type: <span className="font-black text-blue-500">{ev.participationType || "Online Registered"}</span>
                                                        </div>
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
                                            const targetPublicId = publicId === "me" ? currentUser?.publicId : publicId;
                                            const targetUserId = publicId === "me" ? currentUser?._id : (publicId?.length === 24 ? publicId : null);

                                            const winnerInfo = post.announcementDetails?.winners?.find(w => {
                                                const wUserIdObj = w.userId;
                                                if (wUserIdObj) {
                                                    const wId = wUserIdObj._id ? wUserIdObj._id.toString() : wUserIdObj.toString();
                                                    const wPubId = wUserIdObj.publicId;
                                                    if (targetUserId && wId === targetUserId.toString()) return true;
                                                    if (targetPublicId && wPubId === targetPublicId) return true;
                                                }
                                                if (w.groupMembers && w.groupMembers.length > 0) {
                                                    return w.groupMembers.some(m => {
                                                        const mId = m?._id ? m._id.toString() : m?.toString();
                                                        const mPubId = m?.publicId;
                                                        if (targetUserId && mId === targetUserId.toString()) return true;
                                                        if (targetPublicId && mPubId === targetPublicId) return true;
                                                        return false;
                                                    });
                                                }
                                                return false;
                                            });
                                            
                                            return (
                                                <div key={idx} className="relative p-[1.5px] bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-2xl transition-transform hover:scale-[1.01]">
                                                    <div className={`p-5 rounded-[calc(1rem-1.5px)] h-full flex justify-between items-center gap-4 ${darkMode ? "bg-[#1A1A1B]" : "bg-white"}`}>
                                                        <div className="min-w-0">
                                                            <h3 className={`text-xl font-black leading-tight mb-1 truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                                                                Event Name: <span className="font-medium">{eventName}</span>
                                                            </h3>
                                                            <div className={`text-xs font-bold mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                                Rank: <span className="font-black text-yellow-500">{winnerInfo?.rank || "N/A"}</span>
                                                            </div>
                                                            <div className={`flex flex-wrap items-center gap-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                                <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md"><Calendar className="w-4 h-4" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                                                                {winnerInfo?.points > 0 && <span className="text-green-600 dark:text-green-400 bg-green-500/10 px-2.5 py-1 rounded-md">+{winnerInfo.points} PTS</span>}
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
