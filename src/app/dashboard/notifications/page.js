"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import PostCard from "../../components/Post/PostCard";
import Image from "next/image";
import socket from "@/utils/socket";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Layers,
  MessageSquare,
  UserPlus,
  Eye,
  ShieldAlert,
  CheckCheck,
  Calendar,
  Clock,
  ChevronRight,
  X,
  Users,
  Award,
  Trash2
} from "lucide-react";

const TABS = [
  { id: "ALL", label: "All", icon: <Layers className="w-4 h-4" /> },
  { id: "POST", label: "Posts", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "GROUP", label: "Groups", icon: <Users className="w-4 h-4" /> },
  { id: "NETWORK", label: "Network", icon: <UserPlus className="w-4 h-4" /> },
  { id: "VISIT", label: "Visits", icon: <Eye className="w-4 h-4" /> },
  { id: "POINTS", label: "Points", icon: <Award className="w-4 h-4" /> },
  { id: "NOTICE", label: "Notice", icon: <ShieldAlert className="w-4 h-4" /> },
  { id: "FEEDBACK", label: "Feedback", icon: <MessageSquare className="w-4 h-4" /> },
];

import { useNotifications } from "@/context/NotificationContext";

export default function NotificationsPage() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
      setMounted(true);
  }, []);

  const { darkMode } = useTheme();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead,
    clearReadNotifications,
    refreshNotifications 
  } = useNotifications();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [notFoundError, setNotFoundError] = useState(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // ⚡ OPTIMISTIC HYDRATION
  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
      setLoading(false); // Can show UI immediately if we have a cached user
    }
  }, []);

  useEffect(() => {
    const fetchUserAndNotes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch user profile to ensure permissions/role are up to date
        const userRes = await fetch(`${API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData)); // Sync cache
        }
        
        // Notification context manages fetching notifications; we just trigger a refresh
        refreshNotifications();
      } catch (err) {
        console.error("Error initializing Notifications page:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndNotes();
  }, [API_URL, refreshNotifications]);

  // ✅ Scroll listener for Back to Top
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNotificationClick = async (note) => {
    if (!note.isRead) {
      markAsRead(note._id);
    }

    if (note.type === "connect_request" || note.type === "connect_accept" || note.type === "feedback" || note.type === "profile_visit") {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/user/${note.sender?._id || note.sender}`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
           router.push(`/profile/${note.sender?._id || note.sender}`);
        } else {
           setNotFoundError("User");
        }
      } catch (err) {
         setNotFoundError("User");
      }
    } else if (note.type === "group_joined" || note.type === "group_added") {
      router.push("/dashboard/groups");
    } else if (note.type === "points_earned") {
      if (note.postId) {
        try {
          const res = await fetch(`${API_URL}/api/posts/${note.postId._id || note.postId}`);
          if (res.ok) {
            const postData = await res.json();
            setSelectedPost(postData);
            setShowPostModal(true);
          } else {
            setNotFoundError("Post");
          }
        } catch (err) {
          setNotFoundError("Post");
        }
      }
    } else if (note.postId) {
      try {
        const res = await fetch(`${API_URL}/api/posts/${note.postId._id || note.postId}`);
        if (res.ok) {
          const postData = await res.json();
          setSelectedPost(postData);
          setShowPostModal(true);
        } else {
          setNotFoundError("Post");
        }
      } catch (err) {
        setNotFoundError("Post");
      }
    }
  };

  // Logic to filter and group notifications
  const filteredAndGroupedNotifications = useMemo(() => {
    let filtered = notifications;

    // 1. Filter by Tab
    if (activeTab === "FEEDBACK") {
      filtered = notifications.filter(n => n.type === "feedback");
    } else if (activeTab === "POST") {
      filtered = notifications.filter(n => ["post_like", "post_comment", "comment_like", "comment_reply", "reply_like", "comment_reaction", "reply_reaction"].includes(n.type));
    } else if (activeTab === "NETWORK") {
      filtered = notifications.filter(n => ["connect_request", "connect_accept"].includes(n.type));
    } else if (activeTab === "VISIT") {
      filtered = notifications.filter(n => n.type === "profile_visit");
    } else if (activeTab === "NOTICE") {
      filtered = notifications.filter(n => ["admin_notice", "academic_update"].includes(n.type));
    } else if (activeTab === "POINTS") {
      filtered = notifications.filter(n => n.type === "points_earned");
    } else if (activeTab === "GROUP") {
      filtered = notifications.filter(n => ["group_joined", "group_added", "group_removed", "group_disbanded"].includes(n.type));
    }

    // 2. Group by Time
    const groups = {
      NEW: { label: "New Notifications", items: [], icon: <Bell className="w-4 h-4 text-yellow-400" /> },
      TODAY: { label: "Today", items: [], icon: <Clock className="w-4 h-4 text-blue-400" /> },
      YESTERDAY: { label: "Yesterday", items: [], icon: <Calendar className="w-4 h-4 text-purple-400" /> },
      OLDER: { label: "Older", items: [], icon: <Clock className="w-4 h-4 text-gray-400" /> },
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    filtered.forEach(note => {
      const noteDate = new Date(note.createdAt);
      const isRead = note.isRead;

      if (!isRead) {
        groups.NEW.items.push(note);
      } else if (noteDate >= today) {
        groups.TODAY.items.push(note);
      } else if (noteDate >= yesterday) {
        groups.YESTERDAY.items.push(note);
      } else {
        groups.OLDER.items.push(note);
      }
    });

    return Object.entries(groups).filter(([_, group]) => group.items.length > 0);
  }, [notifications, activeTab]);

  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const userObj = user || JSON.parse(localStorage.getItem("user"));
    setIsAdmin(userObj?.isAdmin || userObj?.role === "admin");
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-4 border-white border-t-transparent rounded-full"
      />
    </div>
  );

  const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;

  return (
    <div className={`min-h-screen pb-24 md:pb-20 bg-gradient-to-br from-blue-600 to-purple-700`}>
      <SidebarComponent />

      <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <h1 className={`text-2xl sm:text-4xl font-black tracking-tight flex items-center gap-2 sm:gap-3 text-white`}>
              Notifications
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full items-center font-bold shadow-lg shadow-blue-500/20">
                  {notifications.filter(n => !n.isRead).length} New
                </span>
              )}
            </h1>
            <p className={`mt-1 sm:mt-2 text-xs sm:text-base font-medium text-white/80`}>Keep track of your community interactions</p>
          </div>
          
          <div className="flex flex-row items-center gap-3">
            <div className={`relative p-[2px] rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all shadow-sm ${!notifications.some(n => !n.isRead) ? 'opacity-30 cursor-not-allowed' : ''}`}>
              <button
                onClick={markAllAsRead}
                disabled={!notifications.some(n => !n.isRead)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 w-full h-full rounded-[calc(0.75rem-2px)] transition-all duration-300 text-xs sm:text-sm font-bold backdrop-blur-md ${
                  darkMode 
                    ? 'bg-black hover:bg-black/80 text-white' 
                    : 'bg-white hover:bg-gray-50 text-slate-700 hover:text-blue-600'
                } disabled:cursor-not-allowed active:scale-95`}
              >
                <CheckCheck className="w-5 h-5 text-blue-500" />
                <span className="hidden xs:inline">Mark all read</span>
                <span className="xs:hidden">All Read</span>
              </button>
            </div>

            <div className={`relative p-[2px] rounded-xl bg-gradient-to-r from-red-500 to-pink-600 transition-all shadow-sm ${!notifications.some(n => n.isRead) ? 'opacity-30 cursor-not-allowed' : ''}`}>
              <button
                onClick={() => {
                  if (notifications.some(n => n.isRead)) {
                    setShowClearModal(true);
                  }
                }}
                disabled={!notifications.some(n => n.isRead)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 w-full h-full rounded-[calc(0.75rem-2px)] transition-all duration-300 text-xs sm:text-sm font-bold backdrop-blur-md ${
                  darkMode 
                    ? 'bg-black hover:bg-black/80 text-red-500' 
                    : 'bg-white hover:bg-red-50 text-red-600'
                } disabled:cursor-not-allowed active:scale-95`}
              >
                <Trash2 className="w-5 h-5" />
                <span className="hidden xs:inline">Clear Read</span>
                <span className="xs:hidden">Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subsections (Tabs) */}
        <div className="relative p-[2px] mb-6 sm:mb-8 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-full sm:w-fit shadow-md">
          <div className={`flex gap-1.5 sm:gap-2 p-1.5 rounded-[calc(1rem-2px)] w-full backdrop-blur-xl overflow-x-auto no-scrollbar ${darkMode ? 'bg-black/90' : 'bg-white'}`}>
            {TABS.filter(tab => {
              const isAdmin = user?.isAdmin || user?.role === "admin" || JSON.parse(localStorage.getItem("user") || "{}")?.isAdmin;
              const isMainAdmin = user?.isMainAdmin || JSON.parse(localStorage.getItem("user") || "{}")?.isMainAdmin;

              if (tab.id === "FEEDBACK") return isMainAdmin;
              if (tab.id === "POINTS") {
                const userRole = user?.role || JSON.parse(localStorage.getItem("user") || "{}")?.role;
                return userRole === "student";
              }
              return true;
            }).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                  ? (darkMode ? "bg-white/10 text-blue-400 shadow-lg shadow-black/20" : "bg-blue-50 text-blue-600 shadow-md border border-blue-200")
                  : (darkMode ? "text-white/60 hover:text-white hover:bg-[#FAFAFA]/10" : "text-slate-500 hover:text-slate-700 hover:bg-gray-50")
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl p-16 text-center border relative overflow-hidden p-[1px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 shadow-xl`}
          >
            <div className={`p-16 rounded-[calc(1.5rem-1px)] ${darkMode ? 'bg-black' : 'bg-[#FAFAFA]'}`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-[#FAFAFA]/5 text-white/50' : 'bg-gray-50 text-slate-300'}`}>
                <Bell className="w-10 h-10" />
              </div>
              <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>No notifications found</h2>
              <p className={`${darkMode ? 'text-white/40' : 'text-slate-500'} max-w-xs mx-auto text-sm`}>When you get likes, comments, or connection requests, they&apos;ll show up here.</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {filteredAndGroupedNotifications.map(([key, group]) => (
              <div key={key} className="space-y-4">
                <div className="flex items-center gap-2 px-4">
                  {group.icon}
                  <h3 className={`text-sm font-black uppercase tracking-widest text-white`}>
                    {group.label}
                  </h3>
                  <div className={`h-[1px] flex-1 ml-4 ${darkMode ? 'bg-[#FAFAFA]/20' : 'bg-[#FAFAFA]/40'}`}></div>
                </div>

                <div className="grid gap-2 sm:gap-4">
                  <AnimatePresence mode="popLayout">
                    {group.items.map((note) => (
                      <motion.div
                        layout
                        key={note._id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        onClick={() => handleNotificationClick(note)}
                        className={`relative p-[2px] bg-gradient-to-r ${note.type === 'points_earned' ? 'from-amber-400 via-yellow-500 to-amber-500' : 'from-blue-500 via-purple-500 to-pink-500'} rounded-2xl transition-all duration-300 group shadow-md`}
                      >
                        <div className={`relative flex items-start gap-2.5 sm:gap-4 p-2.5 sm:py-3 sm:px-5 rounded-[calc(1rem-2px)] transition-all ${
                          !note.isRead
                            ? (darkMode ? "bg-black/90 hover:bg-black" : "bg-[#FAFAFA] hover:bg-white shadow-md")
                            : (darkMode ? "bg-black/80 shadow-inner" : "bg-gray-50 shadow-inner")
                        } ${!note.isRead ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}`}>
                          <div className="relative shrink-0">
                            <div className={`p-[2px] rounded-2xl bg-gradient-to-br ${note.type === 'points_earned' ? 'from-purple-500 to-blue-500' : 'from-blue-500 to-purple-500'} shadow-[0_0_10px_rgba(255,255,255,0.1)] ${!note.isRead ? 'opacity-100' : 'opacity-80 grayscale-[20%]'}`}>
                              {note.type === "points_earned" ? (
                                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-[0.9rem] flex items-center justify-center ${darkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                                  <Award className={`w-5 h-5 sm:w-8 sm:h-8 ${darkMode ? 'text-white' : 'text-slate-900'}`} />
                                </div>
                              ) : note.type === "academic_update" || note.type === "admin_notice" ? (
                                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-[0.9rem] flex items-center justify-center ${darkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                                  <ShieldAlert className={`w-5 h-5 sm:w-8 sm:h-8 ${darkMode ? 'text-white' : 'text-slate-900'}`} />
                                </div>
                              ) : (
                                <Image
                                  src={note.sender?.profilePicture || "/default-profile.jpg"}
                                  alt={note.sender?.name || "User"}
                                  width={56}
                                  height={56}
                                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-[0.9rem] object-cover bg-[#FAFAFA]"
                                />
                              )}
                            </div>
                            {!note.isRead && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 sm:gap-4">
                              <div>
                                <div className="flex flex-col gap-1">
                                  {note.type === "points_earned" ? (
                                    <>
                                      <span className="font-black text-sm sm:text-lg tracking-tight bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">System</span>
                                      {(() => {
                                        let msg = note.message;
                                        let cat = "Reward";
                                        let pts = "0";
                                        const isPenalty = note.message?.startsWith("MANUAL_PENALTY::");

                                        if (note.message?.startsWith("MANUAL_AWARD::")) {
                                          const parts = note.message.split("::");
                                          msg = parts[1] || "";
                                          cat = parts[2]?.replace(/([A-Z])/g, ' $1').trim() || "Reward";
                                          pts = parts[3] || "0";
                                        } else if (note.message?.startsWith("SESSION_AWARD::")) {
                                          const parts = note.message.split("::");
                                          pts = parts[1] || "0";
                                          msg = "Congratulations! Your session has been approved.";
                                          cat = "Campus Engagement";
                                        } else if (isPenalty) {
                                          const parts = note.message.split("::");
                                          msg = parts[1] || "";
                                          cat = "Penalty";
                                          pts = parts[3] || "0";
                                        } else {
                                          const match = note.message?.match(/\+?(\d+)\s*(?:PTS|pts|points|Points)/i);
                                          if (match) {
                                              pts = match[1];
                                              msg = note.message.replace(match[0], '').trim() || "Points Earned";
                                          } else {
                                              const matchEnd = note.message?.match(/(\d+)$/);
                                              if (matchEnd) {
                                                pts = matchEnd[1];
                                                msg = note.message.replace(matchEnd[0], '').trim();
                                              } else {
                                                pts = "10";
                                              }
                                          }
                                        }

                                        // Apply categorical fallback
                                        if ((cat === "Reward" || !cat) && !isPenalty) {
                                          const lowerMsg = msg?.toLowerCase() || note.message?.toLowerCase() || "";
                                          if (lowerMsg.includes("post")) cat = "Post";
                                          else if (lowerMsg.includes("like")) cat = "Like";
                                          else if (lowerMsg.includes("comment")) cat = "Comment";
                                          else if (lowerMsg.includes("network") || lowerMsg.includes("connect")) cat = "Network";
                                          else if (lowerMsg.includes("login") || lowerMsg.includes("daily")) cat = "Login";
                                          else if (lowerMsg.includes("announcement") || lowerMsg.includes("announce") || lowerMsg.includes("earned") || lowerMsg.includes("first")) cat = "Student Participation";
                                          else cat = "Reward";
                                        }

                                        const cardGrad = isPenalty ? "from-red-600 via-orange-500 to-red-600" : "from-purple-500 via-blue-500 to-purple-500";
                                        const textGrad = isPenalty ? "from-red-500 to-orange-500" : "from-purple-500 to-blue-500";
                                        const tagTheme = isPenalty 
                                          ? (darkMode ? 'bg-black text-red-400' : 'bg-white text-red-700')
                                          : (darkMode ? 'bg-black text-blue-400' : 'bg-white text-purple-700');

                                        return (
                                          <div className={`relative p-[2px] mt-2 rounded-2xl bg-gradient-to-r ${cardGrad} shadow-md`}>
                                            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center w-full rounded-[calc(1rem-1px)] p-3 sm:p-4 ${darkMode ? 'bg-[#121212]' : 'bg-white'}`}>
                                              <div className={`text-left font-bold text-xs sm:text-base leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                                {msg}
                                              </div>
                                              <div className="flex justify-center relative">
                                                <div className={`p-[1px] rounded-full bg-gradient-to-r ${textGrad} shadow-sm`}>
                                                  <span className={`block font-bold uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full whitespace-nowrap ${tagTheme}`}>
                                                    {cat}
                                                  </span>
                                                </div>
                                              </div>
                                              <div className={`text-right sm:text-right font-black text-base sm:text-2xl tracking-tighter bg-gradient-to-br ${textGrad} bg-clip-text text-transparent drop-shadow-sm`}>
                                                {isPenalty ? "-" : "+"}{pts} PTS
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-black text-sm sm:text-lg tracking-tight bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                                        {note.sender?.name || "System"}
                                      </span>
                                      {(() => {
                                        let cat = "Notification";
                                        const typeStr = note.type || "";
                                        if (typeStr === "feedback") cat = "User Feedback";
                                        else if (typeStr.includes("group")) cat = "Group";
                                        else if (typeStr.includes("comment") || typeStr.includes("reply")) cat = "Discussion";
                                        else if (typeStr.includes("post") || typeStr.includes("like") || typeStr.includes("reaction")) cat = "Post";
                                        else if (typeStr.includes("profile_visit")) cat = "Profile Visit";
                                        else if (typeStr.includes("connect")) cat = "Network";
                                        else if (typeStr.includes("notice")) cat = "Announcement";
                                        else if (typeStr === "academic_update") cat = "Academic Update";

                                        const gradient = note.type === "feedback" 
                                          ? "from-indigo-600 via-blue-600 to-indigo-600" 
                                          : "from-blue-500 via-purple-500 to-pink-500";

                                        return (
                                          <div className={`relative p-[2px] mt-2 rounded-2xl bg-gradient-to-r ${gradient} shadow-md w-full`}>
                                            <div className={`w-full rounded-[calc(1rem-1px)] p-3 sm:p-5 ${darkMode ? 'bg-[#121212]' : 'bg-white'} border ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
                                               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                 <p className={`flex-1 text-xs sm:text-base font-bold leading-relaxed ${darkMode ? 'text-white/90' : 'text-slate-800'}`}>
                                                    {note.message ? note.message.charAt(0).toUpperCase() + note.message.slice(1) : ""}
                                                 </p>
                                                 <div className={`shrink-0 p-[1px] rounded-full bg-gradient-to-r ${note.type === 'feedback' ? 'from-indigo-500 to-blue-500' : 'from-blue-500 to-purple-500'} shadow-sm self-end sm:self-center`}>
                                                   <span className={`block font-extrabold uppercase tracking-widest text-[9px] px-4 py-1.5 rounded-full whitespace-nowrap ${darkMode ? 'bg-black text-blue-400' : 'bg-white text-indigo-700'}`}>
                                                     {cat}
                                                   </span>
                                                 </div>
                                               </div>
                                            </div>
                                          </div>

                                        );
                                      })()}
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 px-2 py-0.5 rounded-md ${darkMode ? 'bg-[#FAFAFA]/10 text-white/90' : 'bg-gray-200/50 text-slate-700'}`}>
                                    <Clock className="w-3 h-3" />
                                    {mounted ? new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                                  </span>
                                  <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 px-2 py-0.5 rounded-md ${darkMode ? 'bg-[#FAFAFA]/10 text-white/90' : 'bg-gray-200/50 text-slate-700'}`}>
                                    <Calendar className="w-3 h-3" />
                                    {mounted ? new Date(note.createdAt).toLocaleDateString() : "Date"}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className={`w-5 h-5 transition-all ${!note.isRead ? (darkMode ? 'text-white/20 group-hover:text-white' : 'text-slate-300 group-hover:text-blue-500') : 'opacity-0'} group-hover:translate-x-1`} />
                            </div>
                          </div>

                          {!note.isRead && (
                            <div className="absolute inset-y-4 left-0 w-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {showPostModal && selectedPost && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative ${darkMode ? 'bg-[#121213] border-white/10 text-white' : 'bg-[#FAFAFA] border-gray-100 text-slate-900'} rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border`}
            >
              <button
                onClick={() => setShowPostModal(false)}
                className={`absolute top-6 right-6 z-20 p-2 rounded-full transition-all active:scale-90 border ${darkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200'}`}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-6">
                {user && (
                  <PostCard
                    post={selectedPost}
                    currentUser={user}
                    setPosts={(updater) => {
                      if (typeof updater === 'function') {
                        setSelectedPost(prev => updater([prev])[0] || updater(prev));
                      } else {
                        setSelectedPost(Array.isArray(updater) ? updater[0] : updater);
                      }
                    }}
                    initialShowComments={true}
                    darkMode={darkMode}
                    transparentBackground={true}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Clear Modal */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`p-[3px] rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(239,68,68,0.3)] max-w-sm w-full bg-gradient-to-tr from-red-600 via-pink-600 to-red-600`}
            >
              <div className={`p-8 sm:p-10 rounded-[calc(2.5rem-3px)] flex flex-col items-center text-center relative overflow-hidden ${darkMode ? 'bg-[#0A0A0B]' : 'bg-white'}`}>
                {/* Decorative background pulse */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 blur-[50px] rounded-full animate-pulse"></div>
                
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl relative z-10 ${darkMode ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-600'}`}>
                  <Trash2 className="w-10 h-10" />
                  <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-3xl -z-10"></div>
                </div>

                <h3 className={`text-2xl sm:text-3xl font-black mb-4 tracking-tighter relative z-10 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Clear All Read?
                </h3>
                
                <p className={`text-sm sm:text-base font-bold mb-10 leading-relaxed relative z-10 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  This will <span className="text-red-500 font-black">permanently delete</span> all read notifications from your history. This action cannot be undone.
                </p>

                <div className="grid grid-cols-2 gap-4 w-full relative z-10">
                  <button
                    onClick={() => setShowClearModal(false)}
                    className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] active:scale-95 border-2 ${
                      darkMode 
                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                        : 'bg-gray-50 border-gray-100 text-slate-600 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                        clearReadNotifications();
                        setShowClearModal(false);
                    }}
                    className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] active:scale-95 text-white bg-gradient-to-r from-red-600 to-pink-600 shadow-[0_10px_20px_-5px_rgba(239,68,68,0.4)]`}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Not Found Error Modal */}
      <AnimatePresence>
        {notFoundError && (
          <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`p-[2.5px] rounded-[2rem] shadow-2xl max-w-sm w-full bg-gradient-to-tr from-red-500 to-orange-500`}
            >
              <div className={`p-8 rounded-[calc(2rem-2px)] flex flex-col items-center text-center ${darkMode ? 'bg-[#121212]' : 'bg-white'}`}>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{notFoundError} Not Found</h3>
                <p className={`text-sm font-semibold mb-6 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                  The {notFoundError.toLowerCase()} you are looking for has been deleted or no longer exists.
                </p>
                <button
                  onClick={() => setNotFoundError(null)}
                  className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 text-white bg-gradient-to-r from-red-500 to-orange-500 shadow-lg`}
                >
                  Okay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
    </div>
  );
}

// X is now imported from lucide-react

