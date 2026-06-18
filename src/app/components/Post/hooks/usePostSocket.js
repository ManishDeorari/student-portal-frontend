// components/Post/usePostSocket.js
import { useEffect } from "react";
import socket from "../../../../utils/socket";

export default function usePostSocket(postId, currentUser, setSomeoneTyping, setPosts) {
  useEffect(() => {
    if (!socket) return;

    // 🟡 Typing indicator handler
    const handleTyping = ({ postId: incomingId, user }) => {
      if (incomingId === postId && user !== currentUser?._id) {
        setSomeoneTyping(true);
        setTimeout(() => setSomeoneTyping(false), 3000);
      }
    };

    // ✅ Comment reaction handler — no UI mutation, only log or use for toasts
    const handleCommentReacted = ({ postId: incomingId, commentId, userId, emoji }) => {
      if (incomingId !== postId) return;
      console.log("💬 commentReacted received. UI will update via postUpdated socket.");
    };

    // 🔁 Optional fallback: request updated post manually
    const handleUpdatePostRequest = async ({ postId: incomingId }) => {
      try {
        if (incomingId !== postId) return;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/posts/${incomingId}`);
        const post = await res.json();
        setPosts((prev) => prev.map((p) => (p._id === incomingId ? post : p)));
      } catch (err) {
        console.error("🔴 Failed to sync post", err);
      }
    };

    // ⚡ Live socket updates for post changes
    const handlePostUpdated = (updatedPost) => {
      if (updatedPost && updatedPost._id === postId) {
        // Map the type if it is an event and shape needs adjustment
        const isEventType = updatedPost.type === "Event" || (!updatedPost.type && updatedPost.createdBy && !updatedPost.user);
        if (isEventType && updatedPost.createdBy && !updatedPost.user) {
          updatedPost.user = updatedPost.createdBy;
          updatedPost.type = "Event";
          updatedPost.content = updatedPost.content || updatedPost.description;
        }
        setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, ...updatedPost } : p)));
      }
    };

    const handlePostDeleted = ({ postId: deletedId }) => {
      if (deletedId === postId) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      }
    };

    // ✅ Attach listeners
    socket.on("typing", handleTyping);
    socket.on("commentReacted", handleCommentReacted);
    socket.on("updatePostRequest", handleUpdatePostRequest);
    socket.on("postUpdated", handlePostUpdated);
    socket.on("postReacted", handlePostUpdated);
    socket.on("updatePost", handlePostUpdated);
    socket.on("postDeleted", handlePostDeleted);

    // ✅ Clean up on unmount
    return () => {
      socket.off("typing", handleTyping);
      socket.off("commentReacted", handleCommentReacted);
      socket.off("updatePostRequest", handleUpdatePostRequest);
      socket.off("postUpdated", handlePostUpdated);
      socket.off("postReacted", handlePostUpdated);
      socket.off("updatePost", handlePostUpdated);
      socket.off("postDeleted", handlePostDeleted);
    };
  }, [postId, currentUser?._id, setSomeoneTyping, setPosts]);
}

