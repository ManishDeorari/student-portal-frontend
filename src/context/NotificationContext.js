"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { ShieldAlert, X, MessageSquare, UserPlus, Users, Bell, Award, Eye } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadGroupMessagesCount, setUnreadGroupMessagesCount] = useState(0);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [adminSignupRequestsCount, setAdminSignupRequestsCount] = useState(0);
  const [shakeNotification, setShakeNotification] = useState(false);
  const [authTrigger, setAuthTrigger] = useState(0);

  const userRef = useRef(null);
  const recentToastsRef = useRef(new Map());
  const realtimeChannelRef = useRef(null);

  // ─── Fetch notifications from Supabase ───────────────────────────────────
  const fetchNotifications = useCallback(async (userId) => {
    try {
      const { fetchNotifications: fetchNotes } = await import("@/services/database/gateway");
      const data = await fetchNotes(userId);
      if (Array.isArray(data)) {
        const normalized = data.map(n => ({
          ...n,
          _id: n.notification_id,
          isRead: n.is_read === true,
          createdAt: n.created_at,
          sender: n.sender_profile
            ? {
                _id: n.sender_profile.profile_id,
                name: n.sender_profile.name,
                profilePicture: n.sender_profile.profile_picture,
              }
            : null,
        }));
        setNotifications(normalized);
        setUnreadCount(normalized.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  // ─── Fetch badge counts from Supabase ────────────────────────────────────
  const fetchCounts = useCallback(async (userId) => {
    try {
      const { supabase } = await import("@/services/database/client");

      // Unread notifications count
      const { count: notifCount } = await supabase
        .from("notification")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", userId)
        .eq("is_read", false);

      // Pending connection requests (received)
      const { count: connCount } = await supabase
        .from("connection")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .eq("status", "pending");

      // Unread group messages (messages in user's groups after last read)
      const { data: memberGroups } = await supabase
        .from("group_member")
        .select("group_id")
        .eq("profile_id", userId);

      const groupIds = (memberGroups || []).map(g => g.group_id);
      let groupMsgCount = 0;
      if (groupIds.length > 0) {
        const { count } = await supabase
          .from("group_message")
          .select("*", { count: "exact", head: true })
          .in("group_id", groupIds)
          .neq("sender_id", userId);
        groupMsgCount = count || 0;
      }

      // Admin: pending signup approvals
      const user = userRef.current;
      let signupCount = 0;
      if (user?.is_admin || user?.role === "admin") {
        const { count } = await supabase
          .from("profile")
          .select("*", { count: "exact", head: true })
          .eq("approved", false);
        signupCount = count || 0;
      }

      setUnreadCount(notifCount || 0);
      setPendingRequestsCount(connCount || 0);
      setUnreadGroupMessagesCount(groupMsgCount);
      setAdminSignupRequestsCount(signupCount);
    } catch (err) {
      console.error("Failed to fetch counts:", err);
    }
  }, []);

  // ─── Mark section as seen (clears badge) ─────────────────────────────────
  const markSectionAsSeen = useCallback((section) => {
    if (section === "posts" || section === "home") setNewPostsCount(0);
    if (section === "network") setPendingRequestsCount(0);
    if (section === "groups") setUnreadGroupMessagesCount(0);
    if (section === "admin-requests") setAdminSignupRequestsCount(0);
  }, []);

  // ─── Mark single notification as read ────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    try {
      const { supabase } = await import("@/services/database/client");
      await supabase
        .from("notification")
        .update({ is_read: true })
        .eq("notification_id", id);

      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  // ─── Mark all notifications as read ──────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    try {
      const user = userRef.current;
      if (!user) return;
      const userId = user.profile_id || user._id;
      const { supabase } = await import("@/services/database/client");
      await supabase
        .from("notification")
        .update({ is_read: true })
        .eq("recipient_id", userId)
        .eq("is_read", false);

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);

  // ─── Clear read notifications ─────────────────────────────────────────────
  const clearReadNotifications = useCallback(async () => {
    try {
      const user = userRef.current;
      if (!user) return;
      const userId = user.profile_id || user._id;
      const { supabase } = await import("@/services/database/client");
      await supabase
        .from("notification")
        .delete()
        .eq("recipient_id", userId)
        .eq("is_read", true);

      setNotifications(prev => prev.filter(n => !n.isRead));
      toast.success("Read notifications cleared");
    } catch (err) {
      console.error("Failed to clear read notifications:", err);
      toast.error("Failed to clear notifications");
    }
  }, []);

  // ─── Daily login reward toast ─────────────────────────────────────────────
  const handleDailyLoginPoints = useCallback((awardedPoints) => {
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className={`${t.visible ? 'block' : 'hidden'} p-[2px] rounded-3xl bg-gradient-to-r from-[#2563EB] via-[#9333EA] to-[#DB2777] shadow-[0_20px_50px_rgba(37,99,235,0.3)] pointer-events-none max-w-sm w-full mx-auto`}
      >
        <div className={`${darkMode ? 'bg-[#0A0A0B]' : 'bg-white'} px-8 py-5 rounded-[calc(1.5rem-2px)] flex items-center justify-between gap-6`}>
          <div className="flex flex-col">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              Daily Login Reward
            </h3>
            <p className={`text-[13px] font-black leading-tight uppercase tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>
              You earned <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">+{awardedPoints} Points</span> Today
            </p>
          </div>
          <div className="text-3xl animate-bounce drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]">🏆</div>
        </div>
      </motion.div>
    ), { duration: 5000, position: 'top-center' });
  }, [darkMode]);

  // ─── Premium toast for live incoming notification ─────────────────────────
  const showLiveToast = useCallback((notification) => {
    const allowedToastTypes = [
      "points_earned", "points_requested", "feedback",
      "admin_notice", "announcement", "account_approved",
      "promotion", "demotion"
    ];
    if (!allowedToastTypes.includes(notification.type)) return;

    const type = notification.type;
    let theme = {
      gradient: "from-blue-500 via-purple-500 to-indigo-500",
      icon: <Bell className="w-3.5 h-3.5" />,
      label: "Notification",
      accent: "text-blue-400",
      bgAccent: "bg-blue-500/20"
    };

    if (type === "feedback") {
      theme = { gradient: "from-emerald-500 via-teal-500 to-cyan-500", icon: <MessageSquare className="w-3.5 h-3.5" />, label: "User Feedback", accent: "text-emerald-400", bgAccent: "bg-emerald-500/20" };
    } else if (["promotion", "demotion", "account_approved"].includes(type)) {
      theme = { gradient: "from-purple-600 via-indigo-600 to-blue-600", icon: <ShieldAlert className="w-3.5 h-3.5" />, label: type === "account_approved" ? "Account Approved" : type === "promotion" ? "Role Promoted" : "Role Demoted", accent: "text-indigo-400", bgAccent: "bg-indigo-500/20" };
    } else if (type === "connect_request") {
      theme = { gradient: "from-blue-400 to-blue-600", icon: <UserPlus className="w-3.5 h-3.5 text-blue-400" />, label: "Network Request", accent: "text-blue-400", bgAccent: "bg-blue-500/10" };
    } else if (type === "connect_accept") {
      theme = { gradient: "from-green-400 to-emerald-600", icon: <UserPlus className="w-3.5 h-3.5 text-green-400" />, label: "Network Connected", accent: "text-green-400", bgAccent: "bg-green-500/10" };
    } else if (["group_joined", "group_added"].includes(type)) {
      theme = { gradient: "from-amber-400 to-orange-500", icon: <Users className="w-3.5 h-3.5" />, label: "Group Update", accent: "text-amber-400", bgAccent: "bg-amber-500/20" };
    } else if (type.includes("post") || type.includes("comment") || type.includes("like") || type.includes("reaction")) {
      theme = { gradient: "from-pink-500 to-rose-600", icon: <MessageSquare className="w-3.5 h-3.5" />, label: "Interaction", accent: "text-pink-400", bgAccent: "bg-pink-500/20" };
    } else if (type === "points_earned") {
      theme = { gradient: "from-yellow-400 via-amber-500 to-yellow-600", icon: <Award className="w-3.5 h-3.5" />, label: "Points Earning", accent: "text-yellow-400", bgAccent: "bg-yellow-500/20" };
    } else if (type === "profile_visit") {
      theme = { gradient: "from-purple-400 to-indigo-600", icon: <Eye className="w-3.5 h-3.5 text-purple-400" />, label: "Profile Visit", accent: "text-purple-400", bgAccent: "bg-purple-500/10" };
    } else if (type === "admin_notice") {
      theme = { gradient: "from-red-500 to-rose-700", icon: <ShieldAlert className="w-3.5 h-3.5 text-red-100" />, label: "Admin Notice", accent: "text-red-400", bgAccent: "bg-red-500/10" };
    } else if (type === "academic_update") {
      theme = { gradient: "from-blue-600 via-indigo-600 to-blue-600", icon: <ShieldAlert className="w-3.5 h-3.5 text-white" />, label: "Academic Update", accent: "text-blue-400", bgAccent: "bg-blue-500/10" };
    }

    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`${t.visible ? 'block' : 'hidden'} max-w-sm w-full p-[2px] bg-gradient-to-r ${theme.gradient} rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto`}
      >
        <div className={`p-5 ${darkMode ? "bg-black" : "bg-white"} rounded-[calc(2.5rem-2px)] flex flex-col gap-4 overflow-hidden relative`}>
          <div className={`absolute -top-10 -right-10 w-32 h-32 ${theme.bgAccent} blur-[60px] rounded-full`}></div>
          <div className="flex items-start z-10">
            <div className="flex-shrink-0 pt-0.5">
              <div className={`p-[2.5px] rounded-2xl bg-gradient-to-br ${theme.gradient} shadow-lg`}>
                {["academic_update", "admin_notice", "points_earned"].includes(notification.type) ? (
                  <div className={`h-11 w-11 rounded-[0.9rem] flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-white'}`}>
                    {theme.icon}
                  </div>
                ) : (
                  <Image
                    className="h-11 w-11 rounded-[0.9rem] object-cover"
                    src={notification.sender?.profilePicture || "/default-profile.jpg"}
                    alt={notification.sender?.name || "User"}
                    width={44}
                    height={44}
                  />
                )}
              </div>
            </div>
            <div className="ml-4 flex-1 pr-6">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`${darkMode ? theme.bgAccent : "bg-gray-100"} p-1.5 rounded-xl`}>{theme.icon}</div>
                <p className={`text-[10px] font-black ${darkMode ? theme.accent : "text-slate-600"} uppercase tracking-[0.25em]`}>{theme.label}</p>
              </div>
              <p className={`text-[15px] font-black ${darkMode ? "text-white" : "text-black"} leading-none mb-1`}>
                {notification.sender?.name || "System"}
              </p>
              <p className={`text-xs font-bold ${darkMode ? "text-gray-300" : "text-slate-600"} line-clamp-3 italic leading-relaxed`}>
                &quot;{notification.message}&quot;
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className={`p-1.5 rounded-xl ${darkMode ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-black"} transition-all`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => { toast.dismiss(t.id); window.location.href = "/dashboard/notifications"; }}
            className={`z-10 w-full py-4 rounded-2xl bg-gradient-to-r ${theme.gradient} text-white text-[11px] font-black uppercase tracking-[0.25em] transition-all hover:brightness-110 active:scale-95 shadow-xl`}
          >
            View in Dashboard
          </button>
        </div>
      </motion.div>
    ), { duration: 6000 });
  }, [darkMode]);

  // ─── React to auth changes ────────────────────────────────────────────────
  useEffect(() => {
    const handleAuthChange = () => setAuthTrigger(prev => prev + 1);
    window.addEventListener("local-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("local-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  // ─── Main initialization + Supabase Realtime subscription ────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      // Logged out — clear everything
      setNotifications([]);
      setUnreadCount(0);
      setPendingRequestsCount(0);
      setUnreadGroupMessagesCount(0);
      setNewPostsCount(0);
      setAdminSignupRequestsCount(0);
      userRef.current = null;

      if (realtimeChannelRef.current) {
        import("@/services/database/client").then(({ supabase }) => {
          supabase.removeChannel(realtimeChannelRef.current);
          realtimeChannelRef.current = null;
        });
      }
      return;
    }

    const user = JSON.parse(storedUser);
    userRef.current = user;
    const userId = user.profile_id || user._id || localStorage.getItem("userId");
    if (!userId) return;

    // Initial fetch
    fetchNotifications(userId);
    fetchCounts(userId);

    // Set up Supabase Realtime subscription for live notifications
    const setupRealtime = async () => {
      const { supabase } = await import("@/services/database/client");

      if (realtimeChannelRef.current) {
        await supabase.removeChannel(realtimeChannelRef.current);
      }

      const channel = supabase
        .channel(`notifications-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notification",
            filter: `recipient_id=eq.${userId}`,
          },
          async (payload) => {
            const raw = payload.new;

            // Dedup by notification_id
            const dedupKey = raw.notification_id;
            const now = Date.now();
            if (recentToastsRef.current.has(dedupKey)) {
              const lastTime = recentToastsRef.current.get(dedupKey);
              if (now - lastTime < 2000) return;
            }
            recentToastsRef.current.set(dedupKey, now);

            // Fetch sender profile
            let senderProfile = null;
            if (raw.sender_id) {
              const { data: sp } = await supabase
                .from("profile")
                .select("profile_id, name, profile_picture")
                .eq("profile_id", raw.sender_id)
                .single();
              senderProfile = sp;
            }

            const normalized = {
              ...raw,
              _id: raw.notification_id,
              isRead: false,
              createdAt: raw.created_at,
              sender: senderProfile
                ? { _id: senderProfile.profile_id, name: senderProfile.name, profilePicture: senderProfile.profile_picture }
                : null,
            };

            setNotifications(prev => {
              if (prev.some(n => n._id === normalized._id)) return prev;
              return [normalized, ...prev];
            });
            setUnreadCount(prev => prev + 1);
            setShakeNotification(true);
            setTimeout(() => setShakeNotification(false), 1000);

            // Handle special types
            if (raw.type === "points_earned" && raw.message?.includes("Daily Login")) {
              const match = raw.message.match(/\+?(\d+)/);
              handleDailyLoginPoints(match ? parseInt(match[1]) : 10);
            } else {
              showLiveToast(normalized);
            }

            // Refresh counts
            fetchCounts(userId);
          }
        )
        // Watch for new posts (for badge)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "post" },
          () => setNewPostsCount(prev => prev + 1)
        )
        // Watch for new group messages (for badge)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "group_message" },
          (payload) => {
            // Only count messages from others
            if (payload.new.sender_id !== userId) {
              setUnreadGroupMessagesCount(prev => prev + 1);
            }
          }
        )
        // Watch for new signup requests (admin only)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "profile" },
          () => {
            const u = userRef.current;
            if (u?.is_admin || u?.role === "admin") {
              setAdminSignupRequestsCount(prev => prev + 1);
            }
          }
        )
        .subscribe();

      realtimeChannelRef.current = channel;
    };

    setupRealtime();

    return () => {
      if (realtimeChannelRef.current) {
        import("@/services/database/client").then(({ supabase }) => {
          supabase.removeChannel(realtimeChannelRef.current);
          realtimeChannelRef.current = null;
        });
      }
    };
  }, [fetchNotifications, fetchCounts, authTrigger, showLiveToast, handleDailyLoginPoints]);

  const value = {
    notifications,
    unreadCount,
    pendingRequestsCount,
    unreadGroupMessagesCount,
    newPostsCount,
    adminSignupRequestsCount,
    shakeNotification,
    markSectionAsSeen,
    markAsRead,
    markAllAsRead,
    clearReadNotifications,
    handleDailyLoginPoints,
    refreshNotifications: () => {
      const user = userRef.current;
      const userId = user?.profile_id || user?._id;
      if (userId) fetchNotifications(userId);
    },
    refreshCounts: () => {
      const user = userRef.current;
      const userId = user?.profile_id || user?._id;
      if (userId) fetchCounts(userId);
    },
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
