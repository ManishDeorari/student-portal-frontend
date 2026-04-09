import React, { useState } from "react";
import Link from "next/link";
import SectionCard from "./SectionCard";
import PostCard from "@/app/components/Post/PostCard";
import { MessageSquare, Heart, CornerUpRight, Activity, Paperclip } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileActivity({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
    // Only show user's posts
    const myPosts = (profile.posts || [])
        .filter(p => p && p._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <SectionCard title="My Posts" hasData={myPosts.length > 0} isPublicView={isPublicView}>
            <div className="space-y-6 mt-4">
                {myPosts.length === 0 ? (
                    <div className={`py-10 text-center rounded-xl border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50/50 border-gray-200'}`}>
                        <Activity className={`w-10 h-10 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`font-medium tracking-tight ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No posts to show yet.</p>
                    </div>
                ) : (
                    <>
                        {myPosts.slice(0, 3).map((item, idx) => (
                            <PostCard
                                key={`${item._id}-${idx}`}
                                post={item}
                                currentUser={profile}
                                setPosts={(updateFn) =>
                                    setProfile((prev) => ({
                                        ...prev,
                                        posts: typeof updateFn === "function" ? updateFn(prev.posts || []) : updateFn,
                                    }))
                                }
                                isProfileActivity
                                hideActions={true}
                                transparentBackground={true}
                                darkMode={darkMode}
                            />
                        ))}

                        {myPosts.length > 3 && (
                            <div className="pt-2 text-center">
                                <Link
                                    href="/dashboard/myposts"
                                    className={`inline-flex items-center gap-2 text-sm font-bold transition px-6 py-2.5 rounded-full border hover:shadow-md active:scale-95 ${darkMode ? 'bg-blue-900/20 text-blue-400 border-blue-900/40 hover:bg-blue-900/30' : 'bg-blue-50/50 text-blue-600 border-blue-100 hover:text-blue-800'}`}
                                >
                                    Show all my Posts
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </SectionCard>
    );
}

