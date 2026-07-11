"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import AdminSidebar from "@/app/components/AdminSidebar";
import { ArrowLeft, Trophy, Eye } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import AuthGuard from "@/app/components/AuthGuard";
import { GooeyGradientBackground } from "@/app/components/GooeyGradientBackground";
import SmartPostModal from "@/app/components/Post/SmartPostModal";

function SpotlightsContent() {
    const params = useParams();
    const router = useRouter();
    const { darkMode } = useTheme();

    const [spotlights, setSpotlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const [displayLimit, setDisplayLimit] = useState(20);

    const handleShowMore = () => setDisplayLimit(prev => prev + 20);
    const handleShowLess = () => setDisplayLimit(20);

    const publicId = params?.publicId;

    const [profile, setProfile] = useState(null);

    const fetchSpotlights = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token || !publicId) return;

            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            
            const targetId = publicId === "me" ? "me" : publicId;
            
            // Fetch profile
            const profileRes = await fetch(`${API_URL}/api/user/${targetId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            let actualUserId = targetId;
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfile(profileData);
                actualUserId = profileData._id; // Need internal _id for achievements API
            }

            // Fetch spotlights
            if (actualUserId !== "me") {
                const spotlightsRes = await fetch(`${API_URL}/api/posts/achievements/${actualUserId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (spotlightsRes.ok) {
                    const data = await spotlightsRes.json();
                    setSpotlights(data);
                }
            }
            
            setLoading(false);
        } catch (error) {
            console.error("❌ Error fetching user spotlights:", error.message);
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
        fetchSpotlights();
    }, [fetchSpotlights]);

    const handleViewAnnouncement = (announcement) => {
        setSelectedPost(announcement);
        setShowPostModal(true);
    };

    if (loading) return (
        <GooeyGradientBackground className="min-h-screen text-white flex items-center justify-center p-4" darkMode={true}>
            <div className="flex flex-col items-center gap-6 animate-pulse">
                <div className="w-20 h-20 border-4 border-white/10 border-t-white rounded-full animate-spin shadow-2xl shadow-white/10"></div>
                <div className="text-center space-y-2">
                    <h2 className="font-black tracking-[0.3em] uppercase text-sm">Loading Spotlights...</h2>
                </div>
            </div>
        </GooeyGradientBackground>
    );

    const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;

    return (
        <GooeyGradientBackground className="min-h-screen text-white profile-mobile-scale" darkMode={darkMode}>
            <SidebarComponent />

            <div className="max-w-4xl mx-auto py-12 px-1 sm:px-4 lg:px-8">
                    <div className="relative p-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl shadow-2xl overflow-hidden mb-10 w-full">
                        <div className={`px-4 sm:px-8 py-4 sm:py-6 rounded-[calc(1.5rem-2.5px)] h-full flex flex-col justify-center ${darkMode ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                                <div className="flex items-center gap-3 sm:gap-6 w-full">
                                    <div className="relative p-[1.5px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl group transition-all duration-300 hover:shadow-lg shrink-0">
                                        <button
                                            onClick={() => router.back()}
                                            className={`relative flex items-center justify-center p-3 rounded-[calc(1rem-1.5px)] transition-all ${darkMode ? 'bg-[#0f172a] hover:bg-black text-white' : 'bg-white hover:bg-gray-50 text-slate-900'}`}
                                            aria-label="Go back"
                                        >
                                            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </button>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-4">
                                            <div className="h-8 sm:h-10 w-2 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] shrink-0"></div>
                                            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight uppercase truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>College Spotlights</h1>
                                        </div>
                                        
                                        {profile && (
                                            <div className="flex items-center gap-3 mt-3 pl-0 sm:pl-2">
                                                <div className="relative p-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full shadow-lg shrink-0">
                                                    <img src={profile.profilePicture || "/default-profile.jpg"} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-[2.5px] ${darkMode ? 'border-black' : 'border-white'}`} alt="Profile" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-sm sm:text-base font-black leading-tight truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{profile.name}</span>
                                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] truncate text-emerald-500 mt-0.5">{profile.enrollmentNumber || profile.universityRollNumber || profile.role}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                {/* Content */}
                <div className="space-y-4">
                    {spotlights.length === 0 ? (
                        <div className={`py-12 text-center rounded-2xl border-2 border-dashed ${darkMode ? 'bg-slate-800/30 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold mb-2">No Spotlights Yet</h3>
                            <p className="text-sm opacity-80">This user hasn&apos;t received any spotlights.</p>
                        </div>
                    ) : (
                        <div className="relative p-[2px] bg-gradient-to-tr from-emerald-400/60 to-teal-500/60 rounded-[1.5rem]">
                            <div className={`p-5 rounded-[calc(1.5rem-2px)] ${darkMode ? "bg-[#121212]" : "bg-gray-50"}`}>
                                <div className="grid gap-4 grid-cols-1">
                                    {spotlights.slice(0, displayLimit).map((post, idx) => {
                                        const eventName = post.announcementDetails?.eventName || "Event / Organization";
                                        const achievementCategory = post.announcementDetails?.achievementCategory || "Placement";
                                        const winnerInfo = post.announcementDetails?.winners?.find(w => {
                                            const wId = w.userId?._id ? w.userId._id.toString() : w.userId?.toString();
                                            const matchesUser = wId === profile?._id?.toString();
                                            const matchesGroup = w.groupMembers && w.groupMembers.some(m => {
                                                const mId = m?._id ? m._id.toString() : m?.toString();
                                                return mId === profile?._id?.toString();
                                            });
                                            return matchesUser || matchesGroup;
                                        });
                                        
                                        return (
                                            <div key={idx} className="relative p-[1.5px] bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl transition-transform hover:scale-[1.01]">
                                                <div className={`p-5 rounded-[calc(1rem-1.5px)] h-full flex justify-between items-center gap-4 ${darkMode ? "bg-[#1A1A1B]" : "bg-white"}`}>
                                                    <div className="min-w-0">
                                                        <h3 className={`text-xl font-black leading-tight mb-1 truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                                                            {achievementCategory}: <span className="font-medium">{eventName}</span>
                                                        </h3>
                                                        <div className={`text-xs font-bold mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                            Role/Title: <span className="font-black text-emerald-500">{winnerInfo?.roleTitle || winnerInfo?.rank || "N/A"}</span>
                                                        </div>
                                                        <div className={`flex flex-wrap items-center gap-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-md">{new Date(post.createdAt).toLocaleDateString()}</span>
                                                            {winnerInfo?.points > 0 && <span className="text-green-600 dark:text-green-400 bg-green-500/10 px-2.5 py-1 rounded-md">+{winnerInfo.points} PTS</span>}
                                                            <span className="flex items-center gap-1.5 bg-teal-500/10 text-teal-600 dark:text-teal-500 px-2.5 py-1 rounded-md uppercase tracking-widest font-black text-[10px]"><Trophy className="w-4 h-4" /> Achiever</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleViewAnnouncement(post)}
                                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-0 transition-all font-black shrink-0 shadow-md hover:shadow-lg text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-cyan-700 active:scale-[0.98]`}
                                                    >
                                                        <Eye className="w-5 h-5" /> View
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex flex-col items-center justify-center gap-4 mt-8">
                                    {spotlights.length > displayLimit ? (
                                        <button
                                            onClick={handleShowMore}
                                            className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition shadow-md active:scale-95 ${darkMode ? 'bg-[#FAFAFA]/10 hover:bg-[#FAFAFA]/20 border border-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800'}`}
                                        >
                                            Show More
                                        </button>
                                    ) : spotlights.length > 20 ? (
                                        <>
                                            <button
                                                onClick={handleShowLess}
                                                className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition shadow-md active:scale-95 ${darkMode ? 'bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-400' : 'bg-red-50 hover:bg-red-100 border border-red-200 text-red-600'}`}
                                            >
                                                Show Less
                                            </button>
                                            <p className="text-center font-bold uppercase tracking-widest text-[10px] italic opacity-50">No more spotlights to show</p>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showPostModal && selectedPost && (
                <SmartPostModal 
                    isOpen={showPostModal}
                    onClose={() => setShowPostModal(false)}
                    post={selectedPost} 
                    darkMode={darkMode}
                    currentUser={currentUser}
                />
            )}
        </GooeyGradientBackground>
    );
}

export default function SpotlightsPage() {
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
                <SpotlightsContent />
            </Suspense>
        </AuthGuard>
    );
}
