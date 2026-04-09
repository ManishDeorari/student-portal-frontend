// components/PostCard/hooks/usePostEffects.js
import { useEffect } from "react";

export default function usePostEffects({
  post,
  currentUser,
  setEditContent,
  setHasLiked,
  editing,
  textareaRef,
}) {
  const editKey = `draft-${post._id}`;

  // 🔹 Load saved draft content (if available)
  useEffect(() => {
    const saved = localStorage.getItem(editKey);
    if (saved && !post.content.includes(saved)) {
      setEditContent(saved);
    }
  }, [editKey, post.content, setEditContent]);

  // 🔹 Check if current user liked this post
  useEffect(() => {
    const userId = currentUser?._id?.toString();
    if (!userId) {
      setHasLiked(false);
      return;
    }
    const normalizeId = (id) =>
      typeof id === "object" ? id._id?.toString() : id?.toString?.();

    const liked = post.likes?.some((id) => normalizeId(id) === userId);
    setHasLiked(liked);
  }, [post.likes, currentUser?._id, setHasLiked]);

  // ❌ Removed post auto-scroll. Keeping it only for replies or modal context.

  // 🔹 Focus textarea when editing
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing, textareaRef]);

  // 🔹 React animation when other users like this post
  useEffect(() => {
    const socket = require("../../../../utils/socket").default;
    const handleLikeAnimation = ({ postId, userId, isLiked }) => {
      if (postId === post._id && userId !== currentUser?._id) {
        const ids = [`like-icon-${post._id}`, `like-icon-${post._id}-modal`];
        ids.forEach((id) => {
          const icon = document.getElementById(id);
          if (icon) {
            icon.classList.add(isLiked ? "animate-like" : "animate-unlike");
            setTimeout(() => {
              icon.classList.remove("animate-like", "animate-unlike");
            }, 500);
          }
        });
      }
    };
    socket.on("postLiked", handleLikeAnimation);
    return () => socket.off("postLiked", handleLikeAnimation);
  }, [post._id, currentUser?._id]);
}
