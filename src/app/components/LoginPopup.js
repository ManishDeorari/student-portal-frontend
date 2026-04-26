"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { X, User, Lock, LogIn, ArrowLeft, UserPlus } from "lucide-react";
import { GooeyGradientBackground } from "./GooeyGradientBackground";

const LoginPopup = () => {
    const router = useRouter();
    const [form, setForm] = useState({ identifier: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        identifier: form.identifier,
                        password: form.password
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Invalid credentials");
            }

            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("userId", data.userId);
                if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

                // ✅ Notify other components that auth has changed
                window.dispatchEvent(new Event("local-auth-change"));

                toast.success("✅ Login Successful!");

                // Stay on current page but trigger reload to clear protection
                window.location.reload();
            } else {
                throw new Error("Token not received");
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message || "Something went wrong");
            toast.error(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const [darkMode, setDarkMode] = useState(false);

    const handleSignupRedirect = () => {
        router.push("/auth/signup");
    };

    const handleClose = () => {
        router.push("/");
    };

    return (
        <GooeyGradientBackground className={`fixed inset-0 z-[9999] flex items-center justify-start pt-8 md:pt-12 backdrop-blur-xl px-4 transition-colors duration-500`} darkMode={darkMode}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-[400px] z-10 mx-auto"
            >
                {/* Header outside card */}
                <div className="text-center mb-6 pt-0">
                    <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">
                        Student Portal
                    </h1>
                    <p className="text-white/70 mt-2 font-medium text-sm">Reconnect. Network. Grow.</p>
                </div>

                <div className="p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500">
                    <div className={`${darkMode ? "bg-[#0f172a]" : "bg-[#FAFAFA]"} backdrop-blur-2xl rounded-[calc(2.5rem-2px)] py-4 px-6 md:py-5 md:px-8 space-y-4 relative transition-all duration-500`}>
                        {/* Popup Status Header */}
                        <div className="flex justify-between items-center text-white flex-shrink-0">
                            <div className="space-y-0.5">
                                <h2 className={`text-lg font-black flex items-center gap-2 tracking-tight ${darkMode ? "text-white" : "text-black"}`}>
                                    Access Restricted
                                </h2>
                                <p className={`text-[8.5px] uppercase tracking-[0.2em] ${darkMode ? "text-blue-400" : "text-blue-600"} font-black`}>Authentication required</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className={`${darkMode ? "text-white/40 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"} p-2 rounded-full transition-all`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`${darkMode ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-100 text-red-600"} border text-[10px] py-2 px-4 rounded-xl text-center font-bold`}
                        >
                            {error}
                        </motion.div>
                    )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className={`text-[8.5px] uppercase tracking-[0.2em] ${darkMode ? "text-gray-400" : "text-slate-500"} ml-4 font-black flex items-center gap-1.5`}>
                                    <User className="w-3 h-3 text-blue-500" /> Email or ID
                                </label>
                                <div className="p-[1.5px] bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl focus-within:from-blue-500 focus-within:via-purple-500 focus-within:to-pink-500 transition-all">
                                    <input
                                        type="text"
                                        name="identifier"
                                        placeholder="example@univ.edu"
                                        value={form.identifier}
                                        onChange={handleChange}
                                        className={`w-full px-5 py-2.5 ${darkMode ? "bg-[#0f172a] text-white placeholder-white/20" : "bg-white text-gray-900 placeholder-gray-400"} rounded-[calc(1rem-1.5px)] outline-none transition-all text-xs font-bold`}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className={`text-[8.5px] uppercase tracking-[0.2em] ${darkMode ? "text-gray-400" : "text-slate-500"} ml-4 font-black flex items-center gap-1.5`}>
                                    <Lock className="w-3 h-3 text-purple-500" /> Password
                                </label>
                                <div className="p-[1.5px] bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl focus-within:from-blue-500 focus-within:via-purple-500 focus-within:to-pink-500 transition-all">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        className={`w-full px-5 py-2.5 ${darkMode ? "bg-[#0f172a] text-white placeholder-white/20" : "bg-white text-gray-900 placeholder-gray-400"} rounded-[calc(1rem-1.5px)] outline-none transition-all text-xs font-bold`}
                                        required
                                    />
                                </div>
                            </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:brightness-110 text-white py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authenticating...
                                </span>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" /> Sign In
                                </>
                            )}
                        </button>
                    </form>

                        <div className="flex flex-col space-y-3 pt-1">
                            <div className="p-[1.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]">
                                <button
                                    onClick={handleSignupRedirect}
                                    className={`w-full ${darkMode ? "bg-black hover:bg-white/5 text-white" : "bg-white hover:bg-gray-50 text-slate-900"} font-black py-3.5 px-6 rounded-[calc(1rem-1.5px)] transition-all flex items-center justify-center gap-3 text-[9px] uppercase tracking-[0.2em] group`}
                                >
                                    <UserPlus className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" /> 
                                    Create New Account
                                </button>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex justify-between items-center gap-3">
                            <Link 
                                href="/" 
                                className="flex-1 p-[1.5px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl shadow-lg active:scale-95 group transition-all"
                            >
                                <div className={`w-full h-full flex items-center justify-center gap-2 py-2 rounded-[calc(0.75rem-1.5px)] ${darkMode ? "bg-black text-emerald-400 group-hover:bg-emerald-500/10" : "bg-white text-emerald-600 group-hover:bg-emerald-50"}`}>
                                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> 
                                    <span className="text-[8.5px] font-black uppercase tracking-widest">Home</span>
                                </div>
                            </Link>

                            <Link 
                                href="/auth/login" 
                                className="flex-1 p-[1.5px] bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-xl shadow-lg active:scale-95 group transition-all"
                            >
                                <div className={`w-full h-full flex items-center justify-center gap-2 py-2 rounded-[calc(0.75rem-1.5px)] ${darkMode ? "bg-black text-orange-400 group-hover:bg-orange-500/10" : "bg-white text-orange-600 group-hover:bg-orange-50"}`}>
                                    <LogIn className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    <span className="text-[8.5px] font-black uppercase tracking-widest">Full Login</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Theme Toggle Button Fixed at bottom right of page */}
                <div className="fixed bottom-6 right-6 z-[100]">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-4 rounded-full backdrop-blur-md shadow-2xl border-2 transition-all duration-500 ${darkMode ? "bg-[#FAFAFA]/10 border-white/20 text-yellow-400 hover:bg-[#FAFAFA]/20" : "bg-[#0f172a]/10 border-[#0f172a]/20 text-[#0f172a] hover:bg-[#0f172a]/20"} hover:scale-110 active:scale-90`}
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {darkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        )}
                    </button>
                </div>
            </motion.div>
        </GooeyGradientBackground>
    );
};

export default LoginPopup;
