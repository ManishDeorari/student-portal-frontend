"use client";
import React, { useState } from "react";
import Image from "next/image";
import ImageViewerModal from "../../profile/ImageViewerModal";
import Link from "next/link";

export default function PostHeader({ post, currentUser, editing, toggleEdit, handleDelete, darkMode = false, hideActions = false }) {
  const [showViewer, setShowViewer] = useState(false);
  const profileImg = post.user?.profilePicture || "/default-profile.jpg";
  const isSelf = post.user?._id === currentUser?._id;
  const isRestricted = !isSelf && currentUser?.role !== 'admin';

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-9 h-9 sm:w-12 sm:h-12">
        <Image
          src={profileImg}
          alt="User profile"
          width={48}
          height={48}
          onContextMenu={(e) => isRestricted && e.preventDefault()}
          onDragStart={(e) => isRestricted && e.preventDefault()}
          className={`rounded-full border-2 ${darkMode ? "border-blue-500" : "border-black"} object-cover w-full h-full cursor-pointer hover:scale-110 transition-transform ${isRestricted ? 'select-none' : ''}`}
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
        <div className={`font-semibold flex items-center gap-1 flex-wrap ${darkMode ? "text-white" : "text-gray-900"}`}>
          {isSelf ? (
            <span className="truncate max-w-[150px]">{post.user?.name || "Unknown"}</span>
          ) : (
            <Link
              href={`/profile/${post.user?.publicId || post.user?._id}`}
              className={`hover:underline truncate max-w-[150px] ${darkMode ? "text-blue-400 decoration-blue-500" : "text-blue-700 decoration-blue-400"} decoration-2 transition-colors cursor-pointer`}
            >
              {post.user?.name || "Unknown"}
            </Link>
          )}
          {isSelf && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${darkMode ? "bg-blue-600/30 text-blue-300 border border-blue-500/30" : "bg-blue-100 text-blue-600"}`}>
              You
            </span>
          )}
          {post.type && post.type !== "Regular" && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 border ${post.type === "Session" ? (darkMode ? "bg-green-600/30 text-green-300 border-green-500/30" : "bg-green-100 text-green-600 border-transparent") :
              post.type === "Event" ? (darkMode ? "bg-orange-600/30 text-orange-300 border-orange-500/30" : "bg-orange-100 text-orange-600 border-transparent") :
                (darkMode ? "bg-red-600/30 text-red-300 border-red-500/30" : "bg-red-100 text-red-600 border-transparent")
              }`}>
              {post.type}
            </span>
          )}
        </div>
        <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-500"} truncate`}>{new Date(post.createdAt).toLocaleString()}</p>
      </div>

      {!hideActions && (
        <div className="ml-auto flex gap-2">
          {((post.user?._id || post.user) === (currentUser?._id || currentUser)) && (
            <button onClick={toggleEdit} className={`${darkMode ? "text-blue-400" : "text-blue-600"} text-sm hover:underline font-bold`}>
              {editing ? "Cancel" : "Edit"}
            </button>
          )}
          {(((post.user?._id || post.user) === (currentUser?._id || currentUser)) || currentUser?.role === 'admin' || currentUser?.isAdmin || currentUser?.isMainAdmin) && (
            <button onClick={handleDelete} className={`${darkMode ? "text-red-400" : "text-red-600"} text-sm hover:underline font-bold`}>
              Delete
            </button>
          )}
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
