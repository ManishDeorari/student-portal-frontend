"use client";
import React, { useState } from "react";
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
import EventRegistrationModal from "../EventRegistrationModal";
import AdminRegistrationsModal from "../AdminRegistrationsModal";
import CreateEventRepostModal from "../CreateEventRepostModal";
import ConfirmationModal from "./ConfirmationModal";
import { downloadFileSilently } from "../../../utils/cloudinaryHelper";
import UserAvatar from "../../ui/UserAvatar";
import UserNameWithBadge from "../../ui/UserNameWithBadge";
import { Eye } from "lucide-react";

export default function PostModal(props) {
  const {
    showModal, setShowModal, post, currentUser, handleReact, getReactionCount, userReacted,
    reactionEffect, setReactionEffect, showThread, setShowThread, handleReply,
    handleDeleteComment, handleComment, handleEditComment, handleEditReply, handleDeleteReply,
    handleReactToReply, handleReactToComment, handlePinComment, comment, setComment,
    editing, setEditing, editContent, setEditContent, editTitle, setEditTitle,
    handleEditSave, handleBlurSave, toggleEdit, handleDelete, showEditEmoji, setShowEditEmoji,
    textareaRef, setShowViewer, setStartIndex, hasLiked, isLiking, likeIconRef,
    darkMode = false, setPosts, hideInteractions = false, onShowOriginalEvent
  } = props;

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const editKey = `draft-${post?._id}`;

  if (!showModal || !post) return null;

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
            onClick={() => setShowModal(false)}
            className={`absolute top-6 right-6 p-2 rounded-full ${darkMode ? "bg-white/10 text-white hover:bg-white/20" : "bg-black/5 text-gray-600 hover:bg-black/10"} transition-all z-10`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="mb-4 pr-12">
            <PostHeader
              post={post}
              currentUser={currentUser}
              editing={editing}
              toggleEdit={(editContentFunc, isEditing, originalContent) => toggleEdit(editKey, editContentFunc, isEditing, originalContent)}
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
          </div>

          {post.type === "Event" && (
            <div className="mt-1 sm:mt-2 p-[1.5px] sm:p-[2px] rounded-xl sm:rounded-[2rem] bg-gradient-to-tr from-blue-500 to-purple-600 shadow-xl overflow-hidden mb-6">
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
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shrink-0 ${darkMode ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-600"}`}>
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

          {/* Event Repost Link */}
          {post.type === "EventRepost" && post.eventRepostDetails && (
            <div className={`mt-2 mb-4 p-[1.5px] sm:p-[2px] rounded-xl sm:rounded-[2rem] bg-gradient-to-tr ${darkMode ? "from-green-500/80 to-emerald-600/80" : "from-green-400 to-emerald-500"} shadow-xl overflow-hidden relative`}>
              <div className={`p-2 sm:p-3 rounded-[calc(0.75rem-1.5px)] sm:rounded-[calc(2rem-2px)] ${darkMode ? "bg-slate-900/90 backdrop-blur-md" : "bg-white"} flex flex-col space-y-2`}>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${darkMode ? "text-green-400/80" : "text-green-600/80"} flex items-center gap-2`}>
                      Linked Original Event
                    </span>
                    <span className={`text-lg sm:text-xl font-black ${darkMode ? "text-white" : "text-gray-900"} line-clamp-1`}>
                      {post.eventRepostDetails.eventName || post.eventRepostDetails.originalEventId?.title || "Event Attended"}
                    </span>
                  </div>
                  {post.eventRepostDetails.originalEventId && onShowOriginalEvent && (
                    <button
                      onClick={onShowOriginalEvent}
                      className={`flex-shrink-0 flex items-center justify-center w-auto h-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md ${darkMode ? "bg-green-500/20 text-green-300 hover:bg-green-500/30" : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"}`}
                      title="View Original"
                    >
                      <Eye className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">View Original</span>
                    </button>
                  )}
                </div>
                
                {/* Details */}
                {((post.eventRepostDetails.campus && post.eventRepostDetails.campus !== "None") || post.eventRepostDetails.place || post.eventRepostDetails.date || post.eventRepostDetails.time) && (
                  <div className={`mt-2 p-2 sm:p-3 rounded-xl border ${darkMode ? "bg-[#0f172a] border-slate-800" : "bg-gray-50 border-gray-100"} flex flex-wrap gap-x-4 gap-y-2`}>
                    {post.eventRepostDetails.date && (
                      <div className="flex flex-col">
                        <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Date Attended</span>
                        <span className={`text-xs sm:text-sm font-black ${darkMode ? "text-green-300" : "text-green-700"} truncate`}>{new Date(post.eventRepostDetails.date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {post.eventRepostDetails.time && (
                      <div className="flex flex-col">
                        <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Time Attended</span>
                        <span className={`text-xs sm:text-sm font-black ${darkMode ? "text-green-300" : "text-green-700"} truncate`}>{post.eventRepostDetails.time}</span>
                      </div>
                    )}
                    {post.eventRepostDetails.campus && post.eventRepostDetails.campus !== "None" && (
                      <div className="flex flex-col">
                        <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Campus</span>
                        <span className={`text-xs sm:text-sm font-black ${darkMode ? "text-green-300" : "text-green-700"} truncate`}>{post.eventRepostDetails.campus}</span>
                      </div>
                    )}
                    {post.eventRepostDetails.place && (
                      <div className="flex flex-col">
                        <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Place</span>
                        <span className={`text-xs sm:text-sm font-black ${darkMode ? "text-green-300" : "text-green-700"} truncate`}>{post.eventRepostDetails.place}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Original Event Link for Announcements */}
          {post.type === "Announcement" && (post.announcementDetails?.originalEventId || post.announcementDetails?.eventName) && (
            <div className={`mt-2 mb-4 p-[1.5px] sm:p-[2px] rounded-xl sm:rounded-[2rem] bg-gradient-to-tr ${darkMode ? "from-blue-500/80 to-purple-600/80" : "from-blue-400 to-purple-500"} shadow-xl overflow-hidden relative`}>
              <div className={`p-2 sm:p-3 rounded-[calc(0.75rem-1.5px)] sm:rounded-[calc(2rem-2px)] ${darkMode ? "bg-slate-900/90 backdrop-blur-md" : "bg-white"} flex flex-col space-y-2`}>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${darkMode ? "text-blue-400/80" : "text-blue-600/80"} flex items-center gap-2`}>
                      {post.announcementDetails?.originalEventId ? "Linked Original Event" : "Event"}
                    </span>
                    <span className={`text-lg sm:text-xl font-black ${darkMode ? "text-white" : "text-gray-900"} line-clamp-1`}>
                      {post.announcementDetails.eventName || post.announcementDetails.originalEventId?.title || "Announcement Event"}
                    </span>
                  </div>
                  {post.announcementDetails?.originalEventId && onShowOriginalEvent && (
                    <button
                      onClick={onShowOriginalEvent}
                      className={`flex-shrink-0 flex items-center justify-center gap-1.5 w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md ${darkMode ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30" : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"}`}
                      title="View Original"
                    >
                      <Eye className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">View Original</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Media (moved below event repost and announcement links) */}
          {post.images && post.images.length > 0 && (
            <div className="mb-6">
              <PostMedia
                post={post}
                currentUser={currentUser}
                darkMode={darkMode}
                setSelectedImage={setStartIndex}
              />
            </div>
          )}

          {/* Winners Section for Announcements */}
          {post.type === "Announcement" && post.announcementDetails?.isWinnerAnnouncement && (
            <div className={`mt-2 p-3 rounded-[2rem] border ${darkMode ? "bg-blue-500/5 border-blue-500/20" : "bg-blue-50 border-blue-100"}`}>
              <h3 className={`text-base font-black mb-2 flex items-center gap-2 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
                <span>🏆</span> Event Winners
              </h3>
              <div className="space-y-3">
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
                          <div className={`${darkMode ? "bg-blue-600/20" : "bg-blue-50"} px-3 sm:px-4 py-2 border-b border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2`}>
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
                              {entry.points > 0 && (
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${darkMode ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-700"}`}>
                                  {entry.points} pts
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        <div className={`p-2 sm:p-3 ${entry.type === 'group' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3' : ''}`}>
                          {(entry.type === 'group' ? entry.members : [entry]).map((member, midx) => (
                            <div key={midx} className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 gap-2 sm:gap-3 rounded-2xl ${darkMode ? "bg-[#0f172a]/50 border border-slate-800" : "bg-white border border-gray-100 shadow-sm"}`}>
                              <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                                <Link href={`/profile/${member.userId?.publicId || member.userId?._id || member.userId?.id || member.userId || ''}`}>
                                  <div className="flex items-center justify-center aspect-square w-fit h-fit relative p-[1px] bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full cursor-pointer hover:scale-105 transition-transform">
                                    <UserAvatar
                                      user={typeof member.userId === 'object' ? member.userId : null}
                                      src={member.profilePicture || member.userId?.profilePicture}
                                      alt={member.name || member.userId?.name || "User"}
                                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white object-cover"
                                    />
                                  </div>
                                </Link>
                                <div className="flex flex-col min-w-0 w-full mt-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {member.userId?.publicId ? (
                                      <UserNameWithBadge 
                                        user={member.userId}
                                        href={`/profile/${member.userId.publicId}`} 
                                        className={`font-black text-sm truncate hover:text-blue-500 transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}
                                      />
                                    ) : (
                                      <UserNameWithBadge 
                                        user={member.userId || member}
                                        className={`font-black text-sm truncate ${darkMode ? "text-white" : "text-gray-900"}`}
                                      />
                                    )}
                                    {member.userId && <span className="text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">MATCHED</span>}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 text-left">
                                    <div className="flex flex-col">
                                      <span className={`text-[8px] font-black uppercase tracking-widest opacity-100 ${darkMode ? "text-white" : "text-black"}`}>Enrollment No.</span>
                                      <span className={`text-[10px] font-black font-mono tracking-tighter ${darkMode ? "text-white" : "text-black"}`}>
                                        {member.userId?.enrollmentNumber || member.enrollmentNumber || "-"}
                                      </span>
                                    </div>
                                    {(member.userId?.course || member.course) && (
                                      <div className="flex flex-col border-l border-white/10 pl-3">
                                        <span className={`text-[8px] font-black uppercase tracking-widest opacity-100 ${darkMode ? "text-white" : "text-black"}`}>Course</span>
                                        <span className={`text-[10px] font-black ${darkMode ? "text-white" : "text-black"}`}>
                                          {member.userId?.course || member.course}
                                        </span>
                                      </div>
                                    )}
                                    {(member.userId?.branch || member.branch) && (
                                      <div className="flex flex-col border-l border-white/10 pl-3">
                                        <span className={`text-[8px] font-black uppercase tracking-widest opacity-100 ${darkMode ? "text-white" : "text-black"}`}>Branch</span>
                                        <span className={`text-[10px] font-black ${darkMode ? "text-white" : "text-black"}`}>
                                          {member.userId?.branch || member.branch}
                                        </span>
                                      </div>
                                    )}
                                    {(member.userId?.semester || member.semester) && (
                                      <div className="flex flex-col border-l border-white/10 pl-3">
                                        <span className={`text-[8px] font-black uppercase tracking-widest opacity-100 ${darkMode ? "text-white" : "text-black"}`}>Semester</span>
                                        <span className={`text-[10px] font-black ${darkMode ? "text-white" : "text-black"}`}>
                                          {member.userId?.semester || member.semester}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {entry.type === 'individual' && (
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end pl-[56px] sm:pl-0 mt-1 sm:mt-0 pt-2 sm:pt-0 border-t border-black/5 dark:border-white/5 sm:border-t-0">
                                  <div className="flex flex-col items-start sm:items-end">
                                    <span className={`text-[8px] font-black uppercase opacity-100 mb-0.5 ${darkMode ? "text-white" : "text-black"}`}>Rank</span>
                                    <span className={`text-sm font-black ${darkMode ? "text-blue-300" : "text-blue-700"}`}>{entry.rank}</span>
                                  </div>
                                  <div className="flex flex-col items-start sm:items-end border-l border-black/10 dark:border-white/10 pl-3">
                                    <span className={`text-[8px] font-black uppercase opacity-100 mb-0.5 ${darkMode ? "text-white" : "text-black"}`}>Points</span>
                                    <span className={`text-sm font-black ${darkMode ? "text-purple-300" : "text-purple-600"}`}>+{entry.points}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Reactions */}
          {!hideInteractions && (
            <>
              <PostReactions
                post={post}
                currentUser={currentUser}
                handleReact={handleReact}
                getReactionCount={getReactionCount}
                userReacted={userReacted}
                hasLiked={hasLiked}
                isLiking={isLiking}
                likeIconRef={likeIconRef}
                darkMode={darkMode}
              />
              <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
                <CommentInput
                  comment={comment}
                  setComment={setComment}
                  handleComment={handleComment}
                  currentUser={currentUser}
                  darkMode={darkMode}
                />
                <div className="mt-6 space-y-4">
                  {(post.comments || []).map((c) => (
                    <CommentCard
                      key={c._id || Math.random()}
                      comment={c}
                      currentUser={currentUser}
                      post={post}
                      handleReply={handleReply}
                      handleDeleteComment={handleDeleteComment}
                      handleEditComment={handleEditComment}
                      handleEditReply={handleEditReply}
                      handleDeleteReply={handleDeleteReply}
                      handleReactToReply={handleReactToReply}
                      handleReactToComment={handleReactToComment}
                      handlePinComment={handlePinComment}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </div>
            </>
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

          <ConfirmationModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={() => {
              if (handleDelete) handleDelete();
              setShowModal(false);
            }}
            title="Delete Post?"
            message="Are you sure you want to delete this post?"
            darkMode={darkMode}
          />
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
