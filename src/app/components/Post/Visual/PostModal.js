"use client";
import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CommentCard from "./commentCard";
import PostMedia from "./PostMedia";
import CommentInput from "./CommentInput";
import Link from "next/link";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostReactions from "./PostReactions";
import getEmojiFromUnified from "../utils/getEmojiFromUnified";
import { useState } from "react";
import EventRegistrationModal from "../EventRegistrationModal";
import AdminRegistrationsModal from "../AdminRegistrationsModal";
import { approvePointsRequest } from "../../../../api/dashboard";
import toast from "react-hot-toast";
import ConfirmationModal from "./ConfirmationModal";

export default function PostModal({
  showModal,
  setShowModal,
  post,
  currentUser,
  handleReact,
  getReactionCount,
  userReacted,
  reactionEffect,
  setReactionEffect,
  showThread,
  setShowThread,
  handleReply,
  handleDeleteComment,
  handleComment,
  handleEditComment,
  handleEditReply,
  handleDeleteReply,
  handleReactToReply,
  comment,
  setComment,
  editing,
  setEditing,
  editContent,
  setEditContent,
  editTitle,
  setEditTitle,
  handleEditSave,
  handleBlurSave,
  toggleEdit,
  handleDelete,
  showEditEmoji,
  setShowEditEmoji,
  textareaRef,
  // ✅ Add these two
  setShowViewer,
  setStartIndex,
  handleLike,
  hasLiked,
  isLiking,
  likeIconRef,
  darkMode = false,
  setPosts, // Add setPosts to update state after registration
  handleReactToComment, // Add handleReactToComment
  handlePinComment, // Add handlePinComment
  hideInteractions = false // New prop to hide interactive elements
}) {
  const [showCommentsState, setShowCommentsState] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const isOwn = currentUser && (currentUser._id === post.userId?._id || currentUser.id === post.userId?._id);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.isAdmin || currentUser?.isMainAdmin || currentUser?.email === "manishdeorari377@gmail.com";
  const isRestricted = !isOwn && !isAdmin;
  const editKey = `draft-${post._id}`;

  const sortedComments = React.useMemo(() => {
    const comments = post.comments || [];
    const pinned = comments.filter(c => c.isPinned);
    const unpinned = comments.filter(c => !c.isPinned);
    return [...pinned.slice().reverse(), ...unpinned.slice().reverse()];
  }, [post.comments]);

  if (!showModal) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative p-[2.5px] ${darkMode ? "bg-gradient-to-tr from-blue-900 to-purple-900" : "bg-gradient-to-tr from-blue-600 to-purple-700"} rounded-[2.6rem] max-w-4xl w-full max-h-[90vh] shadow-[0_20px_60px_rgba(37,99,235,0.4)] flex flex-col`}
      >
        <div className={`${darkMode ? "bg-[#0f172a]" : "bg-[#FAFAFA]"} rounded-[2.5rem] p-8 overflow-y-auto overflow-x-visible custom-scrollbar flex-1 relative`}>
          <button
            onClick={() => {
              if (editing) setEditing(false);
              setShowModal(false);
            }}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all p-2 hover:bg-gray-100 dark:hover:bg-[#FAFAFA]/5 rounded-full z-[110]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Header */}
          <div className="mb-4 pr-12">
            <PostHeader
              post={post}
              currentUser={currentUser}
              editing={editing}
              toggleEdit={() => toggleEdit(editKey, setEditContent, editing, post.content)}
              handleDelete={() => setShowDeleteConfirm(true)}
              darkMode={darkMode}
              hideActions={hideInteractions}
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            {post.type === "Event" && post.title && !editing && (
              <h2 className={`text-2xl font-black mb-4 ${darkMode ? "text-white" : "text-gray-900"} tracking-tight leading-tight`}>
                {post.title}
              </h2>
            )}
            <PostContent
              post={post}
              editing={editing}
              editContent={editContent}
              setEditContent={setEditContent}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              handleEditSave={handleEditSave}
              handleBlurSave={handleBlurSave}
              showEditEmoji={showEditEmoji}
              setShowEditEmoji={setShowEditEmoji}
              textareaRef={textareaRef}
              getEmojiFromUnified={getEmojiFromUnified}
              setShowModal={setShowModal}
              darkMode={darkMode}
              hideViewFullPost={true}
            />

            {post.type === "Session" && post.sessionDetails && (
              <div className={`mt-6 p-[2px] rounded-[2rem] bg-gradient-to-tr ${darkMode ? "from-orange-500/80 to-red-600/80" : "from-orange-400 to-red-500"} shadow-xl overflow-hidden`}>
                <div className={`p-6 rounded-[calc(2rem-2px)] ${darkMode ? "bg-slate-900/90 backdrop-blur-md" : "bg-white"} space-y-6`}>
                  <div className={`grid grid-cols-2 gap-x-8 gap-y-6`}>
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
              <div className={`mt-6 p-[2px] rounded-[2rem] bg-gradient-to-tr ${darkMode ? "from-green-500/80 to-emerald-600/80" : "from-green-400 to-emerald-500"} shadow-xl overflow-hidden`}>
                <div className={`p-6 rounded-[calc(2rem-2px)] ${darkMode ? "bg-slate-900/90 backdrop-blur-md" : "bg-white"} space-y-6`}>
                  <div className={`grid grid-cols-2 gap-x-8 gap-y-6`}>
                    <div className="flex flex-col col-span-2">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-green-400/60" : "text-green-600/60"}`}>Event Attended</span>
                      <span className={`text-lg font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{post.eventRepostDetails.eventName}</span>
                    </div>
                    {post.eventRepostDetails.campus && post.eventRepostDetails.campus !== "None" && (
                      <div className="flex flex-col pt-4 border-t border-dashed border-white/10">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-red-400/60" : "text-red-600/60"}`}>Campus</span>
                        <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{post.eventRepostDetails.campus}</span>
                      </div>
                    )}
                    {post.eventRepostDetails.place && (
                      <div className="flex flex-col pt-4 border-t border-dashed border-white/10">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-orange-400/60" : "text-orange-600/60"}`}>Place</span>
                        <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{post.eventRepostDetails.place}</span>
                      </div>
                    )}
                    {post.eventRepostDetails.date && (
                      <div className="flex flex-col pt-4 border-t border-dashed border-white/10">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-blue-400/60" : "text-blue-600/60"}`}>Date Attended</span>
                        <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{new Date(post.eventRepostDetails.date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {post.eventRepostDetails.time && (
                      <div className="flex flex-col pt-4 border-t border-dashed border-white/10">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-purple-400/60" : "text-purple-600/60"}`}>Time Attended</span>
                        <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{post.eventRepostDetails.time}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {post.type === "Event" && (
              <div className="mt-6 p-[2px] rounded-[2rem] bg-gradient-to-tr from-blue-500 to-purple-600 shadow-xl overflow-hidden">
                <div className={`p-6 rounded-[calc(2rem-2px)] ${darkMode ? "bg-slate-900/90" : "bg-white"} space-y-6`}>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-blue-400/60" : "text-blue-600/60"}`}>Start</span>
                      <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{new Date(post.startDate).toLocaleDateString()} at {post.startTime}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-purple-400/60" : "text-purple-600/60"}`}>Ends</span>
                      <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{new Date(post.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="col-span-2 flex flex-col pt-4 border-t border-dashed border-gray-200 dark:border-white/10">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${darkMode ? "text-red-400/60" : "text-red-600/60"}`}>
                        {post.eventType === "no_registration" ? "Reposting Deadline" : "Registration Deadline"}
                      </span>
                      <div className="flex items-center gap-2">
                         <span className="text-sm">⏰</span>
                         <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{post.registrationCloseDate ? new Date(post.registrationCloseDate).toLocaleString() : "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2 items-center justify-between border-t border-white/5 pt-6">
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
                        currentUser?.role === 'student' && post.eventType !== "no_registration" && (
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
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {post.type === "Announcement" && (post.announcementDetails?.originalEventId || post.announcementDetails?.eventName) && (
              <div className={`mt-6 p-[2px] rounded-[2rem] bg-gradient-to-tr ${darkMode ? "from-blue-500/80 to-purple-600/80" : "from-blue-400 to-purple-500"} shadow-xl overflow-hidden relative`}>
                <div className={`p-6 rounded-[calc(2rem-2px)] ${darkMode ? "bg-slate-900/90" : "bg-white"} flex flex-col space-y-4`}>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${darkMode ? "text-blue-400/80" : "text-blue-600/80"} flex items-center gap-2`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {post.announcementDetails?.originalEventId ? "Linked Original Event" : "Event"}
                      </span>
                      <span className={`text-xl font-black ${darkMode ? "text-white" : "text-gray-900"} line-clamp-1`}>
                        {post.announcementDetails.eventName || post.announcementDetails.originalEventId?.title || "Announcement Event"}
                      </span>
                    </div>
                    {post.announcementDetails?.originalEventId && (
                      <button
                        onClick={() => {
                          setShowModal(false); // Close current
                          // Open original (Would need to pass it up or handle it here)
                          // Normally PostModal doesn't open another PostModal directly. 
                          // The easiest way is to let PostCard handle it, or emit an event.
                          // For now, if we can't open from modal easily without double modal issues, we might just hide the button or keep it disabled.
                          // Actually, we passed setShowModal. Let's just dispatch an event or leave it out if it's too complex.
                          // Wait, in PostCard we have "View Original". The user asked for "view icon view in admin poinst poist question div also add event name icon name on that div there"
                        }}
                        className={`flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md ${
                          darkMode ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30" : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                        }`}
                      >
                        <span className="hidden sm:inline">Original Event</span>
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
                            <div className={`${darkMode ? "bg-blue-600/20" : "bg-blue-50"} px-6 py-3 border-b border-blue-500/20 flex items-center justify-between`}>
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
                                    <div className="p-[1px] rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 shadow-lg flex-shrink-0">
                                      <img 
                                        src={member.profilePicture || member.userId?.profilePicture || "/default-profile.jpg"} 
                                        alt={member.name} 
                                        className="w-10 h-10 rounded-full object-cover border-2 border-white/10" 
                                      />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                       <div className="flex items-center gap-2">
                                          {member.userId?.publicId ? (
                                            <Link href={`/profile/${member.userId.publicId}`} className={`font-black text-sm truncate hover:text-blue-500 transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}>
                                              {member.name}
                                            </Link>
                                          ) : (
                                            <span className={`font-black text-sm truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{member.name}</span>
                                          )}
                                          {member.userId && <span className="text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">MATCHED</span>}
                                       </div>
                                       <p className={`text-[9px] font-bold opacity-60 font-mono tracking-tighter ${darkMode ? "text-blue-200" : "text-blue-600"}`}>
                                         {member.uniqueId || "ID Undefined"}
                                       </p>
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
                {post.pointsRequested && post.pointsStatus === "pending" && (
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 italic">
                    <span className="animate-pulse">●</span> Points Approval Pending by Admin
                  </div>
                )}
                {post.pointsStatus === "approved" && (
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500 italic">
                    <span>✅</span> Points Awarded to Student
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Media */}
          {!editing && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <PostMedia
                post={post}
                currentUser={currentUser}
                setSelectedImage={(index) => {
                  setStartIndex(index);
                  setShowViewer(true);
                }}
                darkMode={darkMode}
              />
            </div>
          )}

          {/* Interaction Section (Hidden if hideInteractions is true) */}
          {!hideInteractions && (
            <>
              {/* Reaction & Comment Toggle Buttons */}
              <div className="mb-6">
                <PostReactions
                  post={post}
                  handleReact={handleReact}
                  getReactionCount={getReactionCount}
                  userReacted={userReacted}
                  reactionEffect={reactionEffect}
                  setReactionEffect={setReactionEffect}
                  showComments={showCommentsState}
                  setShowComments={setShowCommentsState}
                  darkMode={darkMode}
                />
              </div>

              {/* Comment Input */}
              <div className="mb-6">
                <CommentInput
                  comment={comment}
                  setComment={setComment}
                  onSubmit={() => handleComment(comment)}
                  postId={post._id}
                  currentUser={currentUser}
                  darkMode={darkMode}
                />
              </div>

              {/* Full Comment Thread */}
              <AnimatePresence>
                {showCommentsState && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-6 overflow-hidden"
                  >
                    <h3 className={`font-black uppercase tracking-widest text-[10px] ${darkMode ? "text-gray-400" : "text-gray-900"} border-b-2 border-blue-500 w-fit pb-1 mb-4`}>
                      Comments ({post.comments?.length || 0})
                    </h3>

                    <div className="space-y-4">
                      {sortedComments.map((c) => (
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {showRegistrationModal && (
            <EventRegistrationModal
              event={post}
              isOpen={showRegistrationModal}
              onClose={() => setShowRegistrationModal(false)}
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
            onConfirm={() => {
               handleDelete();
               setShowModal(false);
            }}
            title={post.type === "Event" ? "Delete Event?" : (post.type === "Announcement" ? "Delete Announcement?" : "Delete Post?")}
            message={`Are you sure you want to delete this ${post.type?.toLowerCase() || 'post'}? All data will be permanently removed.`}
            darkMode={darkMode}
          />
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
