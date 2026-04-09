"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageSquarePlus, Smile } from "lucide-react";
import EmojiPickerToggle from "./Post/utils/EmojiPickerToggle";
import { toast } from "react-hot-toast";
import { sendFeedback } from "../../api/notification";

const FeedbackModal = ({ isOpen, onClose, darkMode }) => {
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) return;
        setIsSubmitting(true);
        try {
            await sendFeedback(message);
            toast.success("Feedback sent to Main Admin!");
            setMessage("");
            onClose();
        } catch (error) {
            toast.error(error.message || "Failed to send feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEmojiSelect = (emoji) => {
        setMessage((prev) => prev + emoji.native);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-2 sm:p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="relative p-[2px] bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-2xl sm:rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden max-h-[95dvh] sm:max-h-[90vh]"
                    >
                        <div className={`relative ${darkMode ? "bg-black" : "bg-[#FAFAFA]"} rounded-[calc(1rem-2px)] sm:rounded-[calc(2.5rem-2px)] p-5 sm:p-8 h-full w-full overflow-y-auto`}>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20`}>
                                        <MessageSquarePlus className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"} leading-none`}>Submit Feedback</h3>
                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 ${darkMode ? "text-blue-400/80" : "text-blue-600/80"}`}>
                                            Direct to Main Admin
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className={`p-3 rounded-full hover:bg-gray-100/10 transition-all ${darkMode ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-900"}`}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="space-y-6 relative z-10">
                                <div className={`relative p-[2px] rounded-2xl bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 shadow-md`}>
                                    <div className={`rounded-[calc(1rem-2px)] overflow-hidden ${darkMode ? "bg-black" : "bg-white"}`}>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Type your feedback, suggestions or issues here..."
                                            className={`w-full h-48 p-6 rounded-2xl outline-none resize-none bg-transparent ${darkMode ? "text-white placeholder-white/20" : "text-slate-900 placeholder-slate-400"} font-bold text-sm leading-relaxed`}
                                        />
                                        <div className="absolute bottom-6 right-6 flex items-center gap-4">
                                            <span className={`text-[10px] font-black tracking-widest ${darkMode ? "text-white/20" : "text-gray-400"}`}>
                                                {message.length} Characters
                                            </span>
                                            <EmojiPickerToggle 
                                                onEmojiSelect={handleEmojiSelect}
                                                darkMode={darkMode}
                                                iconSize="text-2xl"
                                                placement="top"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !message.trim()}
                                        className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.3em] transition-all ${
                                            !message.trim()
                                            ? `${darkMode ? "bg-white/5 text-white/20" : "bg-gray-100 text-gray-400"} cursor-not-allowed`
                                            : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_15px_30px_rgba(37,99,235,0.3)] active:scale-95"
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Submit Request
                                            </>
                                        )}
                                    </button>
                                    <p className={`text-[9px] text-center font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        Your feedback helps us build a better community
                                    </p>
                                </div>
                            </div>

                            {/* Decorative Background Element */}
                            <div className="absolute -bottom-10 -left-10 opacity-5 rotate-12 -z-0 pointer-events-none text-slate-500">
                                <MessageSquarePlus className={`w-48 h-48`} />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackModal;
