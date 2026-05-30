import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { triggerReactionEffect } from "./useEmojiAnimation";

export default function useCommentActions({
  post,
  currentUser,
  setPosts,
  setComment,
  setShowCommentEmoji
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const checkAuth = useCallback(() => {
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;
    if (!user) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
  }, []);

  // Helper: get current user's profile_id
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.profile_id || user?._id || "";
  };

  // Helper: re-fetch post with comments from Supabase and update local state
  const syncPostFromDb = async (postId) => {
    try {
      const { supabase } = await import("@/services/database/client");
      const { data: comments } = await supabase
        .from("comment")
        .select(`
          *,
          author:profile(profile_id, name, public_id, role, profile_picture)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      const formattedComments = (comments || []).map((c) => ({
        ...c,
        _id: c.comment_id,
        user: c.author ? {
          _id: c.author.profile_id,
          name: c.author.name,
          publicId: c.author.public_id,
          role: c.author.role,
          profilePicture: c.author.profile_picture,
        } : { name: "Unknown" },
      }));

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId || p.post_id === postId
            ? { ...p, comments: formattedComments }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to sync post comments:", err);
    }
  };

  const handleComment = useCallback(
    async (comment) => {
      if (!checkAuth() || !comment.trim() || isSubmitting) return;
      setIsSubmitting(true);

      try {
        if (post.type === "Event") {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_URL}/api/events/${post._id}/comment`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ text: comment }),
          });
          if (!res.ok) throw new Error("Comment failed");
          const updated = await res.json();
          if (setComment) setComment("");
          if (setShowCommentEmoji) setShowCommentEmoji(false);
          setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p)));
          toast.success("💬 Comment posted!");
          return;
        }

        const { supabase } = await import("@/services/database/client");
        const authorId = getUserId();
        const postId = post._id || post.post_id;

        const { error } = await supabase.from("comment").insert({
          post_id: postId,
          author_id: authorId,
          text: comment,
          reactions: [],
          replies: [],
        });

        if (error) throw error;

        if (setComment) setComment("");
        if (setShowCommentEmoji) setShowCommentEmoji(false);
        await syncPostFromDb(postId);
        toast.success("💬 Comment posted!");
      } catch (err) {
        console.error("Comment error:", err);
        toast.error("❌ Failed to add comment");
      } finally {
        setIsSubmitting(false);
      }
    },
    [post._id, post.type, setPosts, setComment, setShowCommentEmoji, API_URL, checkAuth, isSubmitting]
  );

  const handleReply = useCallback(
    async (parentCommentId, replyText) => {
      if (!checkAuth() || !replyText.trim()) {
        toast.error("Reply cannot be empty");
        return;
      }

      try {
        if (post.type === "Event") {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_URL}/api/events/${post._id}/comment/${parentCommentId}/reply`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ text: replyText }),
          });
          const updated = await res.json();
          setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p)));
          toast.success("💬 Reply posted!");
          return;
        }

        const { supabase } = await import("@/services/database/client");
        const authorId = getUserId();
        const postId = post._id || post.post_id;

        // Fetch the parent comment's replies array and append
        const { data: parentComment, error: fetchErr } = await supabase
          .from("comment")
          .select("replies")
          .eq("comment_id", parentCommentId)
          .single();

        if (fetchErr) throw fetchErr;

        const newReply = {
          reply_id: crypto.randomUUID(),
          author_id: authorId,
          text: replyText,
          reactions: [],
          created_at: new Date().toISOString(),
        };

        const updatedReplies = [...(parentComment.replies || []), newReply];

        const { error: updateErr } = await supabase
          .from("comment")
          .update({ replies: updatedReplies })
          .eq("comment_id", parentCommentId);

        if (updateErr) throw updateErr;

        await syncPostFromDb(postId);
        toast.success("💬 Reply posted!");
      } catch (err) {
        console.error("❌ handleReply error:", err);
        toast.error("❌ Failed to reply");
      }
    },
    [post._id, post.type, setPosts, API_URL, checkAuth]
  );

  const handleEditComment = useCallback(
    async (commentId, newText) => {
      if (!checkAuth() || !newText.trim()) return alert("Comment cannot be empty");

      try {
        if (post.type === "Event") {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_URL}/api/events/${post._id}/comment/${commentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ text: newText }),
          });
          const updated = await res.json();
          setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p)));
          toast.success("✏️ Comment updated");
          return;
        }

        const { supabase } = await import("@/services/database/client");
        const { error } = await supabase
          .from("comment")
          .update({ text: newText, updated_at: new Date().toISOString() })
          .eq("comment_id", commentId);

        if (error) throw error;
        await syncPostFromDb(post._id || post.post_id);
        toast.success("✏️ Comment updated");
      } catch (err) {
        toast.error("❌ Failed to update comment");
      }
    },
    [post._id, post.type, setPosts, API_URL, checkAuth]
  );

  const handleDeleteComment = useCallback(
    async (commentId) => {
      try {
        if (post.type === "Event") {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_URL}/api/events/${post._id}/comment/${commentId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const updated = await res.json();
          setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p)));
          toast.success("🗑️ Comment deleted!");
          return;
        }

        const { supabase } = await import("@/services/database/client");
        const { error } = await supabase.from("comment").delete().eq("comment_id", commentId);
        if (error) throw error;
        await syncPostFromDb(post._id || post.post_id);
        toast.success("🗑️ Comment deleted!");
      } catch (err) {
        toast.error("❌ Failed to delete comment");
      }
    },
    [post._id, post.type, setPosts, API_URL]
  );

  const handleEditReply = useCallback(
    async (commentId, replyId, newText) => {
      if (!checkAuth() || !newText.trim()) return alert("Reply cannot be empty");

      try {
        if (post.type === "Event") {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_URL}/api/events/${post._id}/comment/${commentId}/reply/${replyId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ text: newText }),
          });
          const updated = await res.json();
          setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p)));
          toast.success("✏️ Reply updated");
          return;
        }

        const { supabase } = await import("@/services/database/client");
        const { data: parentComment } = await supabase.from("comment").select("replies").eq("comment_id", commentId).single();
        const updatedReplies = (parentComment.replies || []).map((r) =>
          r.reply_id === replyId ? { ...r, text: newText } : r
        );
        await supabase.from("comment").update({ replies: updatedReplies }).eq("comment_id", commentId);
        await syncPostFromDb(post._id || post.post_id);
        toast.success("✏️ Reply updated");
      } catch (err) {
        toast.error("❌ Failed to edit reply");
      }
    },
    [post._id, post.type, setPosts, API_URL, checkAuth]
  );

  const handleDeleteReply = useCallback(
    async (commentId, replyId) => {
      try {
        if (post.type === "Event") {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_URL}/api/events/${post._id}/comment/${commentId}/reply/${replyId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const updated = await res.json();
          setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p)));
          toast.success("🗑️ Reply deleted!");
          return;
        }

        const { supabase } = await import("@/services/database/client");
        const { data: parentComment } = await supabase.from("comment").select("replies").eq("comment_id", commentId).single();
        const updatedReplies = (parentComment.replies || []).filter((r) => r.reply_id !== replyId);
        await supabase.from("comment").update({ replies: updatedReplies }).eq("comment_id", commentId);
        await syncPostFromDb(post._id || post.post_id);
        toast.success("🗑️ Reply deleted!");
      } catch (err) {
        console.error("❌ Failed to delete reply:", err);
        toast.error("❌ Failed to delete reply");
      }
    },
    [post._id, post.type, setPosts, API_URL]
  );

  const handleReactToReply = useCallback(
    async (commentId, replyId, emoji) => {
      try {
        if (post.type === "Event") {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_URL}/api/events/${post._id}/comment/${commentId}/reply/${replyId}/react`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ emoji }),
          });
          const updated = await res.json();
          setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p)));
          triggerReactionEffect(emoji);
          return;
        }

        const { supabase } = await import("@/services/database/client");
        const userId = getUserId();
        const { data: parentComment } = await supabase.from("comment").select("replies").eq("comment_id", commentId).single();
        const updatedReplies = (parentComment.replies || []).map((r) => {
          if (r.reply_id !== replyId) return r;
          let reactions = r.reactions || [];
          const idx = reactions.findIndex((rx) => rx.emoji === emoji);
          if (idx > -1) {
            const uIdx = reactions[idx].users.indexOf(userId);
            if (uIdx > -1) {
              reactions[idx].users.splice(uIdx, 1);
              if (reactions[idx].users.length === 0) reactions = reactions.filter((rx) => rx.emoji !== emoji);
            } else {
              reactions[idx].users.push(userId);
            }
          } else {
            reactions.push({ emoji, users: [userId] });
          }
          return { ...r, reactions };
        });
        await supabase.from("comment").update({ replies: updatedReplies }).eq("comment_id", commentId);
        await syncPostFromDb(post._id || post.post_id);
        triggerReactionEffect(emoji);
      } catch (err) {
        toast.error("❌ Failed to react to reply");
      }
    },
    [post._id, post.type, setPosts, API_URL]
  );

  const handleReactToComment = useCallback(
    async (commentId, emoji) => {
      try {
        if (post.type === "Event") {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_URL}/api/events/${post._id}/comment/${commentId}/react`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ emoji }),
          });
          const updated = await res.json();
          setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p)));
          triggerReactionEffect(emoji);
          return;
        }

        const { supabase } = await import("@/services/database/client");
        const userId = getUserId();
        const { data: commentRow } = await supabase.from("comment").select("reactions").eq("comment_id", commentId).single();
        let reactions = commentRow.reactions || [];
        const idx = reactions.findIndex((r) => r.emoji === emoji);
        if (idx > -1) {
          const uIdx = reactions[idx].users.indexOf(userId);
          if (uIdx > -1) {
            reactions[idx].users.splice(uIdx, 1);
            if (reactions[idx].users.length === 0) reactions = reactions.filter((r) => r.emoji !== emoji);
          } else {
            reactions[idx].users.push(userId);
          }
        } else {
          reactions.push({ emoji, users: [userId] });
        }
        await supabase.from("comment").update({ reactions }).eq("comment_id", commentId);
        await syncPostFromDb(post._id || post.post_id);
        triggerReactionEffect(emoji);
      } catch (err) {
        toast.error("❌ Failed to react to comment");
      }
    },
    [post._id, post.type, setPosts, API_URL]
  );

  const handlePinComment = useCallback(
    async (commentId) => {
      if (!checkAuth()) return;

      try {
        if (post.type === "Event") {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_URL}/api/events/${post._id}/comment/${commentId}/pin`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Failed to toggle pin");
          }
          const updated = await res.json();
          setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p)));
          toast.success("📌 Comment pinned state toggled!");
          return;
        }

        const { supabase } = await import("@/services/database/client");
        const { data: commentRow } = await supabase.from("comment").select("is_pinned").eq("comment_id", commentId).single();
        const { error } = await supabase
          .from("comment")
          .update({ is_pinned: !commentRow.is_pinned })
          .eq("comment_id", commentId);
        if (error) throw error;
        await syncPostFromDb(post._id || post.post_id);
        toast.success("📌 Comment pinned state toggled!");
      } catch (err) {
        toast.error(err.message || "❌ Failed to pin/unpin comment");
      }
    },
    [post._id, post.type, setPosts, API_URL, checkAuth]
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
    handlePinComment,
  };
}
