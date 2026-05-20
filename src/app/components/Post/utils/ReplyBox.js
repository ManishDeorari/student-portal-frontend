import React, { useState } from "react";
import EmojiPickerToggle from "../utils/EmojiPickerToggle";

export default function ReplyBox({ parentId, onSubmit, darkMode = false }) {
  const [replyText, setReplyText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const text = replyText.trim();
    if (!text || sending) return;

    try {
      setSending(true);
      await onSubmit(text); // 🔄 Callback to parent
      setReplyText("");
      setShowEmoji(false);
    } catch (err) {
      console.error("Reply submit failed:", err);
    } finally {
      setTimeout(() => {
        setSending(false);
      }, 1000);
    }
  };

  return (
    <div className="relative flex gap-1.5 sm:gap-2 mt-2 items-start w-full">
      <input
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        disabled={sending}
        placeholder={sending ? "Sending reply..." : "Write a reply..."}
        className={`flex-grow min-w-0 border ${darkMode ? "border-white/10 bg-slate-700 text-white" : "border-black bg-[#FAFAFA] text-black"} rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${sending ? "opacity-60 cursor-not-allowed" : ""}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <EmojiPickerToggle
        onEmojiSelect={(emoji) =>
          setReplyText((prev) => prev + emoji.native)
        }
        placement="top"
      />
      <button
        onClick={handleSend}
        disabled={sending || !replyText.trim()}
        className="text-xs sm:text-sm text-blue-600 font-semibold disabled:opacity-50 flex-shrink-0 whitespace-nowrap"
      >
        {sending ? "Wait..." : "Send"}
      </button>
    </div>
  );
}
