"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { FaPaperPlane, FaSmile, FaInfoCircle, FaUserPlus, FaUsers, FaImage, FaTimes, FaExpand, FaEdit } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import EmojiPicker from 'emoji-picker-react';
import { toast } from "react-hot-toast";
import GroupAvatar from "./GroupAvatar";

export default function GroupChatWindow({
    selectedGroup,
    messages,
    currentUser,
    onSendMessage,
    onEditGroup,
    onInviteMembers,
    onToggleDetails,
    isAdmin,
    onReact,
    onViewImage,
    onDeleteMessage,
    onBack,
    showBackButton
}) {
    const { darkMode } = useTheme();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);

    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            return;
        }
        setSelectedFile(file);
        setMediaPreview(URL.createObjectURL(file));
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() && !selectedFile) return;

        let mediaData = { mediaUrl: null, mediaPublicId: null, type: "text" };

        if (selectedFile) {
            setUploading(true);
            try {
                const formData = new FormData();
                formData.append("file", selectedFile);
                formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

                const res = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, {
                    method: "POST",
                    body: formData
                });
                const data = await res.json();
                if (data.secure_url) {
                    mediaData = {
                        mediaUrl: data.secure_url,
                        mediaPublicId: data.public_id,
                        type: "image"
                    };
                }
            } catch (err) {
                console.error("Upload error:", err);
                toast.error("Failed to upload image.");
                setUploading(false);
                return;
            }
        }

        onSendMessage(newMessage, mediaData);
        setNewMessage("");
        setMediaPreview(null);
        setSelectedFile(null);
        setUploading(false);
    };

    const onEmojiClick = (emojiData) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    if (!selectedGroup) {
        return (
            <div className="w-full relative p-[2px] rounded-2xl shadow-2xl overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-40" />
                <div className={`relative h-full flex flex-col items-center justify-center rounded-[14px] ${darkMode ? "bg-gray-900/95" : "bg-[#FAFAFA]/95"}`}>
                    <div className="text-center p-8">
                        <div className="text-7xl mb-6 animate-bounce">👥</div>
                        <h2 className={`text-3xl font-black mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>Select a Group</h2>
                        <p className={`max-w-xs mx-auto text-lg font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Select a group to start communicating!</p>
                    </div>
                </div>
            </div>
        );
    }

    const isFaculty = currentUser?.role === "faculty";
    const isAlumni = currentUser?.role === "alumni" || currentUser?.role === "user";
    
    let canMessage = isAdmin; // Admins always message
    if (!isAdmin) {
        if (isFaculty) {
            canMessage = selectedGroup.allowFacultyMessaging;
        } else if (isAlumni) {
            canMessage = selectedGroup.allowAlumniMessaging;
        }
    }

    return (
        <div className="w-full relative p-[2px] rounded-2xl shadow-2xl overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />

            <div className={`h-full flex flex-col rounded-[14px] relative overflow-hidden ${darkMode ? "bg-gray-900/95 text-white" : "bg-[#FAFAFA]/95 text-gray-900"}`}>
                {/* Header */}
                <div className="p-3 sm:p-4 flex items-center justify-between relative bg-black/5">
                    <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 flex-1" onClick={onToggleDetails}>
                        {showBackButton && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onBack(); }}
                                className={`p-2 rounded-full transition-colors flex-shrink-0 md:hidden ${darkMode ? "hover:bg-white/10 text-gray-300" : "hover:bg-gray-200 text-gray-600"}`}
                                title="Back to groups"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                            </button>
                        )}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewImage(selectedGroup.profileImage || "/default-group.jpg");
                            }}
                            className="relative border-2 rounded-full p-[1px] bg-gradient-to-tr from-blue-400 to-pink-400 shadow-sm w-10 h-10 flex items-center justify-center overflow-hidden bg-[#FAFAFA] group-hover:scale-105 transition-transform cursor-zoom-in"
                        >
                            <GroupAvatar group={selectedGroup} size={36} />
                        </div>
                        <div className="min-w-0">
                            <h3 className={`font-black group-hover:text-blue-500 transition-colors truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedGroup.name}</h3>
                            <p className={`text-[10px] font-bold truncate max-w-[120px] sm:max-w-[200px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {selectedGroup.description || "Group Chat"}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {isAdmin && (
                            <>
                                <button onClick={onEditGroup} className={`p-2 rounded-full transition-colors ${darkMode ? "hover:bg-[#FAFAFA]/10 text-gray-300" : "hover:bg-gray-200 text-gray-600"}`} title="Edit Group">
                                    <FaEdit size={18} />
                                </button>
                                <button onClick={onInviteMembers} className={`p-2 rounded-full transition-colors ${darkMode ? "hover:bg-[#FAFAFA]/10 text-gray-300" : "hover:bg-gray-200 text-gray-600"}`} title="Invite Members">
                                    <FaUserPlus size={18} />
                                </button>
                            </>
                        )}
                        <button onClick={onToggleDetails} className={`p-2 rounded-full transition-colors ${darkMode ? "hover:bg-[#FAFAFA]/10 text-gray-300" : "hover:bg-gray-200 text-gray-600"}`} title="Group Info">
                            <FaInfoCircle size={18} />
                        </button>
                    </div>
                </div>

                <div className="h-[1.5px] w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-sm opacity-60" />

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-chat-pattern">
                    {messages.map((msg, index) => {
                        const isMe = String(msg.sender?._id || msg.sender?.id || msg.sender) === String(currentUser?._id || currentUser?.id);

                        return (
                            <div key={msg._id || index} className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                {!isMe && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg sm:rounded-xl overflow-hidden border-2 border-white/20 shadow-sm mt-1 bg-gray-200">
                                        <Image 
                                            src={msg.sender?.profilePicture || "/default-profile.jpg"} 
                                            width={32} 
                                            height={32} 
                                            className="object-cover aspect-square" 
                                            alt={msg.sender?.name || "User"} 
                                            onError={(e) => { e.target.src = "/default-profile.jpg"; }}
                                        />
                                    </div>
                                )}
                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%]`}>
                                    {!isMe && (
                                        <div className="flex items-center gap-2 mb-1 ml-1">
                                            <span className="text-[10px] font-black uppercase tracking-wider opacity-70">{msg.sender?.name || "Unknown"}</span>
                                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${msg.sender?.role === 'admin' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>{msg.sender?.role || "Member"}</span>
                                        </div>
                                    )}
                                    <div className="group relative">
                                        <div className={`p-[1px] rounded-2xl shadow-sm relative transition-all hover:shadow-md ${isMe
                                            ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-tr-none"
                                            : "bg-gradient-to-br from-blue-400/30 via-purple-500/30 to-pink-500/30 rounded-tl-none border border-transparent"
                                            }`}>
                                            <div className={`rounded-[calc(1rem-1px)] overflow-hidden ${isMe
                                                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                                                : (darkMode ? "bg-gray-900 text-white" : "bg-[#FAFAFA] text-gray-950")
                                                }`}>
                                                {msg.type === "image" && (
                                                    <div
                                                        onClick={() => onViewImage(msg.mediaUrl)}
                                                        className="relative cursor-zoom-in hover:opacity-90 transition-opacity p-1"
                                                    >
                                                        <img src={msg.mediaUrl} className="max-w-full max-h-[300px] object-cover rounded-xl" alt="Shared Media" />
                                                    </div>
                                                )}

                                                {msg.type === "image" && msg.content && (
                                                    <div className={`h-[1px] w-full ${darkMode ? "bg-[#FAFAFA]/20" : "bg-black/20"}`} />
                                                )}

                                                {msg.content && (
                                                    <div className="p-3">
                                                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                                    </div>
                                                )}

                                                {/* Reactions Display */}
                                                {msg.reactions && msg.reactions.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 p-2 pt-0">
                                                        {msg.reactions.map((r, i) => (
                                                            <div key={i} onClick={() => onReact(msg._id, r.emoji)} className={`px-2 py-0.5 rounded-full text-[10px] border cursor-pointer flex items-center gap-1.5 transition-all hover:scale-110 ${r.users.includes(currentUser?._id) ? "bg-blue-500/30 border-blue-500" : "bg-black/10 border-transparent dark:bg-[#FAFAFA]/10"}`}>
                                                                <span>{r.emoji}</span>
                                                                <span className="font-black">{r.users.length}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Reaction Button */}
                                        <div className={`absolute top-0 ${isMe ? "right-full mr-3" : "left-full ml-3"} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 items-center`}>
                                            <div className="flex gap-1.5 scale-90 group-hover:scale-100">
                                                {['👍', '❤️', '🔥', '👏', '😂'].map(emoji => (
                                                    <button key={emoji} onClick={() => onReact(msg._id, emoji)} className="p-1.5 rounded-xl bg-[#FAFAFA] dark:bg-gray-700 shadow-xl border dark:border-white/10 hover:scale-125 transition-transform text-xs">{emoji}</button>
                                                ))}
                                            </div>
                                            {(isMe || isAdmin) && (
                                                <button
                                                    onClick={() => onDeleteMessage(msg._id)}
                                                    className="p-1.5 px-3 rounded-lg bg-red-600/10 text-red-600 text-[8px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-lg"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-wider mt-1.5 opacity-40 px-1 italic">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Media Preview before send */}
                {mediaPreview && (
                    <div className="p-4 bg-black/10 backdrop-blur-md border-t dark:border-white/5 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="relative inline-block group">
                            <img src={mediaPreview} className="w-32 h-32 object-cover rounded-2xl border-4 border-blue-500/30 shadow-2xl" alt="Preview" />
                            <button
                                onClick={() => { setMediaPreview(null); setSelectedFile(null); }}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                            >
                                <FaTimes size={12} />
                            </button>
                            {uploading && (
                                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-white rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="h-[1.5px] w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-sm opacity-60" />

                {/* Input Area */}
                <div className="p-3 sm:p-5 pb-16 sm:pb-24 bg-black/5 safe-bottom">
                    {canMessage ? (
                        <form onSubmit={handleSend} className="flex items-center gap-4 relative mb-6 sm:mb-8">
                            <div className="flex items-center gap-1">
                                <div className="relative" ref={emojiPickerRef}>
                                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2.5 rounded-2xl transition-all ${darkMode ? "text-gray-400 hover:bg-[#FAFAFA]/10" : "text-gray-500 hover:bg-gray-100"}`}>
                                        <FaSmile size={22} />
                                    </button>
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-full left-0 mb-4 z-[100] shadow-2xl border-2 border-blue-500/20 rounded-2xl" style={{ maxWidth: 'min(300px, 90vw)' }}>
                                            <EmojiPicker onEmojiClick={onEmojiClick} theme={darkMode ? 'dark' : 'light'} width={Math.min(300, typeof window !== 'undefined' ? window.innerWidth * 0.85 : 300)} height={350} />
                                        </div>
                                    )}
                                </div>
                                <button type="button" onClick={() => fileInputRef.current.click()} className={`p-2.5 rounded-2xl transition-all ${darkMode ? "text-gray-400 hover:bg-[#FAFAFA]/10" : "text-gray-500 hover:bg-gray-100"}`}>
                                    <FaImage size={22} />
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div className="flex-1 relative p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-xl focus-within:scale-[1.01] transition-all">
                                <input
                                    type="text"
                                    placeholder={selectedFile ? "Add a caption..." : "Write something awesome..."}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className={`w-full rounded-[14px] px-6 py-3.5 font-bold text-sm focus:outline-none transition-colors ${darkMode ? "bg-gray-900 text-white placeholder-gray-600" : "bg-[#FAFAFA] text-gray-900 placeholder-gray-500"}`}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={(!newMessage.trim() && !selectedFile) || uploading}
                                className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                            >
                                <FaPaperPlane size={20} />
                            </button>
                        </form>
                    ) : (
                        <div className="py-4 px-6 text-center bg-red-500/10 rounded-2xl border-2 border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg animate-pulse mb-6 sm:mb-8">
                            Messaging is currently disabled for this group
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
