"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, MessageSquare, UserPlus, Eye, ShieldAlert, Bell, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const getNotificationIcon = (type, darkMode) => {
    const iconClass = "w-3 h-3";
    const { Award } = require("lucide-react");
    switch (type) {
        case "post_like":
        case "post_comment":
        case "comment_like":
        case "comment_reply":
        case "reply_like":
        case "comment_reaction":
        case "reply_reaction":
            return <MessageSquare className={`${iconClass} ${darkMode ? "text-blue-400" : "text-blue-600"}`} />;
        case "connect_request":
        case "connect_accept":
        case "connect_reject":
            return <UserPlus className={`${iconClass} ${darkMode ? "text-green-400" : "text-green-600"}`} />;
        case "profile_visit":
            return <Eye className={`${iconClass} ${darkMode ? "text-purple-400" : "text-purple-600"}`} />;
        case "admin_notice":
            return <ShieldAlert className={`${iconClass} ${darkMode ? "text-red-400" : "text-red-600"}`} />;
        case "points_earned":
            return <Award className={`${iconClass} ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} />;
        default:
            return <Bell className={`${iconClass} ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} />;
    }
};

export default function NotificationPreview({ notifications = [], darkMode }) {
    // Helper to check if a notification is unread
    const isNoteUnread = (note) => {
        return note.isRead === false || note.isRead === "false" || note.isRead === 0;
    };

    // Get the absolute latest 5 notifications (sorted by date)
    const latestNotifications = [...notifications]
        .filter(isNoteUnread)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return (
        <div className="absolute top-full right-0 mt-4 w-[22rem] p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2.2rem] shadow-2xl z-[200]">
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                className={`w-full rounded-[calc(2.2rem-2.5px)] overflow-hidden ${darkMode ? "bg-black" : "bg-white"} flex flex-col`}
            >
                {/* Hover Bridge */}
                <div className="absolute -top-6 left-0 w-full h-6 bg-transparent cursor-default" />

                <div className={`px-8 py-5 border-b flex items-center justify-between ${darkMode ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"}`}>
                    <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] ${darkMode ? "text-white" : "text-slate-900"}`}>
                        Notification Center
                    </h3>
                    {latestNotifications.some(n => isNoteUnread(n)) && (
                        <span className="px-3 py-1 rounded-full bg-blue-600 text-[10px] font-black text-white uppercase tracking-wider animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                            Live Update
                        </span>
                    )}
                </div>

                <div className="h-[384px] overflow-y-auto custom-scrollbar p-4 space-y-3">
                    <AnimatePresence initial={false}>
                        {latestNotifications.length > 0 ? (
                            latestNotifications.map((note) => {
                                const unread = isNoteUnread(note);
                                const isPenalty = note.message?.startsWith("MANUAL_PENALTY::");

                                return (
                                    <motion.div
                                        key={note._id || Math.random()}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="relative p-[1.5px] bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-2xl group transition-all duration-500 hover:from-blue-500 hover:to-pink-500"
                                    >
                                        <Link
                                            href="/dashboard/notifications"
                                            className={`flex gap-3 p-3 rounded-[calc(1rem-1.5px)] transition-all duration-300 ${darkMode ? "bg-slate-950/80 text-white" : "bg-white text-slate-900 shadow-sm"
                                                }`}
                                        >
                                            <div className="flex-shrink-0 relative">
                                                <div className={`p-0.5 rounded-xl border-2 transition-all duration-300 ${unread
                                                    ? (isPenalty ? "border-red-500 shadow-lg shadow-red-500/40" : "border-blue-500 shadow-lg shadow-blue-500/40")
                                                    : "border-transparent opacity-80"
                                                    }`}>
                                                    <Image
                                                        src={note.sender?.profilePicture || "/default-profile.jpg"}
                                                        alt={note.sender?.name || "User"}
                                                        width={40}
                                                        height={40}
                                                        className="w-10 h-10 rounded-[0.7rem] object-cover"
                                                    />
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 ${darkMode ? "bg-slate-900 border-slate-950" : "bg-white border-gray-100"} shadow-md`}>
                                                    {isPenalty ? <ShieldAlert className={`w-3 h-3 ${darkMode ? "text-red-400" : "text-red-600"}`} /> : getNotificationIcon(note.type, darkMode)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[13px] leading-[1.5] ${darkMode ? "text-white" : "text-slate-900"}`}>
                                                    <span className={`font-black uppercase tracking-tight ${unread && !darkMode ? (isPenalty ? "text-red-600" : "text-blue-600") : ""}`}>
                                                        {note.type === "points_earned" ? (isPenalty ? "Moderator" : "System") : (note.sender?.name || (typeof note.sender === "string" ? "User" : "System"))}
                                                    </span>{" "}
                                                    <span className={`font-medium ${unread ? "opacity-100" : "opacity-60"}`}>
                                                        {note.message?.startsWith("MANUAL_AWARD::") ? (() => {
                                                            const parts = note.message.split("::");
                                                            const msg = parts[1] || "Points Awarded";
                                                            const pts = parts[3] || "0";
                                                            const cat = (parts[2] || "Other").replace(/([A-Z])/g, ' $1').trim();
                                                            return `${msg} +${pts} PTS`;
                                                        })() : note.message?.startsWith("MANUAL_PENALTY::") ? (() => {
                                                            const parts = note.message.split("::");
                                                            const msg = parts[1] || "Points Deducted";
                                                            const pts = parts[3] || "0";
                                                            return `${msg} -${pts} PTS`;
                                                        })() : note.type === "points_earned" ? (() => {
                                                            let msg = note.message;
                                                            let pts = "10";
                                                            let cat = "Reward";

                                                            const match = note.message?.match(/\+?(\d+)\s*(?:PTS|pts|points|Points)/i);
                                                            if (match) {
                                                                pts = match[1];
                                                                msg = note.message.replace(match[0], '').trim() || "Points Earned";
                                                            }

                                                            const lowerMsg = msg?.toLowerCase() || "";
                                                            if (lowerMsg.includes("post")) cat = "Post";
                                                            else if (lowerMsg.includes("like")) cat = "Like";
                                                            else if (lowerMsg.includes("comment")) cat = "Comment";
                                                            else if (lowerMsg.includes("network") || lowerMsg.includes("connect")) cat = "Network";
                                                            else if (lowerMsg.includes("login") || lowerMsg.includes("daily")) cat = "Login";
                                                            else if (lowerMsg.includes("announcement") || lowerMsg.includes("announce") || lowerMsg.includes("earned") || lowerMsg.includes("first")) cat = "Student Participation";

                                                            return `${msg} +${pts} PTS`;
                                                        })() : note.message}
                                                    </span>
                                                </p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg ${darkMode ? "bg-white/5" : "bg-slate-100"}`}>
                                                        <Clock className={`w-3 h-3 ${darkMode ? "text-white/40" : "text-slate-400"}`} />
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-white/40" : "text-slate-500"}`}>
                                                            {note.createdAt ? new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                                                        </span>
                                                    </div>
                                                    {unread && (
                                                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`self-center transition-all ${unread ? "opacity-100" : "opacity-0 group-hover:opacity-100"} translate-x-1 group-hover:translate-x-0`}>
                                                <ChevronRight className={`w-5 h-5 ${unread ? "text-blue-500" : (darkMode ? "text-white/30" : "text-slate-300")}`} />
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="relative p-[1.5px] bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-[2rem] overflow-hidden">
                                <div className={`p-12 text-center group rounded-[calc(2rem-1.5px)] ${darkMode ? "bg-slate-950/50" : "bg-slate-50"}`}>
                                    <div className="mb-6 flex justify-center opacity-10 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700">
                                        <Bell className={`w-16 h-16 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${darkMode ? "text-white/40" : "text-slate-400"}`}>
                                        Inbox Zero ✨
                                    </p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                <Link
                    href="/dashboard/notifications"
                    className={`block text-center py-6 text-[11px] font-black uppercase tracking-[0.4em] border-t transition-all ${darkMode
                        ? "bg-white/5 border-white/10 text-blue-400 hover:bg-white/10 hover:text-blue-300"
                        : "bg-slate-50 border-gray-100 text-blue-700 hover:bg-slate-100 hover:text-blue-800"
                        }`}
                >
                    Enter Center
                </Link>
            </motion.div>
        </div>
    );
}
