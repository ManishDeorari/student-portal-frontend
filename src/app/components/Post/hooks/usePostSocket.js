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
      // Optionally: show animation or toast here.
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

    // ✅ Attach listeners
    socket.on("typing", handleTyping);
    socket.on("commentReacted", handleCommentReacted);
    socket.on("updatePostRequest", handleUpdatePostRequest);

    // ✅ Clean up on unmount
    return () => {
      socket.off("typing", handleTyping);
      socket.off("commentReacted", handleCommentReacted);
      socket.off("updatePostRequest", handleUpdatePostRequest);
    };
  }, [postId, currentUser?._id, setSomeoneTyping, setPosts]);
}
