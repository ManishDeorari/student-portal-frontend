"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import UserNameWithBadge from "../ui/UserNameWithBadge";
import UserAvatar from "../ui/UserAvatar";

// Subcomponents
import PostHeader from "./Visual/PostHeader";
import PostContent from "./Visual/PostContent";
import PostMedia from "./Visual/PostMedia";
import { getOptimizedImageUrl, downloadFileSilently } from "../../utils/cloudinaryHelper";
import PostReactions from "./Visual/PostReactions";
import dynamic from "next/dynamic";

import SmartPostModal from "./SmartPostModal";
import CommentInput from "./Visual/CommentInput";
const CommentCard = dynamic(() => import("./Visual/commentCard"), { ssr: false });
import EventRegistrationModal from "./EventRegistrationModal";
import AdminRegistrationsModal from "./AdminRegistrationsModal";
import AdminRepostsModal from "./AdminRepostsModal";
import CreateEventRepostModal from "./CreateEventRepostModal";
import ReactionModal from "./Visual/ReactionModal";
import FullImageViewer from "./utils/FullImageViewer";
import ConfirmationModal from "./Visual/ConfirmationModal";

// Hooks
import usePostSocket from "./hooks/usePostSocket";
import usePostEffects from "./hooks/usePostEffects";
import usePostActions from "./hooks/usePostActions";
import useEmojiAnimation from "./hooks/useEmojiAnimation";
import useCommentActions from "./hooks/useCommentActions";
import getEmojiFromUnified from "./utils/getEmojiFromUnified";

