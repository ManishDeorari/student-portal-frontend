"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import socket from "@/utils/socket";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { ShieldAlert, X, MessageSquare, UserPlus, Users, Bell, Award } from "lucide-react";
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

export  const NotificationProvider = ({ children }) => {
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadGroupMessagesCount, setUnreadGroupMessagesCount] = useState(0);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [adminSignupRequestsCount, setAdminSignupRequestsCount] = useState(0);
  const [shakeNotification, setShakeNotification] = useState(false);
  const [authTrigger, setAuthTrigger] = useState(0);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const userRef = useRef(null);

  const fetchNotifications = useCallback(async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map(n => ({
          ...n,
          isRead: n.isRead === true || n.isRead === "true" || n.isRead === 1 || n.isRead === "1"
        }));
        setNotifications(normalized);
        const unread = normalized.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      if (err.name !== "TypeError" || err.message !== "Failed to fetch") {
        console.error("Failed to fetch notifications:", err);
      }
    }
  }, [API_URL]);

  const fetchCounts = useCallback(async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/counts/unread`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNewPostsCount(data.unreadPostsCount || 0);
        setPendingRequestsCount(data.pendingRequestsCount || 0);
        setUnreadGroupMessagesCount(data.unreadGroupMessagesCount || 0);
        setUnreadCount(data.unreadNotificationsCount || 0);
        setAdminSignupRequestsCount(data.adminSignupRequestsCount || 0);
      }
    } catch (err) {
      if (err.name !== "TypeError" || err.message !== "Failed to fetch") {
        console.error("Failed to fetch counts:", err);
      }
    }
  }, [API_URL]);

  const markSectionAsSeen = useCallback(async (section) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`${API_URL}/api/counts/mark-seen/${section}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state immediately
      if (section === "posts" || section === "home") setNewPostsCount(0);
      if (section === "network") setPendingRequestsCount(0);
      if (section === "groups") setUnreadGroupMessagesCount(0);
      if (section === "admin-requests") setAdminSignupRequestsCount(0);
    } catch (err) {
      console.error(`Failed to mark ${section} as seen:`, err);
    }
  }, [API_URL]);

  const markAsRead = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, [API_URL]);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, [API_URL]);

  const clearReadNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/notifications/clear-read`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(prev => prev.filter(n => !n.isRead));
        toast.success("Read notifications cleared");
      }
    } catch (err) {
      console.error("Failed to clear read notifications:", err);
      toast.error("Failed to clear notifications");
    }
  }, [API_URL]);

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

    const token = localStorage.getItem("token");
    if (token) {
      fetchNotifications(token);
      fetchCounts(token);
    }
  }, [darkMode, fetchNotifications, fetchCounts]);

  useEffect(() => {
    const handleAuthChange = () => setAuthTrigger(prev => prev + 1);
    window.addEventListener("local-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("local-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      const user = JSON.parse(storedUser);
      userRef.current = user;
      
      fetchNotifications(token);
      fetchCounts(token);
      
      if (socket.connected) {
        socket.emit("join", user._id);
      }
      
      const handleSocketConnect = () => {
        socket.emit("join", user._id);
      };
      socket.on("connect", handleSocketConnect);
      
      const handleNewNotification = (notification) => {
        let isNew = false;
        setNotifications(prev => {
          if (prev.some(n => n?._id === notification?._id)) return prev;
          isNew = true;
          return [{ ...notification, isRead: false }, ...prev];
        });

        if (isNew) {
          setUnreadCount(prev => prev + 1);
          setShakeNotification(true);
          setTimeout(() => setShakeNotification(false), 1000);

          // 🚀 UNIVERSAL PREMIUM TOAST
          toast.custom((t) => {
            const type = notification.type;
            let theme = {
              gradient: "from-blue-500 via-purple-500 to-indigo-500",
              icon: <ShieldAlert className="w-3.5 h-3.5" />,
              label: "Notification",
              accent: "text-blue-400",
              bgAccent: "bg-blue-500/20"
            };

            if (type === "feedback") {
              theme = {
                gradient: "from-emerald-500 via-teal-500 to-cyan-500",
                icon: <MessageSquare className="w-3.5 h-3.5" />,
                label: "User Feedback",
                accent: "text-emerald-400",
                bgAccent: "bg-emerald-500/20"
              };
            } else if (type === "promotion" || type === "demotion" || type === "account_approved") {
              theme = {
                gradient: "from-purple-600 via-indigo-600 to-blue-600",
                icon: <ShieldAlert className="w-3.5 h-3.5" />,
                label: type === "account_approved" ? "Account Approved" : (type === "promotion" ? "Role Promoted" : "Role Demoted"),
                accent: "text-indigo-400",
                bgAccent: "bg-indigo-500/20"
              };
            } else if (type === "connect_request") {
              theme = {
                gradient: "from-blue-400 to-blue-600",
                icon: <UserPlus className="w-3.5 h-3.5 text-blue-400" />,
                label: "Network",
                accent: "text-blue-400",
                bgAccent: "bg-blue-500/10"
              };
            } else if (type === "group_joined" || type === "group_added") {
              theme = {
                gradient: "from-amber-400 to-orange-500",
                icon: <Users className="w-3.5 h-3.5" />,
                label: "Group",
                accent: "text-amber-400",
                bgAccent: "bg-amber-500/20"
              };
            } else if (type.includes("post") || type.includes("comment") || type.includes("like")) {
              theme = {
                gradient: "from-pink-500 to-rose-600",
                icon: <MessageSquare className="w-3.5 h-3.5" />,
                label: "Interaction",
                accent: "text-pink-400",
                bgAccent: "bg-pink-500/20"
              };
            } else if (type === "points_earned") {
              theme = {
                gradient: "from-yellow-400 via-amber-500 to-yellow-600",
                icon: <Award className="w-3.5 h-3.5" />,
                label: "Points Earning",
                accent: "text-yellow-400",
                bgAccent: "bg-yellow-500/20"
              };
            }

            return (
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
                        <Image
                          className="h-11 w-11 rounded-[0.9rem] object-cover"
                          src={notification.sender?.profilePicture || "/default-profile.jpg"}
                          alt={notification.sender?.name || "User"}
                          width={44}
                          height={44}
                        />
                      </div>
                    </div>
                    <div className="ml-4 flex-1 pr-6">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`${darkMode ? theme.bgAccent : "bg-gray-100"} p-1.5 rounded-xl`}>
                          {theme.icon}
                        </div>
                        <p className={`text-[10px] font-black ${darkMode ? theme.accent : "text-slate-600"} uppercase tracking-[0.25em]`}>
                          {theme.label}
                        </p>
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
                    onClick={() => {
                      toast.dismiss(t.id);
                      window.location.href = "/dashboard/notifications";
                    }}
                    className={`z-10 w-full py-4 rounded-2xl bg-gradient-to-r ${theme.gradient} text-white text-[11px] font-black uppercase tracking-[0.25em] transition-all hover:brightness-110 active:scale-95 shadow-xl`}
                  >
                    View in Dashboard
                  </button>
                </div>
              </motion.div>
            );
          }, { duration: 6000 });
        }
      };

      const handleNewPost = () => setNewPostsCount(prev => prev + 1);
      const handleNewGroupMessage = () => setUnreadGroupMessagesCount(prev => prev + 1);
      const handleNewSignupRequest = (notification) => {
        setAdminSignupRequestsCount(prev => prev + 1);
        
        // 🚀 SHOW TOAST FOR NEW SIGNUP (For Admins)
        toast.custom((t) => (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-2xl pointer-events-auto`}
            >
              <div className={`px-5 py-3 rounded-[calc(1rem-2px)] flex items-center gap-4 ${darkMode ? 'bg-black' : 'bg-white'}`}>
                <div className={`p-2 rounded-xl bg-blue-500/10 text-blue-500`}>
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest text-blue-500 mb-0.5`}>New Signup Request</p>
                  <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {notification.name || "A new user"} (<span className="capitalize">{notification.role}</span>)
                  </p>
                </div>
                <button 
                  onClick={() => {
                    toast.dismiss(t.id);
                    window.location.href = "/dashboard/admin";
                  }}
                  className="p-2 ml-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold text-xs"
                >
                  Review
                </button>
              </div>
            </motion.div>
        ));
      };

      const handlePointsUpdated = (data) => {
        const { awardedPoints, reason } = data;
        
        if (reason === "Daily Login Reward") {
          handleDailyLoginPoints(awardedPoints);
        } else {
          toast.success(
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <span className="font-black text-yellow-400">Points Awarded!</span>
              </div>
              <div className="text-xs font-bold text-gray-300">
                You earned <span className="text-blue-400">+{awardedPoints}</span> points
              </div>
              <div className="text-[10px] uppercase tracking-widest opacity-50 font-black">
                {reason || "Activity Reward"}
              </div>
            </div>,
            {
              duration: 5000,
              icon: null,
              style: {
                background: "#1e293b",
                border: "1px solid #334155",
                padding: "16px",
                color: "#fff",
                borderRadius: "20px"
              }
            }
          );
        }
        
        const token = localStorage.getItem("token");
        if (token) fetchCounts(token);
      };

      const handleLiveNotification = (notification) => {
        if (!notification) return;
        let isNew = false;
        setNotifications(prev => {
          if (prev.some(n => n?._id === notification?._id)) return prev;
          isNew = true;
          return [{ ...notification, isRead: false }, ...prev];
        });
        
        if (isNew) {
          setUnreadCount(prev => prev + 1);
          setShakeNotification(true);
          setTimeout(() => setShakeNotification(false), 1000);
        }
      };

      const handleForceLogout = () => {
        console.warn("🔐 Account deleted by admin. Forcing logout...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Use window.location for a hard reset of all states
        window.location.href = "/auth/login?reason=deleted";
      };

      socket.on("newNotification", handleNewNotification);
      socket.on("liveNotification", handleLiveNotification);
      socket.on("newPost", handleNewPost);
      socket.on("receiveGroupMessage", handleNewGroupMessage);
      socket.on("newSignupRequest", handleNewSignupRequest);
      socket.on("pointsUpdated", handlePointsUpdated);
      socket.on("forceLogout", handleForceLogout);

      return () => {
        socket.off("connect", handleSocketConnect);
        socket.off("newNotification", handleNewNotification);
        socket.off("liveNotification", handleLiveNotification);
        socket.off("newPost", handleNewPost);
        socket.off("receiveGroupMessage", handleNewGroupMessage);
        socket.off("newSignupRequest", handleNewSignupRequest);
        socket.off("pointsUpdated", handlePointsUpdated);
        socket.off("forceLogout", handleForceLogout);
      };
    } else {
      // ✅ Explicitly clear state if no user/token found (Log out happened)
      setNotifications([]);
      setUnreadCount(0);
      setPendingRequestsCount(0);
      setUnreadGroupMessagesCount(0);
      setNewPostsCount(0);
      setAdminSignupRequestsCount(0);
      userRef.current = null;
    }
  }, [fetchNotifications, fetchCounts, authTrigger, darkMode]);

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
    handleDailyLoginPoints, // Exported for direct triggering from API responses
    refreshNotifications: () => {
        const token = localStorage.getItem("token");
        if (token) fetchNotifications(token);
    },
    refreshCounts: () => {
        const token = localStorage.getItem("token");
        if (token) fetchCounts(token);
    }
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
