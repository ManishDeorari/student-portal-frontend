"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Megaphone, Calendar, Users } from "lucide-react";

const PostLoadingScreen = ({ type = "Regular", loading = false, darkMode = false }) => {
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = {
    Regular: ["Preparing your update...", "Uploading media...", "Broadcasting to feed...", "Finalizing post..."],
    Session: ["Organizing student session...", "Verifying logistics...", "Setting up interactions...", "Ready to share..."],
    Event: ["Coordinating event details...", "Setting up registrations...", "Generating insights...", "Almost live..."],
    Announcement: ["Drafting announcement...", "Alerting the network...", "Pinning to highlights...", "Sharing now..."],
  };

  const currentStatuses = statuses[type] || statuses.Regular;

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setStatusIndex((prev) => (prev + 1) % currentStatuses.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading, currentStatuses.length]);

  if (typeof document === "undefined") return null;

  const Icon = () => {
    switch (type) {
      case "Announcement": return <Megaphone className="w-8 h-8 text-blue-400" />;
      case "Event": return <Calendar className="w-8 h-8 text-purple-400" />;
      case "Session": return <Users className="w-8 h-8 text-orange-400" />;
      default: return <Send className="w-8 h-8 text-green-400" />;
    }
  };

  return createPortal(
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 sm:p-0"
        >
          {/* Pop-up Window With Hard Gradient Border */}
          <motion.div
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 0.95, opacity: 0 }}
             className={`p-[2.5px] rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-purple-600 shadow-[0_20px_60px_rgba(37,99,235,0.4)] max-w-sm w-full`}
          >
             <div className={`rounded-[calc(2.5rem-2.5px)] ${darkMode ? "bg-slate-900" : "bg-white"} p-10 flex flex-col items-center gap-8`}>
                {/* Spinning Spinner */}
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 rounded-full border-[3px] border-transparent border-t-blue-500 border-r-purple-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ 
                        scale: [0.95, 1.05, 0.95],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Icon />
                    </motion.div>
                  </div>
                </div>

                {/* Status text */}
                <div className="flex flex-col items-center w-full min-h-[4rem]">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={statusIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className={`${darkMode ? "text-white" : "text-gray-900"} font-black text-xs uppercase tracking-[0.4em] text-center leading-relaxed`}
                      style={{ opacity: 1 }} // Ensure 100% opacity override
                    >
                      {currentStatuses[statusIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Animated Progress Loader Bar */}
                <div className={`w-full h-[3px] ${darkMode ? "bg-white/10" : "bg-gray-100"} rounded-full overflow-hidden`}>
                  <motion.div
                    animate={{ 
                      x: ["-100%", "100%"] 
                    }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                  />
                </div>

                <div className="flex flex-col items-center opacity-40">
                  <span className={`${darkMode ? "text-white" : "text-gray-900"} text-[8px] font-black uppercase tracking-[0.5em]`}>SECURE UPLOAD</span>
                </div>
             </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PostLoadingScreen;
