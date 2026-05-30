import toast from "react-hot-toast";
import { triggerReactionEffect } from "./useEmojiAnimation";

export default function usePostActions({
  post,
  setPosts,
  setEditing,
}) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const checkAuth = () => {
    const { data: { session } } = { data: { session: null } }; // handled by Supabase session
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;
    if (!user) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
  };

  const handleReact = async (emoji) => {
    if (!checkAuth()) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const userId = user?.profile_id || user?._id;

      if (post.type === "Event") {
        // Events: still route through backend until event module is fully migrated
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/events/${post._id}/react`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ emoji }),
        });
        if (!res.ok) throw new Error("Reaction failed");
        const updatedPost = await res.json();
        setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...updatedPost } : p)));
        triggerReactionEffect(emoji);
        return;
      }

      // Posts: direct Supabase update
      const { supabase } = await import("@/services/database/client");
      const { data: current, error: fetchErr } = await supabase
        .from("post")
        .select("reactions")
        .eq("post_id", post._id || post.post_id)
        .single();

      if (fetchErr) throw fetchErr;

      let reactions = current.reactions || [];
      const existingIdx = reactions.findIndex((r) => r.emoji === emoji);
      if (existingIdx > -1) {
        const userIdx = reactions[existingIdx].users.indexOf(userId);
        if (userIdx > -1) {
          reactions[existingIdx].users.splice(userIdx, 1);
          if (reactions[existingIdx].users.length === 0) {
            reactions = reactions.filter((r) => r.emoji !== emoji);
          }
        } else {
          reactions[existingIdx].users.push(userId);
        }
      } else {
        reactions.push({ emoji, users: [userId] });
      }

      const { error: updateErr } = await supabase
        .from("post")
        .update({ reactions })
        .eq("post_id", post._id || post.post_id);

      if (updateErr) throw updateErr;

      // Optimistic UI update (Supabase Realtime will also sync other clients via postgres_changes)
      setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, reactions } : p)));
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
      if (post.type === "Event") {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/events/${post._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content: contentToSave, title: titleToSave }),
        });
        if (!res.ok) throw new Error("Update failed");
        const updated = await res.json();
        setEditing(false);
        setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...updated } : p)));
        toast.success("✏️ Event updated successfully");
        return;
      }

      const { supabase } = await import("@/services/database/client");
      const { data, error } = await supabase
        .from("post")
        .update({ content: contentToSave, updated_at: new Date().toISOString() })
        .eq("post_id", post._id || post.post_id)
        .select("*")
        .single();

      if (error) throw error;

      setEditing(false);
      setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, ...data, _id: data.post_id } : p)));
      toast.success("✏️ Post updated successfully");
    } catch (error) {
      toast.error("❌ Failed to update post");
    }
  };

  const handleDelete = async () => {
    if (!checkAuth()) return;

    try {
      if (post.type === "Event") {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/events/${post._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Delete failed");
        setPosts((prev) => prev.filter((p) => p._id !== post._id));
        toast.success("🗑️ Event deleted");
        return;
      }

      const { supabase } = await import("@/services/database/client");
      const { error } = await supabase
        .from("post")
        .delete()
        .eq("post_id", post._id || post.post_id);

      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      toast.success("🗑️ Post deleted");
    } catch (err) {
      toast.error("❌ Failed to delete post");
    }
  };

  const handleBlurSave = (editContent, editKey) => {
    localStorage.setItem(editKey, editContent);
    toast("💾 Draft saved", { icon: "💾" });
  };

  const toggleEdit = (editKey, setEditContent, editing, originalContent) => {
    if (editing) {
      setEditing(false);
      setEditContent(originalContent);
      localStorage.removeItem(editKey);
      return;
    }
    const draft = localStorage.getItem(editKey);
    if (draft) setEditContent(draft);
    setEditing(true);
  };

  return { handleReact, handleEditSave, handleDelete, handleBlurSave, toggleEdit };
}
