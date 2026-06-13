"use client";
import React, { useEffect, useState } from "react";
import { Award, Target, Zap, Heart, MessageSquare, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import socket from "@/utils/socket";
import { getGamificationTier } from "@/utils/gamification";

const PointsScenario = ({ darkMode = false, user = null }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFlipped, setIsFlipped] = useState(false);

    const fetchConfig = React.useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin-points-mgmt/config`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setConfig(data);
        } catch (err) {
            console.error("Points Config Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
        
        const handlePointsConfig = () => fetchConfig();
        const handleNewNotification = (notif) => {
            if (notif.type === "points_earned") fetchConfig();
        };

        socket.on("pointsConfigUpdated", handlePointsConfig);
        socket.on("newNotification", handleNewNotification);

        return () => {
            socket.off("pointsConfigUpdated", handlePointsConfig);
            socket.off("newNotification", handleNewNotification);
        };
    }, [fetchConfig]);

    // Auto-flip every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIsFlipped(prev => !prev);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} h-[450px] p-6 rounded-[2rem] animate-pulse flex flex-col justify-between`}>
            <div className={`h-8 ${darkMode ? "bg-[#FAFAFA]/5" : "bg-gray-100"} rounded w-3/4 mb-4`}></div>
            <div className="space-y-4">
               {[1,2,3,4].map(i => <div key={i} className={`h-14 ${darkMode ? "bg-[#FAFAFA]/5" : "bg-gray-50"} rounded-2xl`}></div>)}
            </div>
        </div>
    );

    if (!config) return null;

    const scenarios = [
        { 
            label: "Profile", 
            value: config.profileCompletionPoints || 50, 
            icon: <Target className="w-4 h-4 text-blue-400" />, 
            desc: "Complete your details",
            completed: config.userStatus?.isProfileComplete 
        },
        { 
            label: "Connect", 
            value: config.connectionPoints || 10, 
            icon: <Zap className="w-4 h-4 text-amber-500" />, 
            desc: "Grow your network",
            completed: false
        },
        { 
            label: `Post (Max ${config.postLimitCount || 3}/${config.postLimitDays === 7 ? "Week" : (config.postLimitDays || 7) + "D"})`, 
            value: config.postPoints || 10, 
            icon: <Award className="w-4 h-4 text-purple-600" />, 
            desc: `Share content`,
            completed: config.userStatus?.isPostLimitReached
        },
        { 
            label: `Like (Max ${config.likeLimitCount || 10}/${config.likeLimitDays === 1 ? "Day" : (config.likeLimitDays || 1) + "D"})`, 
            value: config.likePoints || 2, 
            icon: <Heart className="w-4 h-4 text-pink-500" />, 
            desc: "React to others" ,
            completed: config.userStatus?.isLikeLimitReached
        },
        { 
            label: `Comment (Max ${config.commentLimitCount || 5}/${config.commentLimitDays === 1 ? "Day" : (config.commentLimitDays || 1) + "D"})`, 
            value: config.commentPoints || 3, 
            icon: <MessageSquare className="w-4 h-4 text-green-400" />, 
            desc: "Join discussion",
            completed: config.userStatus?.isCommentLimitReached
        },
    ];

    return (
        <div className="relative w-full h-[470px] group" style={{ perspective: "1200px" }}>
            <motion.div 
                className="w-full h-full relative"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* FRONT FACE: Points Guide */}
                <div 
                    className="absolute inset-0 w-full h-full rounded-[2.5rem] p-[2.5px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl cursor-pointer"
                    style={{ backfaceVisibility: "hidden" }}
                    onClick={() => setIsFlipped(true)}
                >
                    <div className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} w-full h-full rounded-[calc(2.5rem-2.5px)] p-4 md:p-5 flex flex-col`}>
                        <div className="flex justify-between items-center mb-4 pl-1">
                            <div>
                                <h3 className={`text-lg font-black ${darkMode ? "text-white" : "text-black"} tracking-tight flex items-center gap-2`}>
                                    🎖️ How to Earn
                                </h3>
                                <p className={`text-[9px] ${darkMode ? "text-gray-400" : "text-gray-500"} font-black uppercase tracking-[0.2em] mt-0.5`}>
                                    Points System
                                </p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }} className={`p-2.5 rounded-full ${darkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"} transition-colors shadow-sm`} title="Flip to Ranking Tiers">
                                <Award className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                            {scenarios.map((item, idx) => (
                                <div key={idx} className="p-[1px] bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                    <div className={`flex items-center justify-between py-2.5 px-3 ${darkMode ? "bg-[#1e293b]" : "bg-white"} rounded-[15px] group/item transition-all h-full`}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-[1px] bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl shrink-0">
                                                <div className={`p-1.5 ${darkMode ? "bg-black" : "bg-gray-50"} rounded-[calc(0.75rem-1px)] group-hover/item:scale-110 transition-transform shadow-sm`}>
                                                    {item.icon}
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-[11px] font-black ${darkMode ? "text-white" : "text-slate-900"} leading-tight tracking-tight truncate`}>{item.label}</p>
                                                <p className={`text-[9px] ${darkMode ? "text-gray-300" : "text-slate-500"} font-bold mt-0.5 truncate`}>{item.desc}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-2 shrink-0">
                                            {item.completed && (
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg flex items-center justify-center animate-in zoom-in">
                                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                            <div className={`transition-opacity duration-300 ${item.completed ? "opacity-40" : "opacity-100"}`}>
                                                <span className={`text-xs font-black ${darkMode ? "text-white" : "text-black"}`}>+{item.value}</span>
                                                <p className={`text-[8px] ${darkMode ? "text-gray-500" : "text-gray-400"} font-black uppercase`}>pts</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 text-center opacity-40 text-[9px] font-black uppercase tracking-widest text-blue-500 animate-pulse">
                            Click to flip 🔄
                        </div>
                    </div>
                </div>

                {/* BACK FACE: Gamification Tiers */}
                <div 
                    className="absolute inset-0 w-full h-full rounded-[2.5rem] p-[2.5px] bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 shadow-2xl cursor-pointer"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    onClick={() => setIsFlipped(false)}
                >
                    <div className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} w-full h-full rounded-[calc(2.5rem-2.5px)] p-4 md:p-5 flex flex-col`}>
                        <div className="flex justify-between items-center mb-6 pl-1">
                            <div>
                                <h3 className={`text-lg font-black ${darkMode ? "text-white" : "text-black"} tracking-tight flex items-center gap-2`}>
                                    🏆 Ranking Tiers
                                </h3>
                                <p className={`text-[9px] ${darkMode ? "text-gray-400" : "text-gray-500"} font-black uppercase tracking-[0.2em] mt-0.5`}>
                                    Unlock Badges
                                </p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }} className={`p-2.5 rounded-full ${darkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"} transition-colors shadow-sm`} title="Flip to Points Guide">
                                <Zap className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col justify-between gap-1 overflow-y-auto custom-scrollbar pr-1 pb-2 mt-1">
                            {(() => {
                                const activeTier = user ? getGamificationTier(user.points?.total || 0).name : null;
                                
                                const tiers = [
                                    { name: "Bronze", points: "0 - 499 Points", icon: "🥉", styleDark: "bg-amber-600/10 border-amber-500/30", styleLight: "bg-amber-50 border-amber-300", titleCol: "text-amber-600", descDark: "text-amber-200/80", descLight: "text-amber-800/80" },
                                    { name: "Silver", points: "500 - 999 Points", icon: "🥈", styleDark: "bg-gray-500/10 border-gray-400/30", styleLight: "bg-gray-100 border-gray-400", titleCol: "text-gray-500 dark:text-gray-300", descDark: "text-gray-300/80", descLight: "text-gray-700/80" },
                                    { name: "Gold", points: "1000 - 1999 Points", icon: "🥇", styleDark: "bg-yellow-500/10 border-yellow-500/30", styleLight: "bg-yellow-50 border-yellow-400 shadow-[inset_0_0_10px_rgba(250,204,21,0.1)]", titleCol: "text-yellow-600 dark:text-yellow-400", descDark: "text-yellow-200/80", descLight: "text-yellow-800/80" },
                                    { name: "Platinum", points: "2000 - 3499 Points", icon: "✨", styleDark: "bg-slate-400/10 border-slate-400/30", styleLight: "bg-slate-100 border-slate-400", titleCol: "text-slate-600 dark:text-slate-300", descDark: "text-slate-300/80", descLight: "text-slate-700/80" },
                                    { name: "Diamond", points: "3500 - 4999 Points", icon: "💎", styleDark: "bg-cyan-400/10 border-cyan-400/30 shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]", styleLight: "bg-cyan-50 border-cyan-300 shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]", titleCol: "text-cyan-600 dark:text-cyan-400", descDark: "text-cyan-200/80", descLight: "text-cyan-800/80" },
                                    { name: "Hall of Fame", points: "5000+ Points", icon: "👑", styleDark: "bg-gradient-to-r from-yellow-400/10 via-red-500/10 to-pink-500/10 border-yellow-400/40 shadow-[inset_0_0_15px_rgba(234,179,8,0.15)]", styleLight: "bg-gradient-to-r from-yellow-50 via-red-50 to-pink-50 border-yellow-400 shadow-[inset_0_0_15px_rgba(234,179,8,0.15)]", titleCol: "text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-pink-500", descDark: "text-orange-200/80", descLight: "text-orange-800/80" }
                                ];

                                return tiers.map((t, i) => {
                                    const isActive = activeTier === t.name;
                                    return (
                                        <div key={i} className={`flex items-center gap-2.5 py-[3px] px-3 rounded-xl border ${darkMode ? t.styleDark : t.styleLight} ${isActive ? 'scale-[1.02] shadow-md ring-1 ring-current' : ''} transition-all`}>
                                            <div className="text-xl drop-shadow-md shrink-0">{t.icon}</div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-black text-sm ${t.titleCol} truncate`}>{t.name}</h4>
                                                <p className={`text-[8px] font-bold uppercase tracking-widest ${darkMode ? t.descDark : t.descLight}`}>{t.points}</p>
                                            </div>
                                            {isActive && (
                                                <div className="shrink-0 text-green-500 dark:text-green-400 animate-pulse">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                        
                        <div className="mt-3 text-center opacity-40 text-[9px] font-black uppercase tracking-widest text-orange-500 animate-pulse">
                            Click to flip 🔄
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PointsScenario;
