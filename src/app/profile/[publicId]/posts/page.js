"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import AdminSidebar from "@/app/components/AdminSidebar";
import { ArrowLeft, Activity } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import AuthGuard from "@/app/components/AuthGuard";
import { GooeyGradientBackground } from "@/app/components/GooeyGradientBackground";
import PostCard from "@/app/components/Post/PostCard";

function PostsContent() {
    const params = useParams();
    const router = useRouter();
    const { darkMode } = useTheme();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");

    const publicId = params?.publicId;

    const [profile, setProfile] = useState(null);

    const fetchPosts = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token || !publicId) return;

            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const userStr = localStorage.getItem("user");
            let currentUser = null;
            if (userStr) currentUser = JSON.parse(userStr);

            const viewingOther = !!(publicId && currentUser && publicId !== currentUser._id && publicId !== currentUser.publicId);
            const postsEndpoint = viewingOther
                ? `${API_URL}/api/posts?userId=${publicId}&limit=50&type=all`
                : `${API_URL}/api/user/myposts`;
                
            const targetId = publicId === "me" ? "me" : publicId;

            const [res, resProfile] = await Promise.all([
                fetch(postsEndpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/user/${targetId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (!res.ok) throw new Error("Failed to fetch posts");

            const data = await res.json();
            setPosts(data.posts || data || []);
            
            if (resProfile.ok) {
                const profileData = await resProfile.json();
                setProfile(profileData);
            }
            
            setLoading(false);
        } catch (error) {
            console.error("❌ Error fetching user posts:", error.message);
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
        fetchPosts();
    }, [fetchPosts]);

    const filteredPosts = posts.filter(post => {
        if (activeFilter === "all") return true;
        if (activeFilter === "Regular") return post.type === "Regular" || !post.type;
        return post.type === activeFilter;
    });

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-[#0A0A0A]" : "bg-[#f8f9fa]"}`}>
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <GooeyGradientBackground className={`min-h-screen transition-colors duration-500 profile-mobile-scale ${darkMode ? "text-white" : "text-gray-900"}`} darkMode={darkMode}>
            <div className="relative z-10 min-h-screen pb-20">
                {isAdmin ? <AdminSidebar /> : <Sidebar />}

                <div className="max-w-4xl mx-auto py-12 px-1 sm:px-4 lg:px-8">
                    <div className="relative p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl overflow-hidden mb-10 w-full">
                        <div className={`px-4 sm:px-8 py-4 sm:py-6 rounded-[calc(1.5rem-2.5px)] h-full flex flex-col justify-center ${darkMode ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                                <div className="flex items-center gap-3 sm:gap-6 w-full">
                                    <div className="relative p-[1.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl group transition-all duration-300 hover:shadow-lg shrink-0">
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
                                            <div className="h-8 sm:h-10 w-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] shrink-0"></div>
                                            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight uppercase truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>User Posts</h1>
                                        </div>
                                        
                                        {profile && (
                                            <div className="flex items-center gap-3 mt-3 pl-0 sm:pl-2">
                                                <div className="relative p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg shrink-0">
                                                    <img src={profile.profilePicture || "/default-profile.jpg"} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-[2.5px] ${darkMode ? 'border-black' : 'border-white'}`} alt="Profile" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-sm sm:text-base font-black leading-tight truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{profile.name}</span>
                                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] truncate text-blue-500 mt-0.5">{profile.enrollmentNumber || profile.universityRollNumber || profile.role}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8 max-w-3xl mx-auto w-full">
                        <div className="p-[1.5px] rounded-[2.5rem] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-xl w-full mx-auto max-w-full">
                            <div className={`p-1.5 rounded-[calc(2.5rem-1.5px)] flex flex-wrap justify-center gap-2 ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"}`}>
                                {[
                                    { id: "all", label: "All", icon: "🌍" },
                                    { id: "Regular", label: "Posts", icon: "📝" },
                                    { id: "Announcement", label: "Announcements", icon: "📢" },
                                    { id: "Event", label: "Events", icon: "📅" }
                                ].filter(tab => {
                                    if (tab.id === "Announcement" || tab.id === "Event") {
                                        return profile?.role === "admin" || profile?.role === "faculty";
                                    }
                                    return true;
                                }).map((tab) => (
                                    <div 
                                        key={tab.id} 
                                        className={`p-[1.5px] rounded-full transition-all bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 ${
                                            activeFilter === tab.id 
                                                ? 'scale-105 shadow-lg shadow-blue-500/30 relative z-10' 
                                                : 'hover:scale-105 relative z-0'
                                        }`}
                                    >
                                        <button
                                            onClick={() => setActiveFilter(tab.id)}
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-[calc(9999px-1.5px)] font-black text-xs uppercase tracking-widest transition-all h-full w-full ${
                                                activeFilter === tab.id
                                                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white"
                                                    : (darkMode ? "bg-[#121213] text-white/80 hover:text-white" : "bg-white text-black/80 hover:text-blue-700")
                                            } active:scale-95`}
                                        >
                                            <span className="text-sm">{tab.icon}</span>
                                            <span>{tab.label}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="max-w-3xl mx-auto w-full">
                        {filteredPosts.length === 0 ? (
                            <div className={`py-20 text-center rounded-3xl border-2 border-dashed ${darkMode ? "bg-slate-800/30 border-white/10" : "bg-gray-50/50 border-gray-200"}`}>
                                <Activity className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
                                <h3 className={`text-lg sm:text-xl font-bold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>No Posts Found</h3>
                                <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-500"}`}>There are no posts matching this filter.</p>
                            </div>
                        ) : (
                            <div className="space-y-6 sm:space-y-8">
                                {filteredPosts.map((post, idx) => (
                                    <PostCard
                                        key={`${post._id}-${idx}`}
                                        post={post}
                                        currentUser={currentUser}
                                        setPosts={setPosts}
                                        darkMode={darkMode}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </GooeyGradientBackground>
    );
}

export default function UserPostsPage() {
    return (
        <AuthGuard>
            <PostsContent />
        </AuthGuard>
    );
}
