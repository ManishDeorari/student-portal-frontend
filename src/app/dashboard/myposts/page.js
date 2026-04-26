"use client";

import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import PostCard from "../../components/Post/PostCard";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { GooeyGradientBackground } from "../../components/GooeyGradientBackground";

export default function MyPostsPage() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(false);

  // fetch current user
  const fetchUser = useCallback(async (token) => {
    const resUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userData = await resUser.json();
    setCurrentUser(userData);
  }, []);

  // fetch only MY posts
  const fetchMyPosts = useCallback(async (pageNum = 1, append = false, tokenFromArg) => {
    const token = tokenFromArg || localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/myposts?page=${pageNum}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      console.error("❌ Failed to fetch my posts:", res.status);
      setPosts([]);
      setHasMore(false);
      return;
    }

    const data = await res.json();

    // ✅ Case A: plain array of posts
    if (Array.isArray(data)) {
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(sorted);
      setHasMore(false); // no pagination support
      return;
    }

    // ✅ Case B: object { posts, total }
    if (data.posts && Array.isArray(data.posts)) {
      setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
      const loaded = (append ? posts.length : 0) + data.posts.length;
      setHasMore(loaded < data.total);
      return;
    }

    console.error("❌ Unexpected response for my posts:", data);
    setPosts([]);
    setHasMore(false);
  }, [posts.length]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        await Promise.all([fetchUser(token), fetchMyPosts(1, false, token)]);
      } catch (e) {
        console.error("❌ Init error:", e);
      } finally {
        setInitializing(false);
      }
    })();
  }, [fetchUser, fetchMyPosts]);

  const handleLoadMore = async () => {
    const next = page + 1;
    setPage(next);
    await fetchMyPosts(next, true);
  };

  if (initializing) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        <p className="font-bold tracking-widest text-xs uppercase">Loading your posts...</p>
      </div>
    </div>
  );

  return (
    <GooeyGradientBackground className="min-h-screen text-white" darkMode={darkMode}>
      <Sidebar />

      {/* 🔷 Left-most Back Button */}
      <button
        onClick={() => router.back()}
        className={`fixed top-24 left-8 z-50 flex items-center justify-center p-3 border rounded-xl transition-all backdrop-blur-md group shadow-xl ${darkMode ? 'bg-[#FAFAFA]/10 border-white/20 text-white hover:bg-[#FAFAFA]/20' : 'bg-[#FAFAFA]/20 border-white/30 text-white hover:bg-[#FAFAFA]/30'}`}
        title="Go Back"
      >
        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
      </button>

      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl mb-10 overflow-hidden">
          <div className={`px-8 py-6 rounded-[calc(1.5rem-1px)] ${darkMode ? 'bg-slate-950' : 'bg-[#FAFAFA]'}`}>
            <div className="flex items-center gap-4">
              <div className="h-10 w-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>MY POSTS</h1>
            </div>
          </div>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map((post) => (
              currentUser ? (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={currentUser}
                  setPosts={setPosts}
                  transparentBackground={false}
                  darkMode={darkMode}
                />
              ) : (
                <div key={post._id} className={`p-8 rounded-[3rem] animate-pulse ${darkMode ? 'bg-[#121213]/50' : 'bg-[#FAFAFA]/50'}`}>Loading content…</div>
              )
            ))}

            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={handleLoadMore}
                  className="px-10 py-4 bg-[#FAFAFA]/10 hover:bg-[#FAFAFA]/20 border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition shadow-lg active:scale-95"
                >
                  Load More Posts
                </button>
              </div>
            )}
            {!hasMore && posts.length > 5 && (
              <p className="text-center mt-10 text-white/40 font-bold uppercase tracking-widest text-[10px] italic">No more posts to show</p>
            )}
          </div>
        ) : (
          <div className={`py-24 text-center rounded-[3rem] border border-white/10 backdrop-blur-md ${darkMode ? 'bg-slate-950/50' : 'bg-[#FAFAFA]/10'}`}>
            <h2 className="text-2xl font-black text-white/80">You haven&apos;t created any posts yet.</h2>
            <p className="text-white/60 mt-3 font-medium">Your future thoughts and shared experiences will appear here.</p>
          </div>
        )}
      </div>
    </GooeyGradientBackground>
  );
}

