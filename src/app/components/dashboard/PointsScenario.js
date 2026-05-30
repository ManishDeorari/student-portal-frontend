"use client";
import React, { useEffect, useState, useRef } from "react";
import { Award, Target, Zap, Heart, MessageSquare, CheckCircle2 } from "lucide-react";

const PointsScenario = ({ darkMode = false }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef(null);

    const fetchConfig = React.useCallback(async () => {
        try {
            const { supabase } = await import("@/services/database/client");
            const user = JSON.parse(localStorage.getItem("user") || "null");
            const userId = user?.profile_id || user?._id;

            // Fetch points config
            const { data: cfg } = await supabase
                .from("points_config")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!cfg) { setLoading(false); return; }

            // Fetch user status (point log limits)
            const { data: logs } = await supabase
                .from("point_log")
                .select("reason, created_at")
                .eq("profile_id", userId);

            const now = new Date();
            const dayAgo = new Date(now - 86400000);
            const weekAgo = new Date(now - 7 * 86400000);

            const recentPosts = (logs || []).filter(l => l.reason === "post" && new Date(l.created_at) > weekAgo).length;
            const recentLikes = (logs || []).filter(l => l.reason === "like" && new Date(l.created_at) > dayAgo).length;
            const recentComments = (logs || []).filter(l => l.reason === "comment" && new Date(l.created_at) > dayAgo).length;

            setConfig({
                ...cfg,
                userStatus: {
                    isPostLimitReached: recentPosts >= (cfg.post_limit_count || 3),
                    isLikeLimitReached: recentLikes >= (cfg.like_limit_count || 10),
                    isCommentLimitReached: recentComments >= (cfg.comment_limit_count || 5),
                    isProfileComplete: !!(user?.bio && user?.course),
                },
                // Normalize field names
                profileCompletionPoints: cfg.profile_completion_points,
                connectionPoints: cfg.connection_points,
                postPoints: cfg.post_points,
                postLimitCount: cfg.post_limit_count,
                postLimitDays: cfg.post_limit_days,
                likePoints: cfg.like_points,
                likeLimitCount: cfg.like_limit_count,
                likeLimitDays: cfg.like_limit_days,
                commentPoints: cfg.comment_points,
                commentLimitCount: cfg.comment_limit_count,
                commentLimitDays: cfg.comment_limit_days,
            });
        } catch (err) {
            console.error("Points Config Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();

        // Subscribe to point_log inserts for this user (live status update)
        const setupRealtime = async () => {
            const { supabase } = await import("@/services/database/client");
            const user = JSON.parse(localStorage.getItem("user") || "null");
            const userId = user?.profile_id || user?._id;
            if (!userId) return;

            if (channelRef.current) await supabase.removeChannel(channelRef.current);

            const channel = supabase
                .channel(`points-scenario-${userId}`)
                .on("postgres_changes", { event: "INSERT", schema: "public", table: "point_log", filter: `profile_id=eq.${userId}` }, () => fetchConfig())
                .on("postgres_changes", { event: "*", schema: "public", table: "points_config" }, () => fetchConfig())
                .subscribe();

            channelRef.current = channel;
        };

        setupRealtime();

        return () => {
            if (channelRef.current) {
                import("@/services/database/client").then(({ supabase }) => {
                    supabase.removeChannel(channelRef.current);
                    channelRef.current = null;
                });
            }
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
            <div className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} p-4 md:p-5 rounded-[calc(2rem-2.5px)] min-h-[400px] flex flex-col justify-between relative`}>
                <div>
                    <div className="mb-2">
                        <h3 className={`text-xl font-black ${darkMode ? "text-white" : "text-black"} tracking-tight flex items-center gap-2.5`}>
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

                <div className={`mt-6 pt-6 ${darkMode ? "border-white/10" : "border-gray-200"} border-t text-center`}>
                    <p className={`text-[10px] ${darkMode ? "text-white" : "text-black"} font-extrabold italic leading-relaxed opacity-80`}>
                        &quot;Consistent engagement leads to higher ranking!&quot;
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PointsScenario;
