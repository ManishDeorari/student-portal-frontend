"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import UserAvatar from "../../ui/UserAvatar";
import ImageViewerModal from "../../profile/ImageViewerModal";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { GamificationBadge } from "../../../../utils/gamification";
import UserNameWithBadge from "../../ui/UserNameWithBadge";

export default function PostHeader({ post, currentUser, editing, toggleEdit, handleDelete, handlePinPost, handleTipPost, darkMode = false, hideActions = false }) {
  const [showViewer, setShowViewer] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const profileImg = post.user?.profilePicture || "/default-profile.jpg";
  const isOwn = currentUser && (currentUser._id === (post.user?._id || post.user) || currentUser.id === (post.user?._id || post.user));
  const isAdmin = currentUser?.role === 'admin' || currentUser?.isAdmin || currentUser?.isMainAdmin || currentUser?.email === "manishdeorari377@gmail.com";
  const isRestricted = !isOwn && !isAdmin;

  const canEdit = (post.user?._id || post.user) === (currentUser?._id || currentUser);
  const canDelete = canEdit || currentUser?.role === 'admin' || currentUser?.isAdmin || currentUser?.isMainAdmin || currentUser?.email === "manishdeorari377@gmail.com";

  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 sm:w-12 sm:h-12">
        <UserAvatar
          user={post.user}
          src={profileImg}
          alt="User profile"
          width={48}
          height={48}
          wrapperClassName="w-full h-full"
          onContextMenu={(e) => isRestricted && e.preventDefault()}
          onDragStart={(e) => isRestricted && e.preventDefault()}
          className={`rounded-full border-2 ${darkMode ? "border-blue-500" : "border-black"} object-cover w-full h-full cursor-pointer hover:scale-110 transition-transform ${isRestricted ? 'select-none pointer-events-none' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowViewer(true);
          }}
        />
        {/* Protective Overlay */}
        {isRestricted && (
          <div
            className="absolute inset-0 z-10 cursor-pointer rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setShowViewer(true);
            }}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-black text-sm sm:text-base flex items-center gap-1.5 flex-wrap ${darkMode ? "text-white" : "text-gray-900"}`}>
          {isOwn ? (
            <UserNameWithBadge 
              user={post.user} 
              className="max-w-[150px]" 
            />
          ) : (
            <UserNameWithBadge 
              user={post.user} 
              href={`/profile/${post.user?.publicId || post.user?._id}`}
              className={`max-w-[150px] ${darkMode ? "text-blue-400 decoration-blue-500" : "text-blue-700 decoration-blue-400"}`} 
            />
          )}
          {post.user?.role !== 'admin' && post.user?.role !== 'mainAdmin' && post.user?.role !== 'faculty' && (
            <GamificationBadge points={post.user?.points?.total} />
          )}
          {isOwn && (
            <span className={`text-[10px] px-1.5 py-[1px] rounded-full font-bold flex-shrink-0 ${darkMode ? "bg-blue-600/30 text-blue-300 border border-blue-500/30" : "bg-blue-100 text-blue-600"}`}>
              You
            </span>
          )}
          {post.type && post.type !== "Regular" && (
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-black flex-shrink-0 border ${post.type === "Session" ? (darkMode ? "bg-green-600/30 text-green-300 border-green-500/30" : "bg-green-100 text-green-600 border-transparent") :
              post.type === "Event" ? (darkMode ? "bg-orange-600/30 text-orange-300 border-orange-500/30" : "bg-orange-100 text-orange-600 border-transparent") :
                (darkMode ? "bg-red-600/30 text-red-300 border-red-500/30" : "bg-red-100 text-red-600 border-transparent")
              }`}>
              {post.type}
            </span>
          )}
        </div>
        <p className={`text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"} mt-0.5 truncate`}>{new Date(post.createdAt).toLocaleString()}</p>
      </div>
      
      {!hideActions && (isAdmin || canEdit || canDelete) && (
        <div className="relative ml-auto" ref={dropdownRef}>
          <div className="relative p-[1.5px] rounded-full bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-500 shadow-md transition-transform hover:scale-110 active:scale-95">
            <button
              onClick={() => setShowDropdown(prev => !prev)}
              className={`w-7 h-7 rounded-full flex items-center justify-center ${darkMode ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-gray-900 hover:bg-gray-50"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                <circle cx="12" cy="5" r="2.25" />
                <circle cx="12" cy="12" r="2.25" />
                <circle cx="12" cy="19" r="2.25" />
              </svg>
            </button>
          </div>
          
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 z-50 p-[2px] rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl"
              >
                <div className={`w-40 rounded-[10px] backdrop-blur-md p-1 flex flex-col h-full ${darkMode ? "bg-slate-900/95 text-white" : "bg-white/95 text-gray-800"}`}>
                {isAdmin && (
                  <button
                    onClick={() => {
                      handlePinPost && handlePinPost();
                      setShowDropdown(false);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors ${darkMode ? "hover:bg-white/10 text-blue-400" : "hover:bg-black/5 text-blue-600"}`}
                  >
                    <span>📌</span> {post.isPinned ? "Unpin Post" : "Pin Post"}
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => {
                      toggleEdit();
                      setShowDropdown(false);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors ${darkMode ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-gray-800"}`}
                  >
                    <span>✏️</span> {editing ? "Cancel Edit" : "Edit Post"}
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <span>🗑️</span> Delete Post
                  </button>
                )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {showViewer && (
        <ImageViewerModal
          imageUrl={profileImg}
          onClose={() => setShowViewer(false)}
          isRestricted={isRestricted}
        />
      )}
    </div>
  );
}

