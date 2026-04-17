"use client";
import React, { useEffect, useState } from "react";
import { Award, Target, Zap, Heart, MessageSquare, CheckCircle2 } from "lucide-react";
import socket from "@/utils/socket";

const PointsScenario = ({ darkMode = false }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

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
        
        const handlePointsConfig = () => {
            fetchConfig();
        };

        const handleNewNotification = (notif) => {
            if (notif.type === "points_earned") {
                fetchConfig();
            }
        };

        // Live updates for admin config changes
        socket.on("pointsConfigUpdated", handlePointsConfig);

        // Live updates for personal point achievements
        socket.on("newNotification", handleNewNotification);

        return () => {
            socket.off("pointsConfigUpdated", handlePointsConfig);
            socket.off("newNotification", handleNewNotification);
        };
    }, [fetchConfig]);

    if (loading) return (
        <div className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} p-6 rounded-[2rem] animate-pulse space-y-4`}>
            <div className={`h-4 ${darkMode ? "bg-[#FAFAFA]/5" : "bg-gray-100"} rounded w-3/4`}></div>
            <div className={`h-20 ${darkMode ? "bg-[#FAFAFA]/5" : "bg-gray-50"} rounded-2xl`}></div>
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
            completed: false // Not tracked via frequency limit logs yet
        },
        { 
            label: `Post (Max ${config.postLimitCount || 3}/${config.postLimitDays === 7 ? "Week" : (config.postLimitDays || 7) + " Days"})`, 
            value: config.postPoints || 10, 
            icon: <Award className="w-4 h-4 text-purple-600" />, 
            desc: `Every ${config.postLimitDays || 7} days`,
            completed: config.userStatus?.isPostLimitReached
        },
        { 
            label: `Like (Max ${config.likeLimitCount || 10}/${config.likeLimitDays === 1 ? "Day" : (config.likeLimitDays || 1) + " Days"})`, 
            value: config.likePoints || 2, 
            icon: <Heart className="w-4 h-4 text-pink-500" />, 
            desc: "React to others" ,
            completed: config.userStatus?.isLikeLimitReached
        },
        { 
            label: `Comment (Max ${config.commentLimitCount || 5}/${config.commentLimitDays === 1 ? "Day" : (config.commentLimitDays || 1) + " Days"})`, 
            value: config.commentPoints || 3, 
            icon: <MessageSquare className="w-4 h-4 text-green-400" />, 
            desc: "Engage in discussion",
            completed: config.userStatus?.isCommentLimitReached
        },
    ];

    return (
        <div className="p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 rounded-[2rem] shadow-2xl relative overflow-hidden group transition-all duration-500">
            <div className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} p-3 md:p-4 rounded-[calc(2rem-2.5px)] min-h-[360px] flex flex-col justify-between relative`}>
                <div>
                    <div className="mb-2">
                        <h3 className={`text-lg font-black ${darkMode ? "text-white" : "text-black"} tracking-tight flex items-center gap-2`}>
                            🎖️ Points System
                        </h3>
                        <p className={`text-[10px] ${darkMode ? "text-white" : "text-black"} font-black uppercase tracking-[0.2em] mt-1 opacity-100`}>
                            Earn &amp; Rank Up
                        </p>
                    </div>

                    <div className="space-y-2">
                        {scenarios.map((item, idx) => (
                            <div key={idx} className="p-[1px] bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                <div className={`flex items-center justify-between py-2 px-3 ${darkMode ? "bg-[#1e293b]" : "bg-white"} rounded-[15px] group/item transition-all`}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-[1.5px] bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl">
                                            <div className={`p-1.5 ${darkMode ? "bg-black" : "bg-gray-50"} rounded-[calc(0.75rem-1.5px)] group-hover/item:scale-110 transition-transform shadow-sm`}>
                                                {item.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <p className={`text-[11px] font-black ${darkMode ? "text-white" : "text-slate-900"} leading-tight tracking-tight`}>{item.label}</p>
                                            <p className={`text-[9px] ${darkMode ? "text-gray-300" : "text-slate-600"} font-bold leading-tight mt-0.5`}>{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        {item.completed && (
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/20 animate-in zoom-in duration-300">
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                        <div className={`transition-opacity duration-300 ${item.completed ? "opacity-40" : "opacity-100"}`}>
                                            <span className={`text-sm font-black ${darkMode ? "text-white" : "text-black"}`}>+{item.value}</span>
                                            <p className={`text-[9px] ${darkMode ? "text-gray-500" : "text-gray-400"} font-black uppercase tracking-tighter`}>pts</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`mt-4 pt-4 ${darkMode ? "border-white/10" : "border-gray-200"} border-t text-center`}>
                    <p className={`text-[10px] ${darkMode ? "text-white" : "text-black"} font-extrabold italic leading-relaxed opacity-80`}>
                        &quot;Consistent engagement leads to higher ranking!&quot;
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PointsScenario;
