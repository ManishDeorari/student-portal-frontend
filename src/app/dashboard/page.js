"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import AdminSidebar from "../components/AdminSidebar"; // <-- Admin sidebar
import CreatePost from "../components/Post/CreatePost";
import PostCard from "../components/Post/PostCard";
import { motion, AnimatePresence } from "framer-motion";
import socket from "@/utils/socket";

import PointsScenario from "../components/dashboard/PointsScenario";
import { useTheme } from "@/context/ThemeContext";
import { useNotifications } from "@/context/NotificationContext";
import { GooeyGradientBackground } from "../components/GooeyGradientBackground";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const { darkMode } = useTheme();
  const { handleDailyLoginPoints } = useNotifications();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  // Feed Tabs & Pending Posts
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my"
  const [pendingPosts, setPendingPosts] = useState([]);
  const [isFetchingFeed, setIsFetchingFeed] = useState(false);
  const [announcementSubtype, setAnnouncementSubtype] = useState("all"); // all | winner
  const [announcementSearch, setAnnouncementSearch] = useState("");

  // ✅ Scroll listener for Back to Top
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // ⚡ INSTANT LOAD: Hydrate UI immediately from valid cache
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setLoading(false); 
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("User fetch failed");
        
        const data = await res.json();
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data)); // Refresh cache silently

        // ✅ Check for daily login reward flag from API
        if (data.loginPointsAwarded) {
          handleDailyLoginPoints(data.loginPointsAwarded);
        }
      } catch (err) {
        console.error("User fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // ✅ Fetch posts
  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    setIsFetchingFeed(true);
    try {
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      let url = `${API_URL}/api/posts?page=${pageNum}&limit=${limit}`;
      let headers = { Authorization: `Bearer ${token}` };

      if (activeTab === "my") {
        url = `${API_URL}/api/posts/me?page=${pageNum}&limit=${limit}`;
      } else if (activeTab === "Event") {
        url = `${API_URL}/api/events?page=${pageNum}&limit=${limit}`;
      } else {
        const queryType = activeTab === "all" ? "all" : activeTab;
        url += `&type=${queryType}`;
        if (activeTab === "Announcement") {
          if (announcementSubtype === "winner") url += `&subtype=winner`;
          if (announcementSearch) url += `&search=${encodeURIComponent(announcementSearch)}`;
        }
      }

      const res = await fetch(url, { headers });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.posts)) return;

      setPosts((prev) => {
        if (!append) return data.posts;
        const newPosts = data.posts.filter(newP => !prev.some(p => p._id === newP._id));
        return [...prev, ...newPosts];
      });
      setHasMore(data.posts.length === limit);
    } catch (err) {
      console.error("Failed to fetch posts:", err.message);
    } finally {
      setIsFetchingFeed(false);
    }
  }, [activeTab, announcementSubtype, announcementSearch]);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, false);
  }, [activeTab, announcementSubtype, announcementSearch, fetchPosts]);

  const handleLoadMore = async () => {
    if (fetchingMore || !hasMore) return;
    setFetchingMore(true);
    const nextPage = page + 1;
    await fetchPosts(nextPage, true);
    setPage(nextPage);
    setFetchingMore(false);
  };

  // Socket events
  useEffect(() => {
    if (!socket || !user) return;

    const updatePost = (updatedPost) =>
      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? { ...p, ...updatedPost } : p))
      );

    const addPost = (newPost) => {
      setPosts((prev) => {
        const exists = prev.some((p) => p._id === newPost._id);
        if (exists) return prev;
        if (newPost.user?._id === user._id) {
          return [newPost, ...prev];
        } else {
          setPendingPosts((pending) => {
            const pendingExists = pending.some((p) => p._id === newPost._id);
            if (pendingExists) return pending;
            return [newPost, ...pending];
          });
          return prev;
        }
      });
    };

    const removePost = ({ postId }) =>
      setPosts((prev) => prev.filter((p) => p._id !== postId));

    const updateEventRegCount = ({ postId, registrationCount }) => {
      setPosts((prev) =>
        prev.map(p => p._id === postId ? { ...p, registrationCount } : p)
      );
    };

    socket.on("postUpdated", updatePost);
    socket.on("postCreated", addPost);
    socket.on("postReacted", updatePost);
    socket.on("postDeleted", removePost);
    socket.on("registrationCountUpdated", updateEventRegCount);

    return () => {
      socket.off("postUpdated", updatePost);
      socket.off("postCreated", addPost);
      socket.off("postReacted", updatePost);
      socket.off("postDeleted", removePost);
      socket.off("registrationCountUpdated", updateEventRegCount);
    };
  }, [user]);

  const loadPendingPosts = () => {
    setPosts((prev) => [...pendingPosts, ...prev]);
    setPendingPosts([]);
  };

  const filteredPosts = activeTab === "my"
    ? posts.filter(p => p.user?._id === user?._id)
    : posts;

  if (loading) return "Loading...";
  if (!user) return "User not found or unauthorized.";

  const SidebarComponent = user.isAdmin ? AdminSidebar : Sidebar;

  return (
    <GooeyGradientBackground className="min-h-screen transition-colors duration-500 text-white relative" darkMode={darkMode}>
      <SidebarComponent />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 md:pb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="hidden lg:block lg:w-72 order-2 lg:order-1 relative">
            <div className="lg:fixed lg:top-20 lg:w-72 z-40">
              <PointsScenario darkMode={darkMode} />
            </div>
          </aside>

          <div className="flex-1 space-y-4 sm:space-y-6 order-1 lg:order-2">
            <div className="p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl md:rounded-[2.5rem] shadow-xl overflow-hidden">
              <section className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} p-3 sm:p-4 md:p-6 rounded-[calc(1.875rem-2.5px)] md:rounded-[calc(2.5rem-2.5px)] relative overflow-hidden group transition-colors duration-500`}>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 md:gap-6">
                  <div className="p-[2px] bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-[calc(0.75rem-2px)] sm:rounded-[calc(1rem-2px)] md:rounded-[calc(1.5rem-2px)] ${darkMode ? "bg-black" : "bg-white"} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                      <span className="text-2xl sm:text-3xl md:text-4xl text-white">👋</span>
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className={`text-xl sm:text-2xl md:text-3xl font-black ${darkMode ? "text-white" : "text-black"} tracking-tight mb-0.5 sm:mb-1`}>
                      Welcome back, {user?.name || "Student"}!
                    </h2>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 md:gap-4 mt-2">
                      <span className={`text-[9px] md:text-[10px] ${darkMode ? "bg-white/10 text-white" : "bg-gray-200 text-black"} px-2 md:px-3 py-1 rounded-full font-black uppercase tracking-widest border border-white/10`}>{user?.enrollmentNumber || "N/A"}</span>
                      <span className={`text-[9px] md:text-[10px] ${darkMode ? "bg-blue-500 text-white" : "bg-blue-600 text-white"} px-2 md:px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-md`}>{user?.role || "Member"}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {(user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "faculty" || user?.isAdmin) && (
              <CreatePost setPosts={setPosts} currentUser={user} darkMode={darkMode} />
            )}

            <div className="flex justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
              {[
                { id: "all", label: "ALL" },
                { id: "Regular", label: "Posts" },
                { id: "Announcement", label: "Announcement" },
                { id: "Event", label: "Event" },
                { id: "Session", label: "Session" },
                { id: "my", label: "My Posts" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={isFetchingFeed}
                  className={`px-4 sm:px-6 py-2.5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                    ? "bg-[#FAFAFA] text-blue-700 shadow-xl scale-105"
                    : "bg-[#FAFAFA]/10 text-white hover:bg-[#FAFAFA]/20 border border-white/10"
                    } ${isFetchingFeed ? "opacity-50 cursor-wait" : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "Announcement" && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col md:flex-row items-center justify-center gap-4 p-4 rounded-3xl ${darkMode ? "bg-[#121213] border-white/10" : "bg-white/50 border-white/20"} border backdrop-blur-sm`}
              >
                <div className="flex gap-2">
                  <button onClick={() => setAnnouncementSubtype("all")} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${announcementSubtype === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-400"}`}>All Announcements</button>
                  <button onClick={() => setAnnouncementSubtype("winner")} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${announcementSubtype === "winner" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-400"}`}>Winner Announcements</button>
                </div>
                <div className="relative flex-1 max-w-md w-full">
                  <input type="text" placeholder="Search winners by name..." value={announcementSearch} onChange={(e) => setAnnouncementSearch(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-2xl text-xs font-bold border-none outline-none ${darkMode ? "bg-black/40 text-white" : "bg-white text-gray-900"}`} />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {pendingPosts.length > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex justify-center mt-6 mb-2 relative z-[500]">
                  <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); if (activeTab === "all") { fetchPosts(1, false); setPage(1); } else { setActiveTab("all"); } setPendingPosts([]); }} className="relative z-[501] bg-yellow-400 text-blue-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-3 animate-bounce">✨ {pendingPosts.length} New Post{pendingPosts.length > 1 ? "s" : ""} (Click to Refresh)</button>
                </motion.div>
              )}
            </AnimatePresence>

            <section className="space-y-8">
              {filteredPosts.length === 0 ? (
                <div className="p-12 text-center bg-[#FAFAFA] rounded-[2.5rem] border border-gray-200">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-sm">{activeTab === "my" ? "You haven't posted anything yet." : "No posts found in this category."}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {filteredPosts.map((post) => (
                      <PostCard key={post._id} post={post} currentUser={user} setPosts={setPosts} darkMode={darkMode} />
                    ))}
                  </div>

                  {hasMore ? (
                    <div className="text-center mt-12 pb-12">
                      <button onClick={handleLoadMore} disabled={fetchingMore} className="group relative px-8 sm:px-12 py-4 sm:py-5 bg-[#FAFAFA] text-blue-700 font-black text-xs uppercase tracking-widest rounded-[2rem] hover:bg-blue-50 border-b-4 border-blue-100 hover:border-blue-200 transition-all shadow-xl active:scale-95 flex items-center gap-3 mx-auto w-full sm:w-auto justify-center">
                        {fetchingMore ? (
                          <>
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>✨ <span>Load More Posts</span></>
                        )}
                      </button>
                    </div>
                  ) : filteredPosts.length > 0 && (
                    <div className="text-center py-20 relative overflow-hidden">
                       <div className={`absolute top-1/2 left-0 w-full h-[1.5px] ${darkMode ? "bg-gradient-to-r from-transparent via-white/20 to-transparent" : "bg-gradient-to-r from-transparent via-blue-200 to-transparent"}`}></div>
                       <p className={`relative z-10 text-[11px] font-black uppercase tracking-[0.5em] px-10 py-4 rounded-full inline-block transition-all duration-500 ${
                         darkMode 
                           ? "bg-[#0A0A0A] text-[#FFA500] border-2 border-[#FFA500]/30 shadow-[0_0_30px_rgba(255,165,0,0.2)]" 
                           : "bg-white text-[#D35400] border-2 border-orange-100 shadow-[0_10px_30px_rgba(211,84,0,0.15)]"
                       } backdrop-blur-xl`}>
                         ✨ <span className={`${darkMode ? "text-[#FFB347]" : "text-[#E67E22]"} drop-shadow-[0_0_10px_rgba(255,165,0,0.5)] animate-pulse`}>You have reached the end of the feed</span> ✨
                       </p>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-24 md:bottom-12 right-6 md:right-12 z-[999] p-[2px] rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 shadow-2xl group active:scale-90 transition-transform"
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[calc(1rem-2px)] ${darkMode ? "bg-slate-900" : "bg-white"} flex items-center justify-center transition-colors group-hover:bg-transparent`}>
               <span className={`text-2xl md:text-3xl transition-transform group-hover:-translate-y-1 ${darkMode ? "text-white" : "text-blue-600"} group-hover:text-white`}>↑</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </GooeyGradientBackground>
  );
}
