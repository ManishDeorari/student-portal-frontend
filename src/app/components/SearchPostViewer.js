"use client";
import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// PostCard manages all its own hooks/state — no prop drilling needed
const PostCard = dynamic(() => import("./Post/PostCard"), { ssr: false });

export default function SearchPostViewer({ post, currentUser, darkMode, onClose }) {
  if (!post) return null;

  // No-op setPosts since we're viewing in isolation; updates won't persist to feed
  const noopSetPosts = () => {};

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="search-post-viewer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          key="search-post-viewer-card"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2.5rem]"
        >
          {/* Close button */}
          <div className="relative">
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 z-[100] p-2 rounded-full border-2 transition-all hover:scale-110 shadow-lg ${
                darkMode
                  ? "text-white border-white hover:bg-white/20"
                  : "text-black border-black hover:bg-black/10"
              }`}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <PostCard
              post={post}
              currentUser={currentUser}
              setPosts={noopSetPosts}
              darkMode={darkMode}
              initialShowComments={true}
              transparentBackground={false}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
