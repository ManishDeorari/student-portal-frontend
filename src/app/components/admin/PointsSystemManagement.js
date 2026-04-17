"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import PointsRequestsList from "./PointsRequestsList";
import UserSearchInput from "../Post/utils/UserSearchInput";

const getApiUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return url.endsWith("/") ? url.slice(0, -1) : url;
};
const API = getApiUrl();

export default function PointsSystemManagement({ user }) {
    const { darkMode } = useTheme();
    const [config, setConfig] = useState({
        profileCompletionPoints: 50,
        connectionPoints: 10,
        postPoints: 10,
        likePoints: 2,
        commentPoints: 3,
        postLimitCount: 3,
        postLimitDays: 7,
        likeLimitCount: 10,
        likeLimitDays: 1,
        commentLimitCount: 5,
        commentLimitDays: 1,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Manual Award State
    const [search, setSearch] = useState("");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [category, setCategory] = useState("other");
    const [awarding, setAwarding] = useState(false);

    // Manual Penalty State
    const [penaltySearch, setPenaltySearch] = useState("");
    const [penaltyAmount, setPenaltyAmount] = useState("");
    const [penaltyMessage, setPenaltyMessage] = useState("");
    const [penalizing, setPenalizing] = useState(false);

    const CATEGORY_LABELS = {
        profileCompletion: "Profile Completion",
        studentEngagement: "Student Engagement",
        referrals: "Referrals",
        contentContribution: "Content Contribution",
        campusEngagement: "Campus Engagement",
        innovationSupport: "Innovation Support",
        studentParticipation: "Student Participation",
        connections: "Networking",
        posts: "Posts",
        comments: "Comments",
        likes: "Reactions",
        replies: "Replies",
        other: "Other Activities",
    };

    const getToken = React.useCallback(() => localStorage.getItem("token"), []);

    const fetchConfig = React.useCallback(async () => {
        try {
            const res = await fetch(`${API}/api/admin-points-mgmt/config`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) {
                const text = await res.text();
                console.error("Fetch Config Error:", text);
                throw new Error(`Server returned ${res.status}`);
            }
            const data = await res.json();
            setConfig(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load points configuration");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const handleUpdateConfig = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/admin-points-mgmt/config`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(config),
            });
            if (res.ok) {
                toast.success("Configuration updated successfully!");
            } else {
                const data = await res.json();
                throw new Error(data.message || "Update failed");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleManualAward = async (e) => {
        e.preventDefault();
        if (!search || !amount) return toast.error("Please fill search and amount");
        setAwarding(true);
        try {
            const res = await fetch(`${API}/api/admin-points-mgmt/manual-award`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ search, amount: Number(amount), message, category }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Awarded ${amount} points to ${data.user.name}`);
                setSearch("");
                setAmount("");
                setMessage("");
                setCategory("other");
            } else {
                throw new Error(data.message || "Awarding failed");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setAwarding(false);
        }
    };

    const handleManualPenalty = async (e) => {
        e.preventDefault();
        if (!penaltySearch || !penaltyAmount) return toast.error("Please fill search and amount");
        setPenalizing(true);
        try {
            const res = await fetch(`${API}/api/admin-points-mgmt/manual-penalty`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ search: penaltySearch, amount: Number(penaltyAmount), message: penaltyMessage }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Deducted ${penaltyAmount} points from ${data.user.name}`);
                setPenaltySearch("");
                setPenaltyAmount("");
                setPenaltyMessage("");
            } else {
                throw new Error(data.message || "Penalty failed");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setPenalizing(false);
        }
    };

    const triggerRollover = async () => {
        if (!window.confirm("ARE YOU SURE? This will reset all current points and logs for ALL student!")) return;
        try {
            const res = await fetch(`${API}/api/admin-points-mgmt/trigger-rollover`, {
                method: "POST",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) {
                toast.success("Rollover executed successfully!");
            } else {
                const data = await res.json();
                throw new Error(data.message || "Rollover failed");
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const triggerSync = async () => {
        if (!window.confirm("This will recalculate all users' points and assign discrepancies to 'Other'. Continue?")) return;
        try {
            const res = await fetch(`${API}/api/admin-points-mgmt/sync-points`, {
                method: "POST",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
            } else {
                throw new Error(data.message || "Sync failed");
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className={`${darkMode ? "text-blue-300" : "text-slate-900"} font-black uppercase tracking-widest text-xs`}>Loading config...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Section 1: Points Requests - Now handled as two separate cards inside the component */}
            <PointsRequestsList darkMode={darkMode} user={user} />

            {/* Separator */}
            <div className={`h-[2px] w-full bg-gradient-to-r from-transparent ${darkMode ? "via-white/10" : "via-slate-200"} to-transparent`} />
            {/* Settings Section */}
            <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500">
                <section className={`${darkMode ? "bg-black" : "bg-[#FAFAFA]"} p-4 sm:p-10 rounded-[calc(2.5rem-2px)] relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
                    <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3">
                        <span className="p-3 bg-blue-600/20 rounded-2xl text-blue-400">⚙️</span>
                        <span className={darkMode ? "text-white" : "text-slate-900"}>Global System Config</span>
                    </h2>
                    <form onSubmit={handleUpdateConfig} className="space-y-6 sm:space-y-10">
                        {/* Row 1: Reward Points */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                            {[
                                { label: "Post Creation Points", key: "postPoints" },
                                { label: "Post Likes Points", key: "likePoints" },
                                { label: "Post Comments Points", key: "commentPoints" },
                            ].map((item) => (
                                <div key={item.key} className="space-y-3">
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"} ml-1`}>
                                        {item.label}
                                    </label>
                                    <div className="relative group/input p-[2px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl shadow-sm">
                                        <input
                                            type="number"
                                            value={config[item.key] ?? ""}
                                            onChange={(e) => setConfig({ ...config, [item.key]: e.target.value === "" ? "" : parseInt(e.target.value) })}
                                            onWheel={(e) => e.target.blur()}
                                            className={`w-full ${darkMode ? "bg-black text-white" : "bg-white text-black border border-gray-100"} rounded-[calc(1rem-2px)] px-4 sm:px-5 py-3 sm:py-4 focus:ring-2 focus:ring-blue-400 outline-none transition-all font-bold shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Row 2: Frequency Limits */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                            {[
                                { label: "Post Frequency Limit", key: "postLimitCount", sub: "Max posts" },
                                { label: "Like Frequency Limit", key: "likeLimitCount", sub: "Max likes" },
                                { label: "Comment Frequency Limit", key: "commentLimitCount", sub: "Max comments" },
                            ].map((item) => (
                                <div key={item.key} className="space-y-3">
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"} ml-1`}>
                                        {item.label}
                                    </label>
                                    <div className="relative group/input p-[2px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl shadow-sm">
                                        <input
                                            type="number"
                                            value={config[item.key] ?? ""}
                                            onChange={(e) => setConfig({ ...config, [item.key]: e.target.value === "" ? "" : parseInt(e.target.value) })}
                                            onWheel={(e) => e.target.blur()}
                                            className={`w-full ${darkMode ? "bg-black text-white" : "bg-white text-black border border-gray-100"} rounded-[calc(1rem-2px)] px-5 py-4 focus:ring-2 focus:ring-blue-400 outline-none transition-all font-bold shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                        />
                                        {item.sub && <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black ${darkMode ? "text-blue-400" : "text-blue-600"} uppercase pointer-events-none`}>{item.sub}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Row 3: Rolling Windows */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                            {[
                                { label: "Post Window (Days)", key: "postLimitDays", sub: "Rolling days" },
                                { label: "Like Window (Days)", key: "likeLimitDays", sub: "Rolling days" },
                                { label: "Comment Window (Days)", key: "commentLimitDays", sub: "Rolling days" },
                            ].map((item) => (
                                <div key={item.key} className="space-y-3">
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"} ml-1`}>
                                        {item.label}
                                    </label>
                                    <div className="relative group/input p-[2px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl shadow-sm">
                                        <input
                                            type="number"
                                            value={config[item.key] ?? ""}
                                            onChange={(e) => setConfig({ ...config, [item.key]: e.target.value === "" ? "" : parseInt(e.target.value) })}
                                            onWheel={(e) => e.target.blur()}
                                            className={`w-full ${darkMode ? "bg-black text-white" : "bg-white text-black border border-gray-100"} rounded-[calc(1rem-2px)] px-5 py-4 focus:ring-2 focus:ring-blue-400 outline-none transition-all font-bold shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                        />
                                        {item.sub && <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black ${darkMode ? "text-blue-400" : "text-blue-600"} uppercase pointer-events-none`}>{item.sub}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Row 4: Other Points & Submit */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 items-end">
                            {[
                                { label: "Profile Completion Points", key: "profileCompletionPoints" },
                                { label: "Networking (Connect) Points", key: "connectionPoints" },
                            ].map((item) => (
                                <div key={item.key} className="space-y-3">
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"} ml-1`}>
                                        {item.label}
                                    </label>
                                    <div className="relative group/input p-[2px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl shadow-sm">
                                        <input
                                            type="number"
                                            value={config[item.key] ?? ""}
                                            onChange={(e) => setConfig({ ...config, [item.key]: e.target.value === "" ? "" : parseInt(e.target.value) })}
                                            onWheel={(e) => e.target.blur()}
                                            className={`w-full ${darkMode ? "bg-black text-white" : "bg-white text-black border border-gray-100"} rounded-[calc(1rem-2px)] px-5 py-4 focus:ring-2 focus:ring-blue-400 outline-none transition-all font-bold shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                        />
                                    </div>
                                </div>
                            ))}
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black h-[58px] rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2 group/btn mb-[2px]"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                        Save System Config
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </section>
            </div>

            {/* Manual Award Section */}
            <div className="relative p-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500">
                <section className={`${darkMode ? "bg-black" : "bg-[#FAFAFA]"} p-4 sm:p-10 rounded-[calc(2.5rem-2px)] relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-green-500/10 transition-colors"></div>
                    <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3">
                        <span className="p-3 bg-green-600/20 rounded-2xl text-green-400">🏆</span>
                        <span className={darkMode ? "text-white" : "text-slate-900"}>Custom Points Grant</span>
                    </h2>
                    <form onSubmit={handleManualAward} className="space-y-4 sm:space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                            <div className="space-y-3">
                                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"} ml-1`}>Search Recipient</label>
                                <div className="relative group/input p-[2px] bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl shadow-sm">
                                    <UserSearchInput
                                        value={search}
                                        onChange={(val) => setSearch(val)}
                                        onSelect={(user) => setSearch(user.name)}
                                        role="student"
                                        darkMode={darkMode}
                                        placeholder="Name or ID..."
                                        className={`!w-full !border-none !shadow-none font-black !py-3 sm:!py-4 !px-4 sm:!px-5 !h-[46px] sm:!h-[58px] ${
                                            darkMode ? "!bg-black !text-white" : "!bg-white !text-black"
                                        }`}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"} ml-1`}>Grant Amount</label>
                                <div className="p-[2px] bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl shadow-sm">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className={`w-full ${darkMode ? "bg-black text-white" : "bg-white text-black border border-gray-100"} rounded-[calc(1rem-2px)] px-4 sm:px-5 py-3 sm:py-4 focus:ring-2 focus:ring-green-400 outline-none transition-all font-bold shadow-inner`}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"} ml-1`}>Activity Category</label>
                                <div className="p-[2px] bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl relative shadow-sm">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className={`w-full ${darkMode ? "bg-[#1a1a2e] text-white" : "bg-white text-black border border-gray-100"} rounded-[calc(1rem-2px)] px-4 sm:px-5 py-3 sm:py-4 focus:ring-2 focus:ring-green-400 outline-none transition-all font-bold shadow-inner appearance-none cursor-pointer`}
                                    >
                                        {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                    <svg className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"} ml-1`}>Custom Note (Appears in User Notification)</label>
                            <div className="p-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-2xl shadow-sm">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className={`w-full ${darkMode ? "bg-black text-white placeholder-white/30" : "bg-white text-black border border-gray-100"} rounded-[calc(1rem-2px)] px-4 sm:px-6 py-3 sm:py-5 focus:ring-2 focus:ring-green-400 outline-none transition-all font-bold shadow-inner`}
                                    placeholder="e.g. Exceptional contribution to the annual tech summit..."
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={awarding}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-3 sm:py-5 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                        >
                            {awarding ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    Grant Points & Notify User
                                </>
                            )}
                        </button>
                    </form>
                </section>
            </div>

            {/* Manual Penalty Section */}
            <div className="relative p-[2px] bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500">
                <section className={`${darkMode ? "bg-black" : "bg-[#FAFAFA]"} p-4 sm:p-10 rounded-[calc(2.5rem-2px)] relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-red-500/10 transition-colors"></div>
                    <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3">
                        <span className="p-3 bg-red-600/20 rounded-2xl text-red-500">⚠️</span>
                        <span className={darkMode ? "text-white" : "text-slate-900"}>Custom Points Penalty</span>
                    </h2>
                    <form onSubmit={handleManualPenalty} className="space-y-4 sm:space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                            <div className="space-y-3">
                                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"} ml-1`}>Search Recipient</label>
                                <div className="relative group/input p-[2px] bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-sm">
                                    <UserSearchInput
                                        value={penaltySearch}
                                        onChange={(val) => setPenaltySearch(val)}
                                        onSelect={(user) => setPenaltySearch(user.name)}
                                        role="student"
                                        darkMode={darkMode}
                                        placeholder="Name or ID..."
                                        className={`!w-full !border-none !shadow-none font-black !py-3 sm:!py-4 !px-4 sm:!px-5 !h-[46px] sm:!h-[58px] ${
                                            darkMode ? "!bg-black !text-white" : "!bg-white !text-black"
                                        }`}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"} ml-1`}>Penalty Amount</label>
                                <div className="p-[2px] bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-sm">
                                    <input
                                        type="number"
                                        value={penaltyAmount}
                                        onChange={(e) => setPenaltyAmount(e.target.value)}
                                        className={`w-full ${darkMode ? "bg-black text-white" : "bg-white text-black border border-gray-100"} rounded-[calc(1rem-2px)] px-4 sm:px-5 py-3 sm:py-4 focus:ring-2 focus:ring-red-400 outline-none transition-all font-bold shadow-inner`}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"} ml-1`}>Custom Reason (Appears in Notice)</label>
                            <div className="p-[2px] bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-2xl shadow-sm">
                                <input
                                    type="text"
                                    value={penaltyMessage}
                                    onChange={(e) => setPenaltyMessage(e.target.value)}
                                    className={`w-full ${darkMode ? "bg-black text-white placeholder-white/30" : "bg-white text-black border border-gray-100"} rounded-[calc(1rem-2px)] px-4 sm:px-6 py-3 sm:py-5 focus:ring-2 focus:ring-red-400 outline-none transition-all font-bold shadow-inner`}
                                    placeholder="e.g. Violation of community guidelines..."
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={penalizing}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 sm:py-5 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                        >
                            {penalizing ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    Deduct Points & Issue Notice
                                </>
                            )}
                        </button>
                    </form>
                </section>
            </div>

            {/* Danger Zone / Rollover / Sync */}
            <div className="relative p-[2px] bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <section className={`${darkMode ? "bg-black/80" : "bg-red-50/50"} backdrop-blur-3xl p-4 sm:p-10 rounded-[calc(2.5rem-2px)] relative overflow-hidden group`}>
                    <h2 className="text-xl sm:text-2xl font-black text-red-500 mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3">
                        <span className="p-3 bg-red-600/20 rounded-2xl text-red-500">⚠️</span>
                        Advanced Data Management
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                        <div className="p-[2px] rounded-[2.5rem] bg-gradient-to-tr from-red-500 to-orange-500 shadow-xl transition-all hover:scale-[1.02]">
                            <div className={`space-y-3 sm:space-y-4 p-4 sm:p-8 rounded-[calc(2.5rem-2px)] ${darkMode ? "bg-black" : "bg-white"} h-full flex flex-col`}>
                                <h3 className={`text-lg font-black ${darkMode ? "text-white" : "text-slate-900"}`}>Season Rollover</h3>
                                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-slate-700"} leading-relaxed flex-1`}>
                                    Resets all current season points and moves balances to <span className="text-red-500 font-black underline decoration-red-500 underline-offset-4">Historical Rankings</span>. This action is irreversible.
                                </p>
                                <button
                                    onClick={triggerRollover}
                                    className="w-full bg-red-600 hover:bg-red-500 text-white text-sm font-black px-6 py-4 rounded-2xl transition-all shadow-lg active:scale-95 mt-6"
                                >
                                    Trigger Annual Rollover
                                </button>
                            </div>
                        </div>
                        <div className="p-[2px] rounded-[2.5rem] bg-gradient-to-tr from-purple-500 to-pink-500 shadow-xl transition-all hover:scale-[1.02]">
                            <div className={`space-y-3 sm:space-y-4 p-4 sm:p-8 rounded-[calc(2.5rem-2px)] ${darkMode ? "bg-black" : "bg-white"} h-full flex flex-col`}>
                                <h3 className={`text-lg font-black ${darkMode ? "text-white" : "text-slate-900"}`}>Consistency Sync</h3>
                                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-slate-700"} leading-relaxed flex-1`}>
                                    Recalculates point aggregates for all users and cleans up orphaned point logs. <span className="text-purple-600 font-black">Safe to run.</span>
                                </p>
                                <button
                                    onClick={triggerSync}
                                    className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-black px-6 py-4 rounded-2xl transition-all shadow-lg active:scale-95 mt-6"
                                >
                                    Execute Global Sync
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
