import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import socket from "../../../../utils/socket";
import { triggerReactionEffect } from "./useEmojiAnimation";

export default function useCommentActions({
  post,
  currentUser,
  setPosts,
  setComment,
  setShowCommentEmoji
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const checkAuth = useCallback(() => {
    if (!token) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
  }, [token]);

  const handleComment = useCallback(
    async (comment) => {
      if (!checkAuth() || !comment.trim() || isSubmitting) return;
      setIsSubmitting(true);
      try {
        const isEvent = post.type === "Event";
        const endpoint = isEvent ? `/api/events/${post._id}/comment` : `/api/posts/${post._id}/comment`;
        
        const res = await fetch(
          `${API_URL}${endpoint}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text: comment }),
          }
        );

        if (!res.ok) {
          if (res.status === 404) {
            toast.error(isEvent ? "❌ Event not found!" : "❌ Post not found! It may have been deleted.");
            setTimeout(() => { window.location.href = "/dashboard"; }, 1000);
            return;
          }
          throw new Error("Comment failed");
        }

        const updated = await res.json();
        if (setComment) setComment("");
        if (setShowCommentEmoji) setShowCommentEmoji(false);

        // Merge logic to preserve registration state
        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p))
        );

        socket.emit("updatePost", updated);
        toast.success("💬 Comment posted!", { autoClose: 1500 });
      } catch (err) {
        toast.error("❌ Failed to add comment");
      } finally {
        setIsSubmitting(false);
      }
    },
    [post._id, post.type, setPosts, setComment, setShowCommentEmoji, API_URL, token, checkAuth]
  );

  const handleReply = useCallback(
    async (parentCommentId, replyText) => {
      if (!checkAuth() || !replyText.trim()) {
        toast.error("Reply cannot be empty");
        return;
      }

      try {
        const isEvent = post.type === "Event";
        const endpoint = isEvent ? `/api/events/${post._id}/comment/${parentCommentId}/reply` : `/api/posts/${post._id}/comment/${parentCommentId}/reply`;

        const res = await fetch(
          `${API_URL}${endpoint}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text: replyText }),
          }
        );

        const updated = await res.json();

        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p))
        );

        socket.emit("updatePost", updated);
        toast.success("💬 Reply posted!", { autoClose: 1500 });
      } catch (err) {
        console.error("❌ handleReply error:", err);
        toast.error("❌ Failed to reply");
      }
    },
    [post._id, post.type, setPosts, API_URL, token, checkAuth]
  );

  const handleEditComment = useCallback(
    async (commentId, newText) => {
      if (!checkAuth() || !newText.trim()) {
        return alert("Comment cannot be empty");
      }

      try {
        const isEvent = post.type === "Event";
        const endpoint = isEvent ? `/api/events/${post._id}/comment/${commentId}` : `/api/posts/${post._id}/comment/${commentId}`;
        
        const res = await fetch(
          `${API_URL}${endpoint}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text: newText }),
          }
        );

        const updated = await res.json();

        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p))
        );

        socket.emit("updatePost", updated);
        toast.success("✏️ Comment updated", { autoClose: 1500 });
      } catch (err) {
        toast.error("❌ Failed to update comment");
      }
    },
    [post._id, post.type, setPosts, API_URL, token, checkAuth]
  );

  const handleDeleteComment = useCallback(
    async (commentId) => {
      try {
        const isEvent = post.type === "Event";
        const endpoint = isEvent ? `/api/events/${post._id}/comment/${commentId}` : `/api/posts/${post._id}/comment/${commentId}`;
        
        const res = await fetch(
          `${API_URL}${endpoint}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const updated = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p))
        );
        socket.emit("updatePost", updated);
        toast.success("🗑️ Comment deleted!", { autoClose: 1500 });
      } catch (err) {
        toast.error("❌ Failed to delete comment");
      }
    },
    [post._id, post.type, setPosts, API_URL, token]
  );

  const handleEditReply = useCallback(
    async (commentId, replyId, newText) => {
      if (!checkAuth() || !newText.trim()) return alert("Reply cannot be empty");

      try {
        const isEvent = post.type === "Event";
        const endpoint = isEvent 
          ? `/api/events/${post._id}/comment/${commentId}/reply/${replyId}`
          : `/api/posts/${post._id}/comment/${commentId}/reply/${replyId}`;

        const res = await fetch(
          `${API_URL}${endpoint}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text: newText }),
          }
        );

        const updated = await res.json();
        setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p)));
        socket.emit("updatePost", updated);
        toast.success("✏️ Reply updated", { autoClose: 1500 });
      } catch (err) {
        toast.error("❌ Failed to edit reply");
      }
    },
    [post._id, post.type, setPosts, API_URL, token, checkAuth]
  );

  const handleDeleteReply = useCallback(async (commentId, replyId) => {
    try {
      const isEvent = post.type === "Event";
      const endpoint = isEvent 
        ? `/api/events/${post._id}/comment/${commentId}/reply/${replyId}`
        : `/api/posts/${post._id}/comment/${commentId}/reply/${replyId}`;

      const res = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updated = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p))
      );
      socket.emit("updatePost", updated);
      toast.success("🗑️ Reply deleted!", { autoClose: 1500 });
    } catch (err) {
      console.error("❌ Failed to delete reply:", err);
      toast.error("❌ Failed to delete reply");
    }
  }, [post._id, post.type, setPosts, API_URL, token]);

  const handleReactToReply = useCallback(
    async (commentId, replyId, emoji) => {
      try {
        const isEvent = post.type === "Event";
        const endpoint = isEvent 
          ? `/api/events/${post._id}/comment/${commentId}/reply/${replyId}/react`
          : `/api/posts/${post._id}/comment/${commentId}/reply/${replyId}/react`;

        const res = await fetch(
          `${API_URL}${endpoint}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ emoji }),
          }
        );

        const updated = await res.json();
        setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p)));
        socket.emit("updatePost", updated);
        triggerReactionEffect(emoji);
      } catch (err) {
        toast.error("❌ Failed to react to reply");
      }
    },
    [post._id, post.type, setPosts, API_URL, token]
  );

  const handleReactToComment = useCallback(
    async (commentId, emoji) => {
      try {
        const isEvent = post.type === "Event";
        const endpoint = isEvent 
          ? `/api/events/${post._id}/comment/${commentId}/react`
          : `/api/posts/${post._id}/comments/${commentId}/react`;

        const res = await fetch(
          `${API_URL}${endpoint}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ emoji }),
          }
        );

        const updated = await res.json();
        const finalUpdated = isEvent ? updated : (updated.post || updated);
        setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...finalUpdated } : p)));
        socket.emit("updatePost", finalUpdated);
        triggerReactionEffect(emoji);
      } catch (err) {
        toast.error("❌ Failed to react to comment");
      }
    },
    [post._id, post.type, setPosts, API_URL, token]
  );

  return {
    handleComment,
    handleReply,
    handleEditComment,
    handleDeleteComment,
    handleEditReply,
    handleDeleteReply,
    handleReactToReply,
    handleReactToComment,
  };

}
