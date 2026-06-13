import React, { useState } from "react";
import Link from "next/link";
import SectionCard from "./SectionCard";
import PostCard from "@/app/components/Post/PostCard";
import { Activity } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileActivity({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
    const displayLimit = 3;

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
                        {myPosts.slice(0, displayLimit).map((item, idx) => (
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
                                transparentBackground={true}
                                darkMode={darkMode}
                            />
                        ))}

                        <div className="flex flex-col items-center justify-center gap-4 pt-6">
                            {myPosts.length > displayLimit && (
                                <Link
                                    href="/dashboard/myposts"
                                    className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition shadow-md active:scale-95 ${darkMode ? 'bg-[#FAFAFA]/10 hover:bg-[#FAFAFA]/20 border border-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800'}`}
                                >
                                    Show All Posts
                                </Link>
                            )}
                        </div>
                    </>
                )}
            </div>
        </SectionCard>
    );
}
