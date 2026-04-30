"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaKey, FaSignOutAlt, FaCog, FaMoon, FaSun, FaCommentAlt } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import FeedbackModal from "./FeedbackModal";

const SettingsDrawer = ({ isOpen, onClose, onResetPassword, onSignout }) => {
    const { darkMode, toggleDarkMode } = useTheme();
    const [showFeedback, setShowFeedback] = useState(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer Container with Gradient Border */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 panel-full-height w-full sm:w-80 z-[101] p-[2px] bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 shadow-2xl"
                    >
                        {/* Main Drawer Body */}
                        <div className={`h-full w-full flex flex-col p-6 shadow-inner overscroll-none safe-bottom min-h-0 ${darkMode ? "bg-black/95 text-white" : "bg-[#FAFAFA] text-gray-900"}`}>

                            {/* Header */}
                            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${darkMode ? "bg-blue-500/20" : "bg-blue-50"}`}>
                                        <FaCog className="text-blue-500 text-xl" />
                                    </div>
                                    <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Settings</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className={`p-2 rounded-full transition-colors ${darkMode ? "hover:bg-[#FAFAFA]/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            {/* Options List */}
                            <div className="flex-1 space-y-4 overflow-y-auto pr-2 min-h-0 drawer-scrollbar">
                                {/* Theme Section Label */}
                                <p className={`text-xs font-black uppercase tracking-wider mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                                    Appearance
                                </p>

                                {/* Theme Toggle */}
                                <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-md group hover:shadow-lg transition-all">
                                    <button
                                        onClick={toggleDarkMode}
                                        className={`w-full flex items-center justify-between px-4 py-4 rounded-[calc(1rem-2px)] transition-all ${darkMode ? "bg-black hover:bg-black/80" : "bg-white hover:bg-gray-50"}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg transition-colors ${darkMode ? "bg-yellow-500/20" : "bg-blue-500/10"}`}>
                                                {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-500" />}
                                            </div>
                                            <span className={`font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Mode: {darkMode ? "Dark" : "Light"}</span>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${darkMode ? "bg-blue-600" : "bg-gray-200"}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${darkMode ? "left-7" : "left-1"}`}></div>
                                        </div>
                                    </button>
                                </div>

                                <p className={`text-xs font-black uppercase tracking-wider mb-2 mt-6 ${darkMode ? "text-white" : "text-slate-900"}`}>
                                    Account Security
                                </p>

                                {/* Reset Password */}
                                <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-md group hover:shadow-lg transition-all">
                                    <button
                                        onClick={() => {
                                            onResetPassword();
                                            onClose();
                                        }}
                                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-[calc(1rem-2px)] transition-all ${darkMode ? "bg-black hover:bg-black/80" : "bg-white hover:bg-gray-50"}`}
                                    >
                                        <div className={`p-2 rounded-lg transition-colors ${darkMode ? "bg-purple-500/20" : "bg-purple-50"}`}>
                                            <FaKey className="text-purple-500" />
                                        </div>
                                        <span className={`font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Reset Password</span>
                                    </button>
                                </div>

                                <div className={`pt-6 mt-6 border-t ${darkMode ? "border-white/10" : "border-gray-100"} space-y-4`}>
                                    <p className={`text-xs font-black uppercase tracking-wider mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        Support & Feedback
                                    </p>
                                    
                                    {/* Feedback Button */}
                                    <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-md group hover:shadow-lg transition-all">
                                        <button
                                            onClick={() => setShowFeedback(true)}
                                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-[calc(1rem-2px)] transition-all ${darkMode ? "bg-black hover:bg-black/80" : "bg-white hover:bg-gray-50"}`}
                                        >
                                            <div className={`p-2 rounded-lg transition-colors ${darkMode ? "bg-blue-500/20" : "bg-blue-100"}`}>
                                                <FaCommentAlt className="text-blue-500" />
                                            </div>
                                            <span className={`font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Share Feedback</span>
                                        </button>
                                    </div>

                                    {/* Sign Out */}
                                    <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-red-400 via-pink-500 to-red-500 shadow-md group hover:shadow-lg transition-all">
                                        <button
                                            onClick={onSignout}
                                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-[calc(1rem-2px)] transition-all ${darkMode ? "bg-black hover:bg-black/80" : "bg-white hover:bg-gray-50"}`}
                                        >
                                            <div className={`p-2 rounded-lg transition-colors ${darkMode ? "bg-red-500/20" : "bg-red-100"}`}>
                                                <FaSignOutAlt className="text-red-500" />
                                            </div>
                                            <span className={`font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-auto pt-4 pb-6 text-center flex-shrink-0">
                                <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-sm ${darkMode ? "bg-white/10 text-white" : "bg-slate-200 text-slate-900"}`}>
                                    Student Portal v0.1.0
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Feedback Modal */}
                    <FeedbackModal 
                        isOpen={showFeedback} 
                        onClose={() => setShowFeedback(false)} 
                    />
                </>
            )}
        </AnimatePresence>
    );
};

export default SettingsDrawer;
