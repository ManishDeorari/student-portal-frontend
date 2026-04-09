import toast from "react-hot-toast";
import socket from "../../../../utils/socket";
import { triggerReactionEffect } from "./useEmojiAnimation";

export default function usePostActions({
  post,
  setPosts,
  //token,
  setEditing,
}) {
  const token = localStorage.getItem("token");
  const checkAuth = () => {
    if (!token) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleReact = async (emoji) => {
    if (!checkAuth()) return;

    try {
      const isEvent = post.type === "Event";
      const endpoint = isEvent ? `/api/events/${post._id}/react` : `/api/posts/${post._id}/react`;
      
      const res = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ emoji }),
        }
      );

      if (!res.ok) {
        if (res.status === 404) {
          toast.error(isEvent ? "❌ Event not found!" : "❌ Post not found! It may have been deleted.");
          setTimeout(() => { window.location.href = "/dashboard"; }, 1000);
          return;
        }
        throw new Error("Reaction failed");
      }

      const updatedPost = await res.json();

      // ✅ Update this user's view optimistically
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, ...updatedPost } : p))
      );

      // ✅ Emit real-time event to others
      socket.emit("postReacted", updatedPost);

      // ✅ Trigger local reaction animation
      triggerReactionEffect(emoji);
    } catch (err) {
      console.error("Reaction Error:", err);
      toast.error("❌ Reaction failed");
    }
  };

  const handleEditSave = async ({ content, title }) => {
    if (!checkAuth()) return;

    const contentToSave = typeof content === "string" ? content.trim() : "";
    const titleToSave = typeof title === "string" ? title.trim() : "";

    if (!contentToSave) {
      toast.error("Content cannot be empty");
      return;
    }

    try {
      const isEvent = post.type === "Event";
      const endpoint = isEvent ? `/api/events/${post._id}` : `/api/posts/${post._id}`;
      
      const res = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            content: contentToSave,
            ...(isEvent && { title: titleToSave })
          }),
        }
      );
      
      if (!res.ok) throw new Error("Update failed");
      
      const updated = await res.json();
      setEditing(false);
      setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p)));
      socket.emit("updatePost", updated);
      toast.success(isEvent ? "✏️ Event updated successfully" : "✏️ Post updated successfully", { autoClose: 1500 });
    } catch (error) {
      toast.error(isEvent ? "❌ Failed to update event" : "❌ Failed to update post");
    }
  };

  const handleDelete = async () => {
    if (!checkAuth()) return;
    const isEvent = post.type === "Event";

    try {
      const endpoint = isEvent ? `/api/events/${post._id}` : `/api/posts/${post._id}`;
      const res = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (!res.ok) throw new Error("Delete failed");
      
      await res.json();
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      toast.success(isEvent ? "🗑️ Event deleted" : "🗑️ Post deleted", { autoClose: 1500 });
    } catch (err) {
      toast.error(isEvent ? "❌ Failed to delete event" : "❌ Failed to delete post");
    }
  };

  const handleBlurSave = (editContent, editKey) => {
    localStorage.setItem(editKey, editContent);
    toast("💾 Draft saved", { icon: "💾" });
  };

  const toggleEdit = (editKey, setEditContent, editing, originalContent) => {
    if (editing) {
      // Cancel editing
      setEditing(false);
      setEditContent(originalContent);
      localStorage.removeItem(editKey);
      return;
    }

    const draft = localStorage.getItem(editKey);
    if (draft) {
      setEditContent(draft);
    }
    setEditing(true);
  };

  return {
    handleReact,
    handleEditSave,
    handleDelete,
    handleBlurSave,
    toggleEdit,
  };
}
