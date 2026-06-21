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

    const fetchPosts = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token || !publicId) return;

            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${API_URL}/api/posts?userId=${publicId}&limit=50&type=all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to fetch posts");

            const data = await res.json();
            setPosts(data.posts || data || []);
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
        <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 profile-mobile-scale ${darkMode ? "bg-[#0A0A0A] text-white" : "bg-[#f8f9fa] text-gray-900"}`}>
            <GooeyGradientBackground />
            

            
            <div className="flex relative z-10 h-screen overflow-hidden">
                {isAdmin ? <AdminSidebar /> : <Sidebar />}

                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    {/* Header - Transparent */}
                    <div className="shrink-0 z-20 bg-transparent border-none">
                        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">

                            <div className="flex items-center gap-4">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">User Posts</h1>
                                    <p className={`text-xs sm:text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        All posts by this user
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
                        <div className="max-w-4xl mx-auto w-full px-2 sm:px-6 mt-2 mb-8 flex flex-col sm:flex-row items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className={`p-3 rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center shrink-0 ${darkMode ? "bg-black hover:bg-gray-900 text-white shadow-white/5 border border-gray-800" : "bg-white hover:bg-gray-50 text-black shadow-black/5 border border-gray-200"}`}
                                aria-label="Go back"
                            >
                                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <div className="flex-1 p-[1.5px] rounded-[2.5rem] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-xl w-full mx-auto max-w-full">
                                <div className={`p-1.5 rounded-[calc(2.5rem-1.5px)] flex flex-wrap justify-center gap-2 ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"}`}>
                                    {[
                                        { id: "all", label: "All", icon: "🌍" },
                                        { id: "Regular", label: "Posts", icon: "📝" },
                                        { id: "Announcement", label: "Announcements", icon: "📢" },
                                        { id: "Event", label: "Events", icon: "📅" },
                                        { id: "Session", label: "Sessions", icon: "🎥" }
                                    ].map((tab) => (
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

                        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8">
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
            </div>
        </div>
    );
}

export default function UserPostsPage() {
    return (
        <AuthGuard>
            <PostsContent />
        </AuthGuard>
    );
}
