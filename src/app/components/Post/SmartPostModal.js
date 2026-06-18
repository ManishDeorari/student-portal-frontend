"use client";
import React, { useState, useEffect, useRef } from "react";
import PostModal from "./Visual/PostModal";

// Hooks
import usePostSocket from "./hooks/usePostSocket";
import usePostEffects from "./hooks/usePostEffects";
import usePostActions from "./hooks/usePostActions";
import useEmojiAnimation from "./hooks/useEmojiAnimation";
import useCommentActions from "./hooks/useCommentActions";
import getEmojiFromUnified from "./utils/getEmojiFromUnified";

export default function SmartPostModal({ 
  post: initialPost, 
  currentUser, 
  showModal, 
  setShowModal, 
  onPostUpdate,
  darkMode = false 
}) {
  // We wrap the initial post in an array to simulate a feed for the hooks
  const [posts, setPosts] = useState([initialPost]);
  const post = posts[0]; // The current updated post

  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post?.content || "");
  const [editTitle, setEditTitle] = useState(post?.title || "");
  const [showEditEmoji, setShowEditEmoji] = useState(false);
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const [comment, setComment] = useState("");
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [reactionEffect, setReactionEffect] = useState(null);

  const textareaRef = useRef(null);
  const likeIconRef = useRef(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const [showOriginalEventModal, setShowOriginalEventModal] = useState(false);

  // Fetch full post on mount to guarantee populated data (fixes "unknown user" in comments)
  useEffect(() => {
    if (!initialPost || !showModal || !initialPost._id) return;
    
    const fetchFullPost = async () => {
      try {
        const isEvent = initialPost.type === "Event";
        const endpoint = isEvent ? `/api/events/${initialPost._id}` : `/api/posts/${initialPost._id}`;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        const res = await fetch(`${API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const fullPost = await res.json();
          setPosts([fullPost]);
        }
      } catch (err) {
        console.error("Failed to fetch full post data:", err);
      }
    };
    
    fetchFullPost();
  }, [initialPost?._id, showModal, token]);

  // Handle post deletion by watching posts array
  useEffect(() => {
    if (posts.length === 0) {
      setShowModal(false);
      if (onPostUpdate) onPostUpdate();
    }
  }, [posts, setShowModal, onPostUpdate]);

  // If modal is closed or post is deleted, don't render hooks that depend on post._id
  if (!showModal || !post) return null;

  // 🔌 Socket typing updates
  usePostSocket(post._id, currentUser, setSomeoneTyping, setPosts);

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

  const getReactionCount = (emoji) => {
    const users = post.reactions?.[emoji];
    return Array.isArray(users) ? users.length : 0;
  };

  const userReacted = (emoji) => {
    const users = post.reactions?.[emoji];
    return Array.isArray(users) ? users.includes(currentUser._id || currentUser.id) : false;
  };

  return (
    <>
      <PostModal
        showModal={showModal}
        setShowModal={setShowModal}
        post={post}
        currentUser={currentUser}
        handleReact={handleReact}
        getReactionCount={getReactionCount}
        userReacted={userReacted}
        reactionEffect={reactionEffect}
        setReactionEffect={setReactionEffect}
        handleReply={handleReply}
        handleDeleteComment={handleDeleteComment}
        handleComment={handleComment}
        handleEditComment={handleEditComment}
        handleEditReply={handleEditReply}
        handleDeleteReply={handleDeleteReply}
        handleReactToReply={handleReactToReply}
        handleReactToComment={handleReactToComment}
        handlePinComment={handlePinComment}
        comment={comment}
        setComment={setComment}
        editing={editing}
        setEditing={setEditing}
        editContent={editContent}
        setEditContent={setEditContent}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        handleEditSave={() => handleEditSave({ content: editContent, title: editTitle })}
        handleBlurSave={handleBlurSave}
        toggleEdit={(editKey, setEditContentFunc, isEditing, originalContent) => {
          toggleEdit(editKey, (val) => {
            setEditContentFunc(val);
            setEditTitle(post.title || "");
          }, isEditing, originalContent);
        }}
        handleDelete={() => {
          handleDelete();
          if (onPostUpdate) onPostUpdate();
        }}
        showEditEmoji={showEditEmoji}
        setShowEditEmoji={setShowEditEmoji}
        textareaRef={textareaRef}
        setShowViewer={setShowViewer}
        setStartIndex={setStartIndex}
        hasLiked={hasLiked}
        isLiking={isLiking}
        likeIconRef={likeIconRef}
        darkMode={darkMode}
        setPosts={setPosts}
        hideInteractions={false}
        onShowOriginalEvent={() => setShowOriginalEventModal(true)}
      />
      
      {showOriginalEventModal && (post.eventRepostDetails?.originalEventId || post.announcementDetails?.originalEventId) && (
        <SmartPostModal
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
        />
      )}
    </>
  );
}
