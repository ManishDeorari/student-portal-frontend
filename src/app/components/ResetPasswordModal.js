"use client";

import React, { useState } from "react";
import { FaTimes, FaLock } from "react-icons/fa";

const ResetPasswordModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });

        if (formData.newPassword !== formData.confirmPassword) {
            return setMessage({ text: "New passwords do not match", type: "error" });
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ text: "Password reset successful!", type: "success" });
                setTimeout(() => {
                    onClose();
                    setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                    setMessage({ text: "", type: "" });
                }, 2000);
            } else {
                setMessage({ text: data.message || "Failed to reset password", type: "error" });
            }
        } catch (err) {
            console.error("Reset password error:", err);
            setMessage({ text: "An error occurred. Please try again.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md px-2 sm:px-4">
            {/* Container with purple-blue theme gradient */}
            <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden max-h-[95dvh] overflow-y-auto">

                {/* Glow effects */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-white/50 hover:text-white transition-all hover:rotate-90"
                >
                    <FaTimes size={22} />
                </button>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 transform -rotate-3">
                        <FaLock className="text-white" size={28} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-purple-200">Reset Password</h2>
                    <p className="text-white/50 text-sm mt-2 text-center">Secure your account with a new password</p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-medium text-center animate-in fade-in zoom-in duration-300 ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="group">
                        <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2 ml-1 transition-colors group-focus-within:text-blue-400">Current Password</label>
                        <input
                            type="password"
                            name="oldPassword"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full bg-[#FAFAFA]/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-[#FAFAFA]/10 transition-all duration-300"
                            required
                        />
                    </div>
                    <div className="group">
                        <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2 ml-1 transition-colors group-focus-within:text-blue-400">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full bg-[#FAFAFA]/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-[#FAFAFA]/10 transition-all duration-300"
                            required
                        />
                    </div>
                    <div className="group">
                        <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2 ml-1 transition-colors group-focus-within:text-blue-400">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full bg-[#FAFAFA]/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-[#FAFAFA]/10 transition-all duration-300"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/10 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 mt-6 text-lg`}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Update Account Security"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordModal;
