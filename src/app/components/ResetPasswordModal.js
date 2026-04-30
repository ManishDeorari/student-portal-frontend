import React, { useState } from "react";
import { FaTimes, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const ResetPasswordModal = ({ isOpen, onClose }) => {
    const { darkMode } = useTheme();
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md px-2 sm:px-4 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative p-[2px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
                    >
                        <div className={`relative ${darkMode ? "bg-black" : "bg-white"} rounded-[calc(1.5rem-2px)] p-5 sm:p-7 no-scrollbar max-h-[85dvh] overflow-y-auto`}>
                            {/* Decorative Glows */}
                            {darkMode && (
                                <>
                                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                </>
                            )}

                            <button
                                onClick={onClose}
                                className={`absolute top-5 right-5 transition-all hover:rotate-90 p-2 rounded-full ${darkMode ? "text-white/40 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}
                            >
                                <FaTimes size={18} />
                            </button>

                            <div className="flex flex-col items-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 transform -rotate-3">
                                    <FaLock className="text-white" size={26} />
                                </div>
                                <h2 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"} tracking-tight`}>Reset Password</h2>
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 ${darkMode ? "text-blue-400/80" : "text-blue-600/80"}`}>
                                    Account Security
                                </p>
                            </div>

                            {message.text && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className={`mb-6 p-4 rounded-2xl text-xs font-black uppercase tracking-wider text-center border ${
                                        message.type === "success" 
                                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                    }`}
                                >
                                    {message.text}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Current Password */}
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${darkMode ? "text-white" : "text-slate-900"}`}>Current Password</label>
                                    <div className="relative p-[1.5px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 rounded-2xl focus-within:from-blue-500 focus-within:via-purple-500 focus-within:to-pink-500 transition-all duration-300">
                                        <input
                                            type={showOldPassword ? "text" : "password"}
                                            name="oldPassword"
                                            value={formData.oldPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className={`w-full ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"} rounded-[calc(1rem-1.5px)] px-5 pr-12 py-3.5 focus:outline-none font-bold text-sm`}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${darkMode ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-600"}`}
                                        >
                                            {showOldPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${darkMode ? "text-white" : "text-slate-900"}`}>New Password</label>
                                    <div className="relative p-[1.5px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 rounded-2xl focus-within:from-blue-500 focus-within:via-purple-500 focus-within:to-pink-500 transition-all duration-300">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className={`w-full ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"} rounded-[calc(1rem-1.5px)] px-5 pr-12 py-3.5 focus:outline-none font-bold text-sm`}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${darkMode ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-600"}`}
                                        >
                                            {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${darkMode ? "text-white" : "text-slate-900"}`}>Confirm Password</label>
                                    <div className="relative p-[1.5px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 rounded-2xl focus-within:from-blue-500 focus-within:via-purple-500 focus-within:to-pink-500 transition-all duration-300">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className={`w-full ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"} rounded-[calc(1rem-1.5px)] px-5 pr-12 py-3.5 focus:outline-none font-bold text-sm`}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${darkMode ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-600"}`}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] transition-all bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-[0_15px_30px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4`}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Update Security"
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ResetPasswordModal;