export default function PostCard({ post, currentUser, setPosts, initialShowComments = false, darkMode = false, hideActions = false, transparentBackground = false }) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [editTitle, setEditTitle] = useState(post.title || "");
  const [showEditEmoji, setShowEditEmoji] = useState(false);
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibleComments, setVisibleComments] = useState(2);
  const [showModal, setShowModal] = useState(false);
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [showThread, setShowThread] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [reactionEffect, setReactionEffect] = useState(null);
  const [showComments, setShowComments] = useState(initialShowComments);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [reactionModalEmoji, setReactionModalEmoji] = useState(null);
  const [reactionModalUsers, setReactionModalUsers] = useState([]);
  const [showOriginalEventModal, setShowOriginalEventModal] = useState(false);

  // Event specific states
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdminRepostsModal, setShowAdminRepostsModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showMyRepostModal, setShowMyRepostModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const textareaRef = useRef(null);
  const token = localStorage.getItem("token");
  const editKey = `draft-${post._id}`;
  const likeIconRef = useRef(null);

  // 🔌 Socket typing updates
  usePostSocket(post._id, currentUser, setSomeoneTyping, setPosts);

  const postRef = useRef(null);
  // 📦 Centralize all effects
  usePostEffects({
    post,
    currentUser,
    setEditContent,
    setHasLiked,
    editing,
    textareaRef,
    setSomeoneTyping,
    setPosts,
  });

  // 🎉 Like and reaction animation
  const { triggerLikeAnimation, triggerReactionEffect } = useEmojiAnimation(likeIconRef, post, currentUser);

  // 🔧 Actions related to the post (like, react, delete, edit)
  const {
    handleReact,
    handleEditSave,
    handleDelete,
    toggleEdit,
    handleBlurSave
  } = usePostActions({
    post,
    currentUser,
    setPosts,
    setEditing,
    editContent,
    setEditContent,
    setIsLiking,
    triggerLikeAnimation,
    triggerReactionEffect,
    hasLiked,
    setHasLiked,
  });

  const triggerDelete = () => {
    setShowDeleteConfirm(true);
  };

  // 💬 Actions related to comments
  const {
    handleComment,
    handleReply,
    handleEditComment,
    handleDeleteComment,
    handleEditReply,
    handleDeleteReply,
    handleReactToReply,
    handleReactToComment,
    handlePinComment,
  } = useCommentActions({
    post,
    comment,
    setComment,
    currentUser,
    setPosts,
    token,
    setShowCommentEmoji
  });

  const handlePinPost = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/posts/${post._id}/pin`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prevPosts) => prevPosts.map((p) => p._id === post._id ? { ...p, isPinned: data.isPinned } : p));
      }
    } catch (err) {
      console.error("Error pinning post:", err);
    }
  };

  const handleTipPost = async (amount) => {
    try {
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/posts/${post._id}/tip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`🎉 Sent ${amount} points to ${post.user?.name || "the author"}!`);
        // Optional: force update local point count if we had a global user context, 
        // but typically a refresh or gamification badge socket event handles it.
      } else {
        toast.error(data.message || "Failed to tip points");
      }
    } catch (err) {
      toast.error("Error tipping post");
    }
  };

  const openImage = (i) => {
    setStartIndex(i);
    setShowViewer(true);
  };

  /*const checkAuth = () => {
    if (!token) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
  };*/

  const getReactionCount = (emoji) => {
    const users = post.reactions?.[emoji];
    return Array.isArray(users) ? users.length : 0;
  };

  const userReacted = (emoji) => {
    const users = post.reactions?.[emoji];
    return Array.isArray(users) ? users.includes(currentUser._id) : false;
  };

  useEffect(() => {
    if (!postRef.current || !post._id || !currentUser?._id) return;

    // Check if we already viewed it
    if (post.viewedBy && post.viewedBy.includes(currentUser._id)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          triggerView(post._id);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(postRef.current);
    return () => observer.disconnect();
  }, [post._id, currentUser?._id, post.viewedBy]);

  const triggerView = async (postId) => {
    try {
      if (!token) return;
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/posts/${postId}/view`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) { }
  };

  const handleLoadMore = () => {
    const total = (post.comments || []).length;
    setVisibleComments((prev) => Math.min(prev + 5, total));
  };

  const sortedComments = React.useMemo(() => {
    const comments = post.comments || [];
    const pinned = comments.filter(c => c.isPinned);
    const unpinned = comments.filter(c => !c.isPinned);
    return [...pinned.slice().reverse(), ...unpinned.slice().reverse()];
  }, [post.comments]);

  const isMyPost = post.user?._id === currentUser._id;
  const isRestricted = !isMyPost && currentUser?.role !== 'admin';

  // ✅ Everything's clean and ready for the `return` section now.
  return (
    <div
      ref={postRef}
      className={`relative ${transparentBackground ? "" : (darkMode ? "bg-[#121213] shadow-none" : "bg-[#FAFAFA] shadow-[0_20px_60px_rgba(37,99,235,0.2)]")} ${transparentBackground ? "p-0" : "p-1.5 sm:p-2"} rounded-2xl sm:rounded-[2.5rem] transition-all duration-500`}
    >
      <div className={`p-[1.5px] sm:p-[2px] ${darkMode ? "bg-gradient-to-tr from-blue-900 to-purple-900" : "bg-gradient-to-tr from-blue-600 to-purple-700"} rounded-[calc(1rem)] sm:rounded-[2.4rem]`}>
        <div className={`relative rounded-[calc(1rem-2px)] sm:rounded-[2.3rem] p-2.5 sm:p-3 space-y-1.5 sm:space-y-2 transition-all duration-500 ${isMyPost ? (darkMode ? "bg-slate-800/50" : "bg-gradient-to-tr from-blue-50/50 to-white") : (darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]")} ${darkMode ? "text-white" : "text-gray-900"}`}>
          {post.isPinned && (
            <div className={`inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${darkMode ? "from-orange-500/20 via-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30" : "from-orange-100 via-pink-100 to-purple-100 text-pink-600 border border-pink-200"} shadow-sm`}>
              <span className="animate-bounce">📌</span> Pinned by Admin
            </div>
          )}
          <PostHeader {...{
            post, currentUser, editing, toggleEdit: () => {
              toggleEdit(editKey, (val) => {
                setEditContent(val);
                setEditTitle(post.title || "");
              }, editing, post.content);
            }, handleDelete: triggerDelete, handlePinPost, handleTipPost, darkMode, hideActions
          }} />

          {post.type === "Event" && post.title && !editing && (
            <h2 className={`text-base sm:text-xl font-bold mb-0 sm:mb-1 ${darkMode ? "text-white" : "text-gray-900"} tracking-tight leading-tight`}>
              {post.title}
            </h2>
          )}


          <PostContent
            {...{
              post,
              editing,
              editContent,
              setEditContent,
              editTitle,
              setEditTitle,
              handleEditSave: () => handleEditSave({ content: editContent, title: editTitle }),
              handleBlurSave,
              showEditEmoji,
              setShowEditEmoji,
              textareaRef,
              getEmojiFromUnified,
              setShowModal,
              darkMode
            }}
          />

          {post.type === "Session" && post.sessionDetails && (
            <div className={`mt-1 sm:mt-2 p-[1.5px] sm:p-[2px] rounded-xl sm:rounded-[2rem] bg-gradient-to-tr ${darkMode ? "from-orange-500/80 to-red-600/80" : "from-orange-400 to-red-500"} shadow-xl overflow-hidden`}>
              <div className={`p-2 sm:p-3 rounded-[calc(0.75rem-1.5px)] sm:rounded-[calc(2rem-2px)] ${darkMode ? "bg-slate-900/90 backdrop-blur-md" : "bg-white"} space-y-1.5 sm:space-y-2`}>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 sm:gap-y-3`}>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-orange-400/60" : "text-orange-600/60"}`}>College</span>
                    <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{post.sessionDetails.schoolOrCollege}</span>
                  </div>
                  {post.sessionDetails.campus && (
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-red-400/60" : "text-red-600/60"}`}>Campus</span>
                      <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{post.sessionDetails.campus}</span>
                    </div>
                  )}
                  <div className="flex flex-col pt-4 border-t border-dashed border-white/10">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-blue-400/60" : "text-blue-600/60"}`}>Date</span>
                    <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{new Date(post.sessionDetails.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col pt-4 border-t border-dashed border-white/10">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-purple-400/60" : "text-purple-600/60"}`}>Time</span>
                    <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{post.sessionDetails.time}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {post.type === "EventRepost" && post.eventRepostDetails && (
            <div className={`mt-1 sm:mt-2 p-[1.5px] sm:p-[2px] rounded-xl sm:rounded-[2rem] bg-gradient-to-tr ${darkMode ? "from-green-500/80 to-emerald-600/80" : "from-green-400 to-emerald-500"} shadow-xl overflow-hidden relative group/repost`}>
              <div className={`p-2 sm:p-3 rounded-[calc(0.75rem-1.5px)] sm:rounded-[calc(2rem-2px)] ${darkMode ? "bg-slate-900/90 backdrop-blur-md" : "bg-white"} flex flex-col space-y-2`}>
                <div className="flex justify-between items-start border-b border-dashed border-gray-200 dark:border-white/10 pb-2">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${darkMode ? "text-green-400/80" : "text-green-600/80"} flex items-center gap-2`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Linked Original Event
                    </span>
                    <span className={`text-lg sm:text-xl font-black ${darkMode ? "text-white" : "text-gray-900"} line-clamp-1`}>
                      {post.eventRepostDetails?.eventName || post.eventRepostDetails?.originalEventId?.title || "Event Attended"}
                    </span>
                  </div>
                  {post.eventRepostDetails?.originalEventId && (
                    <button
                      onClick={() => setShowOriginalEventModal(true)}
                      className={`flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md ${darkMode ? "bg-green-500/20 text-green-300 hover:bg-green-500/30" : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                        }`}
                    >
                      <span className="hidden sm:inline">View Original</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  )}
                </div>
                {((post.eventRepostDetails.campus && post.eventRepostDetails.campus !== "None") || post.eventRepostDetails.place || post.eventRepostDetails.date || post.eventRepostDetails.time) && (
                  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2`}>
                    {post.eventRepostDetails.campus && post.eventRepostDetails.campus !== "None" && (
                      <div className="flex flex-col">
                        <span className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${darkMode ? "text-white" : "text-black"} mb-1`}>Campus</span>
                        <span className={`text-xs sm:text-sm font-black ${darkMode ? "text-green-300" : "text-green-700"} truncate`}>{post.eventRepostDetails.campus}</span>
                      </div>
                    )}
                    {post.eventRepostDetails.place && (
                      <div className="flex flex-col">
                        <span className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${darkMode ? "text-white" : "text-black"} mb-1`}>Venue</span>
                        <span className={`text-xs sm:text-sm font-black ${darkMode ? "text-green-300" : "text-green-700"} truncate`}>{post.eventRepostDetails.place}</span>
                      </div>
                    )}
                    {post.eventRepostDetails.date && (
                      <div className="flex flex-col">
                        <span className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${darkMode ? "text-white" : "text-black"} mb-1`}>Date Attended</span>
                        <span className={`text-xs sm:text-sm font-black ${darkMode ? "text-green-300" : "text-green-700"} truncate`}>{new Date(post.eventRepostDetails.date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {post.eventRepostDetails.time && (
                      <div className="flex flex-col">
                        <span className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${darkMode ? "text-white" : "text-black"} mb-1`}>Time Attended</span>
                        <span className={`text-xs sm:text-sm font-black ${darkMode ? "text-green-300" : "text-green-700"} truncate`}>{post.eventRepostDetails.time}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {post.type === "Event" && (
            <div className="mt-1 sm:mt-2 p-[1.5px] sm:p-[2px] rounded-xl sm:rounded-[2rem] bg-gradient-to-tr from-blue-500 to-purple-600 shadow-xl overflow-hidden">
              <div className={`p-2 sm:p-3 rounded-[calc(0.75rem-1.5px)] sm:rounded-[calc(2rem-2px)] ${darkMode ? "bg-slate-900/90" : "bg-white"} space-y-1.5 sm:space-y-2`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-blue-400/60" : "text-blue-600/60"}`}>Start</span>
                    <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{new Date(post.startDate).toLocaleDateString()} at {post.startTime}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-purple-400/60" : "text-purple-600/60"}`}>Ends</span>
                    <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{new Date(post.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="sm:col-span-2 flex flex-col pt-4 border-t border-dashed border-gray-200 dark:border-white/10">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-red-400/60" : "text-red-600/60"}`}>
                      {post.eventType === "no_registration" ? "Reposting Deadline" : "Registration Deadline"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">⏰</span>
                      <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{post.registrationCloseDate ? new Date(post.registrationCloseDate).toLocaleString() : "N/A"}</span>
                    </div>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="sm:col-span-2 flex flex-wrap gap-2 pt-4 border-t border-dashed border-gray-200 dark:border-white/10">
                      {post.tags.map((tag, i) => (
                        <span key={i} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${darkMode ? "bg-white/10 text-gray-300" : "bg-black/5 text-gray-700"}`}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {post.pointsAssigned > 0 && (
                    <div className="sm:col-span-2 flex flex-col pt-4 border-t border-dashed border-gray-200 dark:border-white/10">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-green-400/60" : "text-green-600/60"}`}>Points Assigned</span>
                      <span className={`text-sm font-black ${darkMode ? "text-green-400" : "text-green-600"}`}>+{post.pointsAssigned} PTS</span>
                    </div>
                  )}
                </div>

                {post.documents && post.documents.length > 0 && (
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-blue-400/60" : "text-blue-600/60"}`}>Attached Documents</span>
                    <div className="flex flex-col gap-2">
                      {post.documents.map((doc, idx) => (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadFileSilently(doc.url, doc.original_filename);
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer ${darkMode ? "bg-[#1A1A1B] border-white/10 hover:border-blue-500/50" : "bg-white border-gray-200 hover:border-blue-300"}`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-xl shrink-0">📄</span>
                            <span className={`text-xs font-bold truncate ${darkMode ? "text-white" : "text-gray-800"}`}>
                              {doc.original_filename || `Document ${idx + 1}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shrink-0 ${darkMode ? "bg-white/10 text-white" : "bg-gray-100 text-gray-600"}`}>
                              {doc.format || "FILE"}
                            </span>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2 items-start sm:items-center justify-between border-t border-white/5 pt-6">
                  <div className="flex items-center gap-4">
                    {(currentUser?.isAdmin || currentUser?.role === 'faculty' || post.user?._id === currentUser?._id) ? (
                      <>
                        {post.eventType !== "no_registration" && (
                          <button
                            onClick={() => setShowAdminModal(true)}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all hover:scale-105"
                          >
                            View Registrations
                          </button>
                        )}
                        {post.eventType === "no_registration" && (
                          <button
                            onClick={() => setShowAdminRepostsModal(true)}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all hover:scale-105"
                          >
                            View Reposts
                          </button>
                        )}
                        {post.showRegistrationInsights && (
                          <div className={`p-[1.5px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm hover:shadow-md transition-all duration-300`}>
                            <div className={`flex items-center gap-3 px-5 py-2.5 rounded-[14.5px] transition-all duration-300 ${darkMode ? "bg-slate-900" : "bg-white"}`}>
                              <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 text-xs shadow-lg transform -rotate-3">
                                👥
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-[8px] font-black uppercase tracking-[0.3em] leading-tight ${darkMode ? "text-blue-400" : "text-blue-600"} opacity-70`}>Live Insight</span>
                                <span className={`text-[11px] font-black uppercase tracking-widest leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                                  {post.eventType === "no_registration" ? "Reposted: " : "Registered: "}
                                  <span className={darkMode ? "text-blue-400" : "text-blue-600"}>{post.eventType === "no_registration" ? (post.repostCount || 0) : (post.registrationCount || 0)}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      currentUser?.role === 'student' && (
                        post.eventType === "no_registration" ? (
                          (() => {
                            const deadlinePassed = Date.now() > new Date(post.registrationCloseDate).getTime();
                            // Assuming backend populates currentUser with eventPointsAwarded or similar, or we just trust the UI
                            const alreadyClaimed = currentUser?.eventPointsAwarded?.includes(post._id);

                            if (alreadyClaimed || post.myRepostId) {
                              return (
                                <div className="flex flex-col items-center gap-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-green-500 italic bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                                    Already Reposted
                                  </span>
                                  {post.myRepostId && (
                                    <>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setShowMyRepostModal(true); }} 
                                        className="px-5 py-2 mt-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:scale-105 flex items-center gap-1.5 z-50 relative"
                                        style={{ pointerEvents: 'auto' }}
                                      >
                                        <span>🔗</span> View Your Repost
                                      </button>
                                      {showMyRepostModal && (
                                        <div onClick={(e) => e.stopPropagation()}>
                                          <SmartPostModal
                                            post={{ _id: post.myRepostId, type: "EventRepost" }}
                                            currentUser={currentUser}
                                            showModal={showMyRepostModal}
                                            setShowModal={setShowMyRepostModal}
                                            darkMode={darkMode}
                                          />
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            } else if (deadlinePassed) {
                              return (
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500 italic bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">
                                  Deadline Passed (48h)
                                </span>
                              );
                            } else {
                              return (
                                <button
                                  onClick={() => setShowRepostModal(true)}
                                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105`}
                                >
                                  Repost & Claim Points
                                </button>
                              );
                            }
                          })()
                        ) : (
                          Date.now() < new Date(post.registrationCloseDate) ? (
                            <button
                              onClick={() => setShowRegistrationModal(true)}
                              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${post.isRegistered ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105"}`}
                            >
                              {post.isRegistered ? "Edit Registration" : "Register Now"}
                            </button>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 italic bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">
                              Registration Closed
                            </span>
                          )
                        )
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {post.type === "Announcement" && (post.announcementDetails?.originalEventId || post.announcementDetails?.eventName) && (
            <div className={`mt-1 sm:mt-2 p-[1.5px] sm:p-[2px] rounded-xl sm:rounded-[2rem] bg-gradient-to-tr ${darkMode ? "from-blue-500/80 to-purple-600/80" : "from-blue-400 to-purple-500"} shadow-xl overflow-hidden relative`}>
              <div className={`p-2 sm:p-3 rounded-[calc(0.75rem-1.5px)] sm:rounded-[calc(2rem-2px)] ${darkMode ? "bg-slate-900/90 backdrop-blur-md" : "bg-white"} flex flex-col space-y-2`}>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${darkMode ? "text-blue-400/80" : "text-blue-600/80"} flex items-center gap-2`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {post.announcementDetails?.originalEventId ? "Linked Original Event" : "Event"}
                    </span>
                    <span className={`text-lg sm:text-xl font-black ${darkMode ? "text-white" : "text-gray-900"} line-clamp-1`}>
                      {post.announcementDetails.eventName || post.announcementDetails.originalEventId?.title || "Announcement Event"}
                    </span>
                  </div>
                  {post.announcementDetails?.originalEventId && (
                    <button
                      onClick={() => setShowOriginalEventModal(true)}
                      className={`flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md ${darkMode ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30" : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                        }`}
                    >
                      <span className="hidden sm:inline">View Original</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {post.type === "Announcement" && post.announcementDetails?.isWinnerAnnouncement && (
            <div className={`mt-2 p-3 rounded-[2rem] border ${darkMode ? "bg-blue-500/5 border-blue-500/20" : "bg-blue-50 border-blue-100"}`}>
              <h3 className={`text-base font-black mb-2 flex items-center gap-2 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
                <span>🏆</span> Event Winners
              </h3>
              <div className="space-y-3">
                {(() => {
                  const groupedWinners = (post.announcementDetails.winners || []).reduce((acc, current) => {
                    if (current.groupId) {
                      const existing = acc.find(g => g.groupId === current.groupId);
                      if (existing) {
                        existing.members.push(current);
                      } else {
                        acc.push({
                          groupId: current.groupId,
                          groupName: current.groupName,
                          members: [current],
                          type: 'group',
                          rank: current.rank,
                          points: current.points
                        });
                      }
                    } else {
                      acc.push({ ...current, type: 'individual' });
                    }
                    return acc;
                  }, []);

                  return groupedWinners.map((entry, gidx) => (
                    <div key={gidx} className={`p-[2px] rounded-3xl shadow-xl ${entry.type === 'group' ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}>
                      <div className={`rounded-[calc(1.5rem-2px)] overflow-hidden ${darkMode ? "bg-slate-900/90" : "bg-white"}`}>
                        {entry.type === 'group' && (
                          <div className={`${darkMode ? "bg-slate-800/80" : "bg-orange-50/50"} px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🏆</span>
                              <span className={`text-sm font-black uppercase tracking-[0.2em] ${darkMode ? "text-orange-400" : "text-orange-600"}`}>
                                {entry.groupName || "Team Achievement"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                                 entry.rank == 1 ? "bg-gradient-to-r from-yellow-300 to-yellow-600 text-black shadow-[0_0_15px_rgba(253,224,71,0.6)] animate-pulse" :
                                 entry.rank == 2 ? "bg-gradient-to-r from-gray-300 to-gray-400 text-black shadow-[0_0_15px_rgba(209,213,219,0.5)]" :
                                 entry.rank == 3 ? "bg-gradient-to-r from-orange-400 to-orange-700 text-white shadow-[0_0_15px_rgba(251,146,60,0.5)]" :
                                 (darkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700")
                               }`}>
                                Rank: {entry.rank}
                              </span>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${darkMode ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700"}`}>
                                +{entry.points} PTS
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {entry.type === 'individual' && (
                          <div className={`${darkMode ? "bg-slate-800/80" : "bg-blue-50/50"} px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b ${darkMode ? "border-white/10" : "border-blue-100"}`}>
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🌟</span>
                              <span className={`text-xs font-black uppercase tracking-[0.2em] ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                                {entry.groupName || "Individual Achievement"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                                 entry.rank == 1 ? "bg-gradient-to-r from-yellow-300 to-yellow-600 text-black shadow-[0_0_15px_rgba(253,224,71,0.6)] animate-pulse" :
                                 entry.rank == 2 ? "bg-gradient-to-r from-gray-300 to-gray-400 text-black shadow-[0_0_15px_rgba(209,213,219,0.5)]" :
                                 entry.rank == 3 ? "bg-gradient-to-r from-orange-400 to-orange-700 text-white shadow-[0_0_15px_rgba(251,146,60,0.5)]" :
                                 (darkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700")
                               }`}>
                                Rank: {entry.rank}
                              </span>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${darkMode ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700"}`}>
                                +{entry.points} PTS
                              </span>
                            </div>
                          </div>
                        )}

                        <div className={`${entry.type === 'group' ? 'flex flex-col' : 'p-0'}`}>
                          {(entry.type === 'group' ? entry.members : [entry]).map((member, midx, arr) => (
                            <div key={midx} className="flex flex-col w-full">
                              <div className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${darkMode ? "hover:bg-white/5" : "hover:bg-gray-50/50"}`}>
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className="p-[2px] rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-md flex-shrink-0 relative">
                                    {(() => {
                                      const isAdmin = currentUser?.role === 'admin' || currentUser?.isAdmin || currentUser?.isMainAdmin || currentUser?.email === "manishdeorari377@gmail.com";
                                      const isRestricted = !isAdmin;
                                      return (
                                        <>
                                          <div className={`w-10 h-10 rounded-full overflow-hidden ${darkMode ? "bg-slate-700" : "bg-gray-100"}`}>
                                            <UserAvatar
                                              user={typeof member.userId === 'object' ? member.userId : member}
                                              src={member.profilePicture || member.userId?.profilePicture}
                                              alt={member.name}
                                              width={40}
                                              height={40}
                                              wrapperClassName="w-full h-full"
                                              className={`w-full h-full object-cover ${isRestricted ? "select-none pointer-events-none" : ""}`}
                                              onContextMenu={(e) => { if (isRestricted) e.preventDefault(); }}
                                              onDragStart={(e) => { if (isRestricted) e.preventDefault(); }}
                                            />
                                          </div>
                                          {isRestricted && (
                                            <div
                                              className="absolute inset-0 z-10 cursor-pointer rounded-full"
                                              onContextMenu={(e) => e.preventDefault()}
                                            />
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                  <div className="flex flex-col min-w-0 w-full mt-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      {member.userId?.publicId ? (
                                        <UserNameWithBadge 
                                          user={member.userId}
                                          href={`/profile/${member.userId.publicId}`} 
                                          className={`font-black text-[13px] truncate hover:text-blue-500 transition-colors ${darkMode ? "text-white" : "text-black"}`}
                                        />
                                      ) : (
                                        <UserNameWithBadge 
                                          user={member.userId || member}
                                          className={`font-black text-[13px] truncate ${darkMode ? "text-white" : "text-black"}`}
                                        />
                                      )}
                                      {member.userId && <span className="text-[9px] bg-green-500 text-white px-2 py-0.5 rounded-full font-black flex-shrink-0 tracking-widest shadow-sm">MATCHED</span>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4 text-left">
                                      <div className="flex flex-col">
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] text-orange-500`}>Enrollment No.</span>
                                        <span className={`text-[11px] font-black tracking-tighter ${darkMode ? "text-white" : "text-black"}`}>
                                          {member.userId?.enrollmentNumber || member.enrollmentNumber || "-"}
                                        </span>
                                      </div>
                                      {(member.userId?.course || member.course) && (
                                        <div className="flex flex-col">
                                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] text-orange-500`}>Course</span>
                                          <span className={`text-[11px] font-black tracking-tighter ${darkMode ? "text-white" : "text-black"}`}>
                                            {member.userId?.course || member.course}
                                          </span>
                                        </div>
                                      )}
                                      {(member.userId?.branch || member.branch) && (
                                        <div className="flex flex-col">
                                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] text-orange-500`}>Branch</span>
                                          <span className={`text-[11px] font-black tracking-tighter ${darkMode ? "text-white" : "text-black"}`}>
                                            {member.userId?.branch || member.branch}
                                          </span>
                                        </div>
                                      )}
                                      {(member.userId?.semester || member.semester) && (
                                        <div className="flex flex-col">
                                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] text-orange-500`}>Semester</span>
                                          <span className={`text-[11px] font-black tracking-tighter ${darkMode ? "text-white" : "text-black"}`}>
                                            {member.userId?.semester || member.semester}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {entry.type === 'group' && (
                                  <div className="flex flex-col sm:items-end justify-center">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-white" : "text-black"}`}>
                                      {midx === 0 ? "Captain" : "Member"}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {entry.type === 'group' && midx !== arr.length - 1 && (
                                <div className={`h-[1px] w-full bg-gradient-to-r from-transparent ${darkMode ? "via-orange-500/30" : "via-orange-500/20"} to-transparent`} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
              {post.announcementDetails.pointsRequested && post.announcementDetails.pointsStatus === "pending" && (
                <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 italic">
                  <span className="animate-pulse">●</span> Points Approval Pending by Admin
                </div>
              )}
              {post.announcementDetails.pointsStatus === "approved" && (
                <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500 italic">
                  <span>✅</span> Points Awarded to Student
                </div>
              )}
            </div>
          )}

          <PostMedia
            post={post}
            currentUser={currentUser}
            setSelectedImage={(index) => {
              setStartIndex(index);
              setShowViewer(true);
            }}
            darkMode={darkMode}
          />

          {!hideActions && (
            <>
              {/* Gradient Separator before Reactions */}
              <div className={`h-[2px] w-full bg-gradient-to-r from-transparent ${darkMode ? "via-blue-500/30" : "via-blue-600/50"} to-transparent my-2`} />

              <PostReactions
                {...{
                  post,
                  hasLiked,
                  handleReact,
                  userReacted,
                  getReactionCount,
                  setShowModal,
                  likeIconRef,
                  isLiking,
                  setVisibleComments,
                  setReactionEffect,
                  reactionEffect,
                  showComments,
                  setShowComments,
                  setShowReactionModal,
                  setReactionModalEmoji,
                  setReactionModalUsers,
                  darkMode
                }}
              />


              <CommentInput
                comment={comment}
                setComment={setComment}
                onEmojiClick={(emoji) => setComment((prev) => prev + emoji)}
                onSubmit={() => handleComment(comment)} // ✅ Correct
                showCommentEmoji={showCommentEmoji}
                setShowCommentEmoji={setShowCommentEmoji}
                typing={someoneTyping}
                isTyping={(val) => setSomeoneTyping(val)}
                darkMode={darkMode}
              />

              {someoneTyping && (
                <p className={`text-xs ${darkMode ? "text-white" : "text-white"} mt-1 ml-2 italic`}>
                  Someone is typing...
                </p>
              )}

              {/* Gradient Separator after Comment Input */}
              {showComments && (
                <div className={`h-[2px] w-full bg-gradient-to-r from-transparent ${darkMode ? "via-purple-500/30" : "via-purple-600/50"} to-transparent my-4`} />
              )}

              {showComments && (
                <div className="pt-2 space-y-3">
                  {sortedComments
                    .slice(0, visibleComments)
                    .map((c) => (
                      <CommentCard
                        key={c._id}
                        comment={c}
                        currentUser={currentUser}
                        onReply={handleReply}
                        onDelete={handleDeleteComment}
                        onEdit={handleEditComment}
                        replies={c.replies || []}
                        postId={post._id}
                        onEditReply={handleEditReply}
                        onDeleteReply={handleDeleteReply}
                        onReactToReply={handleReactToReply}
                        onReactToComment={handleReactToComment}
                        onPinComment={handlePinComment}
                        isPostOwner={post.user?._id === currentUser?._id || post.user === currentUser?._id}
                        darkMode={darkMode}
                      />
                    ))}

                  <div className="flex justify-center items-center gap-4 mt-4 mb-2">
                    {(post.comments || []).length > visibleComments && (
                      <button
                        onClick={handleLoadMore}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border ${darkMode ? "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20" : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"}`}
                      >
                        Load more comments
                      </button>
                    )}

                    {visibleComments > 2 && (
                      <button
                        onClick={() => setVisibleComments(2)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border ${darkMode ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}
                      >
                        Show less
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <AnimatePresence>
            {showModal && (
              <SmartPostModal
                post={post}
                currentUser={currentUser}
                showModal={showModal}
                setShowModal={setShowModal}
                darkMode={darkMode}
                onPostUpdate={() => {
                  if (setPosts) {
                    setPosts((prev) => prev.filter((p) => p._id !== post._id));
                  }
                }}
              />
            )}
          </AnimatePresence>

          {showViewer && (
            <FullImageViewer
              images={post.images?.length > 0 ? post.images.map((img) => img.url) : (post.image ? [post.image] : [])}
              startIndex={startIndex}
              onClose={() => setShowViewer(false)}
              isRestricted={isRestricted}
            />
          )}

          {showReactionModal && (
            <ReactionModal
              emoji={reactionModalEmoji}
              users={reactionModalUsers}
              onClose={() => setShowReactionModal(false)}
            />
          )}

          {post.eventType !== "no_registration" && (
            <EventRegistrationModal
              isOpen={showRegistrationModal}
              onClose={() => setShowRegistrationModal(false)}
              event={post}
              currentUser={currentUser}
              darkMode={darkMode}
              onRegisterSuccess={(newRegistration) => {
                if (setPosts) {
                  setPosts(prev => prev.map(p =>
                    p._id === post._id
                      ? { ...p, isRegistered: true, myRegistration: newRegistration, registrationCount: (p.registrationCount || 0) + (newRegistration.isGroup ? newRegistration.groupMembers.length + 1 : 1) }
                      : p
                  ));
                }
              }}
            />
          )}

          {post.eventType === "no_registration" && (
            <CreateEventRepostModal
              isOpen={showRepostModal}
              onClose={() => setShowRepostModal(false)}
              event={post}
              currentUser={currentUser}
              darkMode={darkMode}
              setPosts={setPosts}
            />
          )}

          {showAdminModal && (
            <AdminRegistrationsModal
              event={post}
              isOpen={showAdminModal}
              onClose={() => setShowAdminModal(false)}
              darkMode={darkMode}
              currentUser={currentUser}
            />
          )}
          {showAdminRepostsModal && (
            <AdminRepostsModal
              event={post}
              isOpen={showAdminRepostsModal}
              onClose={() => setShowAdminRepostsModal(false)}
              darkMode={darkMode}
              currentUser={currentUser}
            />
          )}
          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            title={post.type === "Event" ? "Delete Event?" : (post.type === "Announcement" ? "Delete Announcement?" : "Delete Post?")}
            message={`Are you sure you want to delete this ${post.type?.toLowerCase() || 'post'}? This action cannot be undone and all comments will be lost.`}
            confirmText="Delete Now"
            darkMode={darkMode}
          />
        </div>
      </div>

      <AnimatePresence>
        {showOriginalEventModal && (() => {
          const origEvent = post.eventRepostDetails?.originalEventId || post.announcementDetails?.originalEventId;
          const origId = origEvent?._id || origEvent?.id || origEvent;
          if (!origId) return null;
          const origPost = {
            _id: origId,
            type: "Event",
            title: origEvent?.title || "",
            content: origEvent?.description || origEvent?.content || "",
            user: typeof origEvent?.createdBy === "object" ? origEvent.createdBy : (post.user || {}),
          };
          return (
            <SmartPostModal
              showModal={showOriginalEventModal}
              setShowModal={setShowOriginalEventModal}
              post={origPost}
              currentUser={currentUser}
              darkMode={darkMode}
            />
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
