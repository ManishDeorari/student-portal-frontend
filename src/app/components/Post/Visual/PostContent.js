"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import EmojiPickerToggle from "../utils/EmojiPickerToggle";

export default function PostContent({
  editing,
  editContent,
  setEditContent,
  editTitle,
  setEditTitle,
  handleEditSave,
  handleBlurSave,
  post,
  textareaRef,
  setShowModal,
  darkMode = false,
  hideViewFullPost = false
}) {
  const handleEmojiSelect = (emoji) => {
    setEditContent((prev) => prev + emoji.native);
  };

  const handleTitleEmojiSelect = (emoji) => {
    setEditTitle((prev) => prev + emoji.native);
  };

  return (
    <AnimatePresence mode="wait">
      {editing ? (
        <motion.div
           key="editor"
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: 10 }}
           transition={{ duration: 0.3 }}
           className="space-y-4"
        >
          {post.type === "Event" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-900"}`}>Event Title</label>
                <EmojiPickerToggle onEmojiSelect={handleTitleEmojiSelect} icon="😀" darkMode={darkMode} />
              </div>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={`w-full border-2 ${darkMode ? "border-white/10 bg-slate-800 text-white" : "border-gray-200 bg-[#FAFAFA] text-gray-900"} rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold`}
                placeholder="Edit event title..."
              />
            </div>
          )}
          
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onBlur={() => handleBlurSave(editContent, `edit-${post._id}`)}
              rows={3}
              className={`w-full border-2 ${darkMode ? "border-white/10 bg-slate-800 text-white" : "border-gray-200 bg-[#FAFAFA] text-gray-900"} rounded-xl p-3 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
              placeholder="Edit your post..."
            />
            <EmojiPickerToggle
              onEmojiSelect={handleEmojiSelect}
              icon="😀"
              iconSize="text-2xl"
              isCentered={true}
              darkMode={darkMode}
            />
          </div>

          <div className={`p-3 border ${darkMode ? "border-white/10 bg-[#FAFAFA]/5" : "border-gray-300 bg-gray-50"} rounded-xl`}>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} font-semibold mb-1`}>Preview:</p>
            <p className={`whitespace-pre-wrap ${darkMode ? "text-gray-300" : "text-gray-800"}`}>{editContent}</p>
          </div>

          <button
            onClick={() => handleEditSave(editContent)}
            className="bg-green-600 text-white px-4 py-1 rounded"
          >
            Save
          </button>
        </motion.div>
      ) : (
        <motion.div
          key="view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p className={`whitespace-pre-wrap leading-relaxed ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{post.content}</p>
          {!hideViewFullPost && (
            <div
              onClick={() => setShowModal(true)}
              className={`cursor-pointer text-sm font-bold ${darkMode ? "text-blue-400" : "text-blue-600"} hover:underline mt-2 inline-block`}
            >
              View full post
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
