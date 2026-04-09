"use client";
import React, { useState, useRef, useEffect } from "react";
import ReplyBox from "../utils/ReplyBox";
import EmojiPickerToggle from "../utils/EmojiPickerToggle";
import socket from "../../../../utils/socket";
import { triggerReactionEffect } from "../hooks/useEmojiAnimation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import ConfirmationModal from "./ConfirmationModal";

export default function CommentCard({
  comment,
  currentUser,
  onReply,
  onDelete,
  onEdit,
  replies = [],
  postId,
  isReply = false,
  onEditReply,
  onDeleteReply,
  onReactToReply,
  onReactToComment,
  darkMode = false
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [visibleReplies, setVisibleReplies] = useState(2);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment?.text || "");
  const [showEmoji, setShowEmoji] = useState(false);
  const [reactions, setReactions] = useState(comment.reactions || {});
  const [deleting, setDeleting] = useState(false);
  const [showAbove, setShowAbove] = useState(true);
  const [pickerStyle, setPickerStyle] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const commentRef = useRef(null);
  const reactButtonRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (showEmoji) {
      const handleClickOutside = (e) => {
        if (pickerRef.current && !pickerRef.current.contains(e.target) &&
          reactButtonRef.current && !reactButtonRef.current.contains(e.target)) {
          setShowEmoji(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showEmoji]);

  const toggleEmojiPicker = () => {
    if (!showEmoji && reactButtonRef.current) {
      const rect = reactButtonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const style = {
        position: "fixed",
        zIndex: 9999,
        left: `${rect.left}px`,
        bottom: `${windowHeight - rect.top + 8}px`, // Forced Above
      };

      setPickerStyle(style);
    }
    setShowEmoji(!showEmoji);
  };

  const [justPosted, setJustPosted] = useState(false);

  useEffect(() => {
    setReactions(comment?.reactions || {});
  }, [comment?.reactions]);

  useEffect(() => {
    // Only scroll if it's the user's own new comment
    const isOwn = comment?.user?._id === currentUser?._id;
    if (isOwn && comment?.justNow) {
      commentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setJustPosted(true);
      const timer = setTimeout(() => setJustPosted(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [comment?.justNow, comment?.user?._id, currentUser?._id]);

  // ✅ Safety check: early return if basic data is missing
  if (!comment || !currentUser || !comment.user) return null;

  const isOwn = comment.user._id === currentUser._id;

  const toggleReaction = async (emoji) => {
    if (isReply && onReactToReply) {
      // Use parent handler for replies
      return onReactToReply(comment.parentId || comment.parentCommentId, comment._id, emoji);
    }

    if (!isReply && onReactToComment) {
      // Use parent handler for top-level comments
      return onReactToComment(comment._id, emoji);
    }

    // ✅ Local logic for top-level comment (Fallback)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const url = `${API_URL}/api/posts/${postId}/comments/${comment._id}/react`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ emoji }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Backend error:", errorData);
        throw new Error(errorData.error || "Failed to react");
      }

      const result = await res.json();
      setReactions(result.reactions || result.comment.reactions);

      socket.emit("updatePostRequest", { postId });
      triggerReactionEffect(emoji);
    } catch (err) {
      console.error("🔴 Reaction failed:", err);
    }
  };

  return (
    <div className={`p-[1.5px] rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 shadow-lg ${isReply ? "ml-4 scale-[0.98] origin-top-left opacity-95 transition-opacity" : "mt-2"}`}>
      <div
        ref={commentRef}
        className={`relative p-3 rounded-[calc(1rem-1.5px)] transition-all duration-300 ${isOwn ? (darkMode ? "bg-slate-800/90" : "bg-blue-50/50") : (darkMode ? "bg-slate-900" : "bg-white")} ${justPosted ? "ring-2 ring-blue-400" : ""}`}
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-3 w-full">
            <div className="p-[1px] rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex-shrink-0 w-8 h-8 shadow-sm">
              <Image
                src={comment.user?.profilePicture || "/default-profile.jpg"}
                alt="User"
                width={32}
                height={32}
                className="w-full h-full rounded-full border border-white/5 object-cover"
              />
            </div>
            <div className="w-full">
              <div className={`text-sm font-black flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                {isOwn ? (
                  <span>{comment.user?.name || "Unknown"}</span>
                ) : (
                  <Link
                    href={`/profile/${comment.user?.publicId || comment.user?._id}`}
                    className={`hover:text-blue-500 transition-colors ${darkMode ? "text-blue-400" : "text-blue-700"}`}
                  >
                    {comment.user?.name || "Unknown"}
                  </Link>
                )}
                {isOwn && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest ${darkMode ? "text-blue-300 bg-blue-600/30 border border-blue-500/30" : "text-blue-700 bg-blue-100 border border-blue-200"}`}>
                    You
                  </span>
                )}
              </div>

              {editing ? (
                <div className="flex gap-2 mt-1.5 items-start relative bg-black/5 p-1.5 rounded-lg">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Edit your comment..."
                    className={`w-full border-none bg-transparent text-sm focus:ring-0 outline-none ${darkMode ? "text-white" : "text-gray-900"}`}
                  />
                  <EmojiPickerToggle
                    onEmojiSelect={(emoji) => setEditText((prev) => prev + emoji.native)}
                    isCentered={true}
                    darkMode={darkMode}
                  />
                </div>
              ) : (
                <p className={`mt-1 text-sm font-semibold leading-snug ${darkMode ? "text-gray-100" : "text-slate-800"}`}>{comment.text}</p>
              )}

              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                  {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {comment.editedAt && (
                   <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500/80 italic">Edited</span>
                )}
              </div>
            </div>

            {(isOwn || currentUser?.role === 'admin' || currentUser?.isMainAdmin) && (
              <div className="flex items-center gap-2 ml-2">
                {editing ? (
                  isOwn && (
                    <>
                      <button
                        className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors"
                        onClick={() => {
                          if (isReply) {
                            onEditReply(comment.parentId, comment._id, editText);
                          } else {
                            onEdit(comment._id, editText);
                          }
                          setEditing(false);
                          setShowEmoji(false);
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-400 transition-colors"
                        onClick={() => {
                          setEditing(false);
                          setEditText(comment.text);
                          setShowEmoji(false);
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )
                ) : (
                  <>
                    {isOwn && (
                      <button
                        className="text-[9px] font-black uppercase tracking-widest text-green-500 hover:text-green-400 transition-colors"
                        onClick={() => {
                          setEditText(comment.text);
                          setEditing(true);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={deleting}
                      className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {deleting ? "Wait" : "Delete"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
             setDeleting(true);
             if (isReply) {
               await onDeleteReply(comment.parentId, comment._id);
             } else {
               await onDelete(comment._id);
             }
             setDeleting(false);
          }}
          title="Delete Comment?"
          message="Are you sure you want to delete this comment? This action cannot be undone."
          darkMode={darkMode}
        />

        {/* 👍 Reactions Summary */}
        {reactions && Object.keys(reactions).some(emoji => reactions[emoji]?.length > 0) && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {Object.entries(reactions).map(([emoji, users]) => {
              if (!Array.isArray(users) || users.length === 0) return null;
              const reacted = users.includes(currentUser._id);
              return (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(emoji)}
                  className={`text-xs px-2 py-0.5 rounded-lg flex items-center gap-1.5 transition-all border 
                    ${reacted
                      ? (darkMode ? "bg-blue-500/20 border-blue-500/40 text-blue-300" : "bg-blue-50 border-blue-300 text-blue-800")
                      : (darkMode ? "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 border-transparent text-gray-700 hover:bg-gray-200")}`}
                >
                  <span className="transform hover:scale-110 transition-transform origin-center">{emoji}</span>
                  <span className={`text-[9px] font-black ${darkMode ? (reacted ? "text-white" : "text-gray-500") : "text-slate-900"}`}>{users.length}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 💬 Actions */}
        <div className="flex items-center gap-4 mt-2.5 pt-2.5 border-t border-white/5">
          {/* React Button */}
          <div className="relative">
            <button
              ref={reactButtonRef}
              onClick={toggleEmojiPicker}
              className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5 ${darkMode ? "text-white hover:text-blue-400" : "text-slate-900 hover:text-blue-600"}`}
            >
              👍 React
            </button>

            {showEmoji && createPortal(
              <div style={pickerStyle} className="fixed z-[9999]">
                <AnimatePresence>
                  <motion.div
                    ref={pickerRef}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`${darkMode ? "bg-slate-800 border-white/10" : "bg-white border-gray-200 shadow-xl"} border rounded-full px-2.5 py-1 flex gap-1.5 ring-1 ring-black ring-opacity-5`}
                  >
                    {["👍", "❤️", "😂", "😮", "😢", "😊", "👏", "🎉"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(emoji)}
                        className="text-lg hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>,
              document.body
            )}
          </div>

          {!isReply && (
            <button
              onClick={() => setShowReplyBox((v) => !v)}
              className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all px-2 py-1 rounded-md hover:bg-white/5 ${darkMode ? "text-white hover:text-blue-400" : "text-slate-900 hover:text-blue-600"}`}
            >
              {showReplyBox ? "Cancel" : "Reply"}
            </button>
          )}

          {replies.length > 0 && (
            <button
              onClick={() => {
                setShowReplies((prev) => !prev);
                setVisibleReplies(2);
              }}
              className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all px-2 py-1 rounded-md hover:bg-white/5 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
            >
              {showReplies
                ? `Hide ${replies.length}`
                : `${replies.length} ${replies.length > 1 ? "Replies" : "Reply"}`}
            </button>
          )}
        </div>

        {/* ✏️ Reply Input */}
        {showReplyBox && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <ReplyBox
              parentId={comment._id}
              onSubmit={(text) => {
                onReply(comment._id, text);
                setShowReplyBox(false);
              }}
              darkMode={darkMode}
            />
          </div>
        )}
      </div>

      {/* 🧵 Animated, Indented Reply Threads */}
      <AnimatePresence>
        {showReplies && replies.length > 0 && (
          <motion.div
            className="mt-2 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {[...replies]
              .reverse()
              .slice(0, visibleReplies)
              .map((r) => (
                <CommentCard
                  key={r._id}
                  comment={r}
                  currentUser={currentUser}
                  onReply={onReply}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  replies={r.replies || []}
                  postId={postId}
                  isReply={true}
                  onEditReply={onEditReply}
                  onDeleteReply={onDeleteReply}
                  onReactToReply={onReactToReply}
                  onReactToComment={onReactToComment}
                  darkMode={darkMode}
                />
              ))}

            <div className="flex gap-4 ml-6 mt-2">
              {replies.length > visibleReplies && (
                <button
                  className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400"
                  onClick={() => setVisibleReplies((v) => v + 2)}
                >
                  Load more
                </button>
              )}

              {visibleReplies > 2 && (
                <button
                  className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300"
                  onClick={() => setVisibleReplies(2)}
                >
                  Less
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
