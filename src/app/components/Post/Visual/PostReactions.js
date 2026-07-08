"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Eye } from "lucide-react";

// Emoji to label mapping
const emojiLabels = {
  "👍": "Like",
  "❤️": "Love",
  "😂": "Funny",
  "😮": "Wow",
  "😢": "Sad",
  "😊": "Happy",
  "👏": "Clap",
  "🎉": "Celebrate",
};

export default function PostReactions({
  post,
  handleReact,
  getReactionCount,
  userReacted,
  setReactionEffect,
  reactionEffect,
  showComments,
  setShowComments,
  darkMode = false
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredEmoji, setHoveredEmoji] = useState(null);
  const [pickerStyle, setPickerStyle] = useState({});
  const pickerRef = useRef();
  const buttonRef = useRef();

  // Close picker on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        !buttonRef.current?.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle dynamic position of emoji picker
  const handleEmojiButtonClick = () => {
    if (!showEmojiPicker && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      setPickerStyle({
        position: "fixed",
        zIndex: 99999,
        left: `${rect.left}px`,
        bottom: `${viewportHeight - rect.top + 8}px`,
      });
    }
    setShowEmojiPicker((prev) => !prev);
  };

  return (
    <>
      {/* Reactions Summary */}
      {post.reactions && Object.keys(post.reactions).length > 0 && (
        <div className="flex gap-3 mt-1 flex-wrap">
          {Object.entries(post.reactions).map(([emoji, users]) => {
            if (!Array.isArray(users) || users.length === 0) return null;
            return (
              <div
                key={emoji}
                className={`text-lg px-2.5 py-1 ${darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100 shadow-sm"} border rounded-xl flex items-center gap-1.5 ${userReacted(emoji)
                  ? (darkMode ? "border-blue-500 bg-blue-500/10" : "border-blue-500 bg-blue-50")
                  : ""
                  }`}
              >
                <span className="transform group-hover:scale-110 transition-transform">{emoji}</span>
                <span className={`text-[11px] font-black tracking-tighter ${darkMode ? "text-white" : "text-slate-900"}`}>x{users.length}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* React + Comment Buttons */}
      <div className="relative mt-2">
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          {/* React Button (left) */}
          {(() => {
            const userReactionEmoji = post.reactions ? Object.keys(post.reactions).find(emoji => userReacted(emoji)) : null;
            const hasReacted = !!userReactionEmoji;
            
            return (
              <button
                onClick={handleEmojiButtonClick}
                className={`relative font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center gap-2 px-4 py-1.5 rounded-xl border overflow-hidden group 
                  ${hasReacted 
                    ? (darkMode ? "text-white border-blue-500/50 bg-blue-500/10" : "text-blue-600 border-blue-500/50 bg-blue-50") 
                    : (darkMode ? "text-white border-white/10 hover:border-blue-500/50" : "text-slate-900 border-black/5 hover:border-blue-500/50")}`}
                ref={buttonRef}
              >
                {!hasReacted && <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
                <span className={`text-lg group-hover:scale-110 transition-transform duration-300 ${hasReacted ? "scale-110" : ""}`}>
                  {hasReacted ? userReactionEmoji : "👍"}
                </span> 
                <span className={`relative z-10 ${hasReacted ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500" : "group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500"}`}>
                  {hasReacted ? "Reacted" : "React"}
                </span>
              </button>
            );
          })()}

          {/* View Counter (center) */}
          <div className={`font-black text-sm uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} flex items-center gap-2`}>
            <svg width="0" height="0" className="absolute">
              <linearGradient id="eye-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop stopColor="#f97316" offset="0%" />
                <stop stopColor="#ec4899" offset="50%" />
                <stop stopColor="#a855f7" offset="100%" />
              </linearGradient>
            </svg>
            <Eye className="w-5 h-5" style={{ stroke: "url(#eye-gradient)" }} /> {(post.viewedBy || []).length}
          </div>

          {/* Comment Button (right, slightly left-pushed) */}
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className={`relative font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center gap-2 px-4 py-1.5 rounded-xl border overflow-hidden group mr-2 ${darkMode ? "text-white border-white/10 hover:border-pink-500/50" : "text-slate-900 border-black/5 hover:border-pink-500/50"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="text-lg group-hover:scale-110 transition-transform duration-300">💬</span> 
            <span className="relative z-10 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-orange-500">Comment ({(post.comments || []).length})</span>
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && createPortal(
          <div style={pickerStyle} className="fixed z-[99999]">
            <AnimatePresence>
              <motion.div
                ref={pickerRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`${darkMode ? "bg-slate-800 border-white/10" : "bg-[#FAFAFA] border-gray-300"} border shadow-2xl rounded-full px-4 py-2 flex gap-3 ring-1 ring-black ring-opacity-5`}
              >
                {Object.keys(emojiLabels).map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileTap={{ scale: 1.3 }}
                    whileHover={{ scale: 1.1 }}
                    onMouseEnter={() => setHoveredEmoji(emoji)}
                    onMouseLeave={() => setHoveredEmoji(null)}
                    onClick={() => {
                      handleReact(emoji);
                      setShowEmojiPicker(false);
                    }}
                    className={`text-2xl relative ${userReacted(emoji) ? "opacity-100" : "opacity-60"
                      }`}
                  >
                    {emoji}
                    {hoveredEmoji === emoji && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow whitespace-nowrap"
                      >
                        {emojiLabels[emoji]}
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>,
          document.body
        )}
      </div>
    </>
  );
}
