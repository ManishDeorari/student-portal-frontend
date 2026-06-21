import React, { useState } from "react";
import Link from "next/link";
import SectionCard from "./SectionCard";
import PostCard from "@/app/components/Post/PostCard";
import { Activity } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileActivity({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
    const [displayLimit, setDisplayLimit] = useState(3);

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
                            {myPosts.length > displayLimit ? (
                                <div className="p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[calc(0.75rem+2px)] shadow-lg inline-block">
                                  <Link
                                      href={`/profile/${profile.publicId || profile._id}/posts`}
                                      className={`block px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition active:scale-95 ${darkMode ? 'bg-[#121213] hover:bg-slate-800 text-white' : 'bg-white hover:bg-gray-50 text-gray-800'}`}
                                  >
                                      Show All Posts
                                  </Link>
                                </div>
                            ) : myPosts.length > 3 ? (
                                <>
                                    <div className="p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[calc(0.75rem+2px)] shadow-lg inline-block">
                                      <Link
                                          href={`/profile/${profile.publicId || profile._id}/posts`}
                                          className={`block px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition active:scale-95 ${darkMode ? 'bg-[#121213] hover:bg-slate-800 text-white' : 'bg-white hover:bg-gray-50 text-gray-800'}`}
                                      >
                                          Show All Posts
                                      </Link>
                                    </div>
                                    <p className="text-center font-bold uppercase tracking-widest text-[10px] italic opacity-50">No more recent posts to show</p>
                                </>
                            ) : null}
                        </div>
                    </>
                )}
            </div>
        </SectionCard>
    );
}
