import React, { useRef } from "react";
import EmojiPickerToggle from "../utils/EmojiPickerToggle";
import socket from "../../../../utils/socket";

export default function CommentInput({
  comment,
  setComment,
  onSubmit,
  postId,
  currentUser,
  darkMode = false
}) {
  const inputRef = useRef(null);

  const handleEmojiClick = (emojiObject) => {
    setComment((prev) => prev + (emojiObject.native || emojiObject.emoji));
  };

  const handleTyping = (value) => {
    setComment(value);
    if (!currentUser || !currentUser._id) return;
    socket.emit("typing", {
      postId,
      user: currentUser._id,
    });
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
              onSubmit();
            }
          }}
          placeholder="Write a comment..."
          className={`flex-1 min-w-0 border ${darkMode ? "border-white/20 bg-slate-800 text-white" : "border-black bg-[#FAFAFA] text-gray-900"} rounded-full px-3 sm:px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
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
          onClick={onSubmit}
          className="bg-blue-500 text-white text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-full hover:bg-blue-600 flex-shrink-0 whitespace-nowrap"
        >
          Post
        </button>
      </div>
    </div>
  );
}
