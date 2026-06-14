"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Subcomponents
import PostHeader from "./Visual/PostHeader";
import PostContent from "./Visual/PostContent";
import PostMedia from "./Visual/PostMedia";
import { getOptimizedImageUrl } from "../../utils/cloudinaryHelper";
import PostReactions from "./Visual/PostReactions";
import dynamic from "next/dynamic";
const PostModal = dynamic(() => import("./Visual/PostModal"), { ssr: false });
import CommentInput from "./Visual/CommentInput";
const CommentCard = dynamic(() => import("./Visual/commentCard"), { ssr: false });
import EventRegistrationModal from "./EventRegistrationModal";
import AdminRegistrationsModal from "./AdminRegistrationsModal";
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
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const textareaRef = useRef(null);
  const token = localStorage.getItem("token");
  const editKey = `draft-${post._id}`;
  const likeIconRef = useRef(null);

  // 🔌 Socket typing updates
  usePostSocket(post._id, currentUser, setSomeoneTyping, setPosts);

  // 📦 Centralize all effects
  const postRef = usePostEffects({
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
      className={`relative ${transparentBackground ? "" : (darkMode ? "bg-[#121213] shadow-none" : "bg-[#FAFAFA] shadow-[0_20px_60px_rgba(37,99,235,0.2)]")} ${transparentBackground ? "p-0" : "p-2 sm:p-3"} rounded-2xl sm:rounded-[2.5rem] transition-all duration-500`}
    >
      <div className={`p-[1.5px] sm:p-[2px] sm:p-[2.5px] ${darkMode ? "bg-gradient-to-tr from-blue-900 to-purple-900" : "bg-gradient-to-tr from-blue-600 to-purple-700"} rounded-[calc(1rem)] sm:rounded-[2.4rem]`}>
        <div className={`relative rounded-[calc(1rem-2px)] sm:rounded-[2.3rem] p-2 sm:p-4 space-y-2 sm:space-y-4 transition-all duration-500 ${isMyPost ? (darkMode ? "bg-slate-800/50" : "bg-gradient-to-tr from-blue-50/50 to-white") : (darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]")} ${darkMode ? "text-white" : "text-gray-900"}`}>
          <PostHeader {...{
            post, currentUser, editing, toggleEdit: () => {
              toggleEdit(editKey, (val) => {
                setEditContent(val);
                setEditTitle(post.title || "");
              }, editing, post.content);
            }, handleDelete: triggerDelete, darkMode, hideActions
          }} />

          {post.type === "Event" && post.title && !editing && (
            <h2 className={`text-lg sm:text-2xl font-black mb-1 sm:mb-2 ${darkMode ? "text-white" : "text-gray-900"} tracking-tight leading-tight`}>
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
            <div className={`mt-3 sm:mt-6 p-[1.5px] sm:p-[2px] rounded-xl sm:rounded-[2rem] bg-gradient-to-tr ${darkMode ? "from-orange-500/80 to-red-600/80" : "from-orange-400 to-red-500"} shadow-xl overflow-hidden`}>
              <div className={`p-3 sm:p-6 rounded-[calc(0.75rem-1.5px)] sm:rounded-[calc(2rem-2px)] ${darkMode ? "bg-slate-900/90 backdrop-blur-md" : "bg-white"} space-y-3 sm:space-y-6`}>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 sm:gap-y-6`}>
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
            <div className={`mt-3 sm:mt-6 p-[1.5px] sm:p-[2px] rounded-xl sm:rounded-[2rem] bg-gradient-to-tr ${darkMode ? "from-green-500/80 to-emerald-600/80" : "from-green-400 to-emerald-500"} shadow-xl overflow-hidden relative group/repost`}>
              <div className={`p-4 sm:p-6 rounded-[calc(0.75rem-1.5px)] sm:rounded-[calc(2rem-2px)] ${darkMode ? "bg-slate-900/90 backdrop-blur-md" : "bg-white"} flex flex-col space-y-4`}>
                <div className="flex justify-between items-start border-b border-dashed border-gray-200 dark:border-white/10 pb-4">
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
                      className={`flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md ${
                        darkMode ? "bg-green-500/20 text-green-300 hover:bg-green-500/30" : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
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
            <div className="mt-3 sm:mt-6 p-[1.5px] sm:p-[2px] rounded-xl sm:rounded-[2rem] bg-gradient-to-tr from-blue-500 to-purple-600 shadow-xl overflow-hidden">
              <div className={`p-3 sm:p-6 rounded-[calc(0.75rem-1.5px)] sm:rounded-[calc(2rem-2px)] ${darkMode ? "bg-slate-900/90" : "bg-white"} space-y-3 sm:space-y-6`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                        <a 
                          key={idx} 
                          href={doc.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.01] ${darkMode ? "bg-[#1A1A1B] border-white/10 hover:border-blue-500/50" : "bg-white border-gray-200 hover:border-blue-300"}`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-xl shrink-0">📄</span>
                            <span className={`text-xs font-bold truncate ${darkMode ? "text-white" : "text-gray-800"}`}>
                              {doc.original_filename || `Document ${idx + 1}`}
                            </span>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shrink-0 ${darkMode ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-600"}`}>
                            {doc.format || "FILE"}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2 items-start sm:items-center justify-between border-t border-white/5 pt-6">
                  <div className="flex items-center gap-4">
                    {(currentUser?.isAdmin || currentUser?.role === 'faculty' || post.user?._id === currentUser?._id) ? (
                      post.eventType !== "no_registration" && (
                      <>
                        <button
                          onClick={() => setShowAdminModal(true)}
                          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all hover:scale-105"
                        >
                          View Registrations
                        </button>
                        {post.showRegistrationInsights && (
                          <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-300 ${darkMode ? "bg-blue-500/10 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]" : "bg-blue-50 border-blue-100 shadow-sm"}`}>
                            <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 text-xs shadow-lg transform -rotate-3">
                              👥
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-[8px] font-black uppercase tracking-[0.3em] leading-tight ${darkMode ? "text-blue-400" : "text-blue-600"} opacity-70`}>Live Insight</span>
                              <span className={`text-[11px] font-black uppercase tracking-widest leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                                Registered: <span className={darkMode ? "text-blue-400" : "text-blue-600"}>{post.registrationCount || 0}</span>
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                      )
                    ) : (
                      currentUser?.role === 'student' && (
                        post.eventType === "no_registration" ? (
                          (() => {
                            const eventEndTime = new Date(post.endDate).getTime();
                            const nowTime = Date.now();
                            const deadlinePassed = nowTime > eventEndTime + (48 * 60 * 60 * 1000); // 48 hours after end
                            // Assuming backend populates currentUser with eventPointsAwarded or similar, or we just trust the UI
                            const alreadyClaimed = currentUser?.eventPointsAwarded?.includes(post._id);

                            if (alreadyClaimed) {
                              return (
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-500 italic bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                                  Points Claimed
                                </span>
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
            <div className={`mt-3 sm:mt-6 p-[1.5px] sm:p-[2px] rounded-xl sm:rounded-[2rem] bg-gradient-to-tr ${darkMode ? "from-blue-500/80 to-purple-600/80" : "from-blue-400 to-purple-500"} shadow-xl overflow-hidden relative`}>
              <div className={`p-4 sm:p-6 rounded-[calc(0.75rem-1.5px)] sm:rounded-[calc(2rem-2px)] ${darkMode ? "bg-slate-900/90 backdrop-blur-md" : "bg-white"} flex flex-col space-y-4`}>
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
                    className={`flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md ${
                      darkMode ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30" : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
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
            <div className={`mt-6 p-6 rounded-[2.5rem] border ${darkMode ? "bg-blue-500/5 border-blue-500/20" : "bg-blue-50 border-blue-100"}`}>
              <h3 className={`text-xl font-black mb-4 flex items-center gap-2 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
                <span>🏆</span> Event Winners
              </h3>
              <div className="space-y-4">
                {(() => {
                  const groupedWinners = post.announcementDetails.winners.reduce((acc, current) => {
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
                    <div key={gidx} className="p-[2px] rounded-[2rem] bg-gradient-to-tr from-blue-500 to-purple-600 shadow-xl">
                      <div className={`rounded-[calc(2rem-2px)] overflow-hidden ${darkMode ? "bg-slate-900/90" : "bg-white"}`}>
                        {entry.type === 'group' && (
                          <div className={`${darkMode ? "bg-blue-600/20" : "bg-blue-50"} px-4 sm:px-6 py-3 border-b border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2`}>
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🏆</span>
                              <span className={`text-xs font-black uppercase tracking-[0.2em] ${darkMode ? "text-blue-300" : "text-blue-800"}`}>
                                {entry.groupName || "Team Achievement"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${darkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
                                Rank: {entry.rank}
                              </span>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${darkMode ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700"}`}>
                                +{entry.points} PTS
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="divide-y divide-white/5">
                          {(entry.type === 'group' ? entry.members : [entry]).map((member, midx) => (
                            <div key={midx} className={`p-4 flex items-center justify-between gap-4 transition-colors ${darkMode ? "hover:bg-white/5" : "hover:bg-blue-50/50"}`}>
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className="p-[1px] rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 shadow-lg flex-shrink-0 relative">
                                    {(() => {
                                      const isAdmin = currentUser?.role === 'admin' || currentUser?.isAdmin || currentUser?.isMainAdmin || currentUser?.email === "manishdeorari377@gmail.com";
                                      const isRestricted = !isAdmin;
                                      return (
                                        <>
                                          <img
                                            src={getOptimizedImageUrl(member.profilePicture || member.userId?.profilePicture || "/default-profile.jpg")}
                                            alt={member.name}
                                            className={`w-10 h-10 rounded-full object-cover border-2 border-white/10 ${isRestricted ? "select-none pointer-events-none" : ""}`}
                                            onError={(e) => { e.target.src = "/default-profile.jpg"; }}
                                            onContextMenu={(e) => { if (isRestricted) e.preventDefault(); }}
                                            onDragStart={(e) => { if (isRestricted) e.preventDefault(); }}
                                          />
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
                                    <div className="flex items-center gap-2 mb-1">
                                      {member.userId?.publicId ? (
                                        <Link href={`/profile/${member.userId.publicId}`} className={`font-black text-sm truncate hover:text-blue-500 transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}>
                                          {member.name}
                                        </Link>
                                      ) : (
                                        <span className={`font-black text-sm truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{member.name}</span>
                                      )}
                                      {member.userId && <span className="text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">MATCHED</span>}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-left">
                                      <div className="flex flex-col">
                                         <span className={`text-[8px] font-black uppercase tracking-widest opacity-40 ${darkMode ? "text-white" : "text-black"}`}>Enrollment No.</span>
                                         <span className={`text-[10px] font-bold font-mono tracking-tighter ${darkMode ? "text-blue-200" : "text-blue-600"}`}>
                                           {member.userId?.enrollmentNumber || member.enrollmentNumber || "-"}
                                         </span>
                                      </div>
                                      {(member.userId?.course || member.course) && (
                                        <div className="flex flex-col border-l border-white/10 pl-3">
                                           <span className={`text-[8px] font-black uppercase tracking-widest opacity-40 ${darkMode ? "text-white" : "text-black"}`}>Course</span>
                                           <span className={`text-[10px] font-bold ${darkMode ? "text-blue-200" : "text-blue-600"}`}>
                                             {member.userId?.course || member.course}
                                           </span>
                                        </div>
                                      )}
                                      {(member.userId?.semester || member.semester) && (
                                        <div className="flex flex-col border-l border-white/10 pl-3">
                                           <span className={`text-[8px] font-black uppercase tracking-widest opacity-40 ${darkMode ? "text-white" : "text-black"}`}>Semester</span>
                                           <span className={`text-[10px] font-bold ${darkMode ? "text-blue-200" : "text-blue-600"}`}>
                                             {member.userId?.semester || member.semester}
                                           </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                              {entry.type === 'individual' && (
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col items-end">
                                    <span className={`text-[8px] font-black uppercase opacity-40 mb-0.5 ${darkMode ? "text-white" : "text-black"}`}>Rank</span>
                                    <span className={`text-sm font-black ${darkMode ? "text-blue-300" : "text-blue-700"}`}>{entry.rank}</span>
                                  </div>
                                  <div className="flex flex-col items-end border-l border-white/10 pl-3">
                                    <span className={`text-[8px] font-black uppercase opacity-40 mb-0.5 ${darkMode ? "text-white" : "text-black"}`}>Points</span>
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-black ${darkMode ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700"}`}>+{entry.points}</span>
                                  </div>
                                </div>
                              )}

                              {entry.type === 'group' && (
                                <span className={`text-[8px] font-black uppercase tracking-widest opacity-30 ${darkMode ? "text-white" : "text-black"}`}>
                                  {midx === 0 ? "Captain" : "Member"}
                                </span>
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
                <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"} mt-1 ml-2 italic`}>
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

                  {(post.comments || []).length > visibleComments && (
                    <button
                      onClick={handleLoadMore}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Load more comments
                    </button>
                  )}

                  {visibleComments > 2 && (
                    <button
                      onClick={() => setVisibleComments(2)}
                      className="mt-1 text-sm text-red-500 hover:underline"
                    >
                      Show less comments
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          <AnimatePresence>
            {showModal && (
              <PostModal
                {...{
                  post,
                  currentUser,
                  showModal,
                  setShowModal,
                  toggleEdit,
                  handleReact,
                  userReacted,
                  getReactionCount,
                  showThread,
                  setShowThread,
                  handleReply,
                  handleDeleteComment,
                  handleComment,
                  handleEditComment,
                  handleEditReply,
                  handleDeleteReply,
                  handleReactToReply,
                  handlePinComment,
                  comment,
                  setComment,
                  editing,
                  setEditing,
                  editContent,
                  setEditContent,
                  editTitle,
                  setEditTitle,
                  handleEditSave: () => handleEditSave({ content: editContent, title: editTitle }),
                  handleBlurSave,
                  toggleEdit,
                  handleDelete,
                  showEditEmoji,
                  setShowEditEmoji,
                  textareaRef,
                  // ✅ ADD THESE for FullImageViewer support
                  setShowViewer,
                  setStartIndex,
                  darkMode,
                  setPosts,
                  handleReactToComment,
                  hideInteractions: hideActions
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
        {showOriginalEventModal && (
          <PostModal
            showModal={showOriginalEventModal}
            setShowModal={setShowOriginalEventModal}
            post={{
              ...(post.eventRepostDetails?.originalEventId || post.announcementDetails?.originalEventId),
              type: "Event",
              content: (post.eventRepostDetails?.originalEventId || post.announcementDetails?.originalEventId)?.description,
              user: typeof (post.eventRepostDetails?.originalEventId || post.announcementDetails?.originalEventId)?.createdBy === "object"
                ? (post.eventRepostDetails?.originalEventId || post.announcementDetails?.originalEventId)?.createdBy
                : post.user
            }}
            currentUser={currentUser}
            darkMode={darkMode}
            hideInteractions={true}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
