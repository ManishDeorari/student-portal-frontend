import React, { useRef, useState } from "react";
import EmojiPickerToggle from "../utils/EmojiPickerToggle";

export default function CommentInput({
  comment,
  setComment,
  onSubmit,
  postId,
  currentUser,
  darkMode = false
}) {
  const inputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmojiClick = (emojiObject) => {
    if (isSubmitting) return;
    setComment((prev) => prev + (emojiObject.native || emojiObject.emoji));
  };

  const handleTyping = (value) => {
    if (isSubmitting) return;
    setComment(value);
  };

  const handleSubmit = async () => {
    if (isSubmitting || !comment.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  return (
    <div className="relative mt-2">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={isSubmitting}
          placeholder={isSubmitting ? "Posting comment..." : "Write a comment..."}
          className={`flex-1 min-w-0 border ${darkMode ? "border-white/20 bg-slate-800 text-white" : "border-black bg-[#FAFAFA] text-gray-900"} rounded-full px-3 sm:px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
          ref={inputRef}
        />

        <EmojiPickerToggle
          onEmojiSelect={handleEmojiClick}
          icon="😊"
          iconSize="text-xl"
          placement="top"
          darkMode={darkMode}
        />

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`bg-blue-500 text-white text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-full hover:bg-blue-600 flex-shrink-0 whitespace-nowrap transition-all ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {isSubmitting ? "Wait..." : "Post"}
        </button>
      </div>
    </div>
  );
}
