"use client";
import React, { useState } from "react";
import Image from "next/image";
import { createPost } from "../../../api/dashboard";
import toast from "react-hot-toast";
import EmojiPickerToggle from "../Post/utils/EmojiPickerToggle";
import CreateEventModal from "./CreateEventModal";
import CreateAnnouncementModal from "./CreateAnnouncementModal";
import CreateSessionModal from "./CreateSessionModal";
import PostLoadingScreen from "./utils/PostLoadingScreen";

const CreatePost = ({ setPosts, currentUser, darkMode = false }) => {
  const [content, setContent] = useState("");
  const [video, setVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState("Regular");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const availableTags = [];
  if (currentUser?.role === "student") availableTags.push("Session");
  if (currentUser?.role === "faculty" || currentUser?.isAdmin) {
    availableTags.push("Event");
    availableTags.push("Announcement");
  }

  const hasContent = content.trim().length > 0;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) {
      setError("You can upload up to 6 images.");
      return;
    }
    setImages([...images, ...files]);
    setVideo(null);
    setPreviewVideo(null);
    setError("");
    e.target.value = "";
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("❌ Please upload a video smaller than 100MB.");
        e.target.value = "";
        return;
      }
      setVideo(file);
      setPreviewVideo(URL.createObjectURL(file));
      setImages([]);
      setError("");
    }
    e.target.value = "";
  };

  const handleEmojiSelect = (emoji) => {
    setContent((prev) => prev + emoji.native);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasContent) {
      toast.error("❌ Please add a caption or emoji before posting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createPost(content, images, video, selectedType);

      const newPost = result?.data || result?.post || (Array.isArray(result.posts) ? result.posts[0] : null);

      setContent("");
      setVideo(null);
      setPreviewVideo(null);
      setImages([]);
      setSelectedType("Regular");

      if (newPost && setPosts) {
        setPosts(prev => {
          const exists = prev.some((p) => p._id === newPost._id);
          if (exists) return prev;
          return [newPost, ...prev];
        });
        toast.success("🎉 Post uploaded successfully!", { autoClose: 1500 });
      } else {
        console.warn("❌ Unexpected post format:", result);
        toast.error("❌ Post failed to upload correctly.");
      }
    } catch (err) {
      console.error("Post error:", err);
      toast.error("❌ Post failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} p-4 sm:p-8 rounded-[2.5rem] shadow-sm transition-colors duration-500`}>
      <h2 className={`text-base sm:text-xl font-black ${darkMode ? "text-white" : "text-gray-900"} tracking-tight mb-3 sm:mb-6 flex items-center gap-2`}>
        <span className={`${darkMode ? "bg-blue-900/40" : "bg-blue-50"} p-2 rounded-xl`}>📢</span>
        Create a Post
      </h2>

      <div className={`p-[2.5px] ${darkMode ? "bg-gradient-to-tr from-blue-900 to-purple-900 shadow-none border border-white/10" : "bg-gradient-to-tr from-blue-600 to-purple-700 shadow-[0_20px_60px_rgba(37,99,235,0.2)]"} rounded-[2.6rem] transition-all duration-500`}>
        <div className={`relative rounded-[2.5rem] p-3 sm:p-6 space-y-3 sm:space-y-4 transition-all duration-500 ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-gray-900"}`}>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-3">
              <div className="flex-1 space-y-2">
                <div className="relative">
                  <div className={`p-[1px] bg-gradient-to-tr from-blue-600 to-purple-700 rounded-2xl shadow-lg transition-all duration-500`}>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What's on your mind?"
                      className={`w-full border-2 ${darkMode ? "border-white/20 bg-[#0f172a] text-white" : "border-black bg-[#FAFAFA] text-black"} rounded-[15px] p-3 resize-none placeholder-gray-500 focus:ring-0 transition-all duration-500`}
                      rows="3"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-2 flex-nowrap overflow-x-auto pb-1 no-scrollbar">
                    {(currentUser?.role === "student") && (
                      <button
                        type="button"
                        onClick={() => setIsSessionModalOpen(true)}
                        className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap font-bold border transition-all ${darkMode ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600" : "bg-[#FAFAFA] text-black border-black hover:bg-gray-100"}`}
                      >
                        🤝 Create Session
                      </button>
                    )}
                    {(currentUser?.isAdmin || currentUser?.role === "faculty") && (
                      <button
                        type="button"
                        onClick={() => setIsAnnouncementModalOpen(true)}
                        className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap font-bold border transition-all ${darkMode ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600" : "bg-[#FAFAFA] text-black border-black hover:bg-gray-100"}`}
                      >
                        📢 Create Announcement
                      </button>
                    )}
                    {(currentUser?.role === "faculty" || currentUser?.isAdmin) && (
                      <button
                        type="button"
                        onClick={() => setIsEventModalOpen(true)}
                        className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap font-bold border transition-all ${darkMode ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600" : "bg-[#FAFAFA] text-black border-black hover:bg-gray-100"}`}
                      >
                        📅 Create Event
                      </button>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <EmojiPickerToggle
                      onEmojiSelect={handleEmojiSelect}
                      icon="😀"
                      iconSize="text-2xl"
                      offset={{ x: 0, y: 0 }}
                      placement="top"
                      darkMode={darkMode}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-3">
                  <div className="flex items-center gap-4">
                    <label className={`cursor-pointer ${darkMode ? "text-blue-400" : "text-blue-600"} font-bold hover:underline text-sm flex items-center gap-1.5`}>
                      <span>📷</span> Photo
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    <label className={`cursor-pointer ${darkMode ? "text-purple-400" : "text-purple-600"} font-bold hover:underline text-sm flex items-center gap-1.5`}>
                      <span>🎥</span> Video
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !hasContent}
                    className="px-5 sm:px-8 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {loading ? "Posting..." : "Post Now"}
                  </button>
                </div>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                {images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative w-28 h-28">
                        <Image
                          src={URL.createObjectURL(img)}
                          alt={`preview-${index}`}
                          width={112}
                          height={112}
                          className="rounded-lg object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = images.filter((_, i) => i !== index);
                            setImages(updated);
                          }}
                          className="absolute top-1 right-1 bg-black bg-opacity-50 text-white px-1 rounded-full text-xs"
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {previewVideo && (
                  <div className="relative mt-3 max-h-64">
                    <video
                      src={previewVideo}
                      controls
                      className="rounded-lg max-h-64 w-full"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setVideo(null);
                        setPreviewVideo(null);
                      }}
                      className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-sm"
                    >
                      ❌
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
      {isEventModalOpen && (
        <CreateEventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          currentUser={currentUser}
          darkMode={darkMode}
          setPosts={setPosts}
        />
      )}
      {isAnnouncementModalOpen && (
        <CreateAnnouncementModal
          isOpen={isAnnouncementModalOpen}
          onClose={() => setIsAnnouncementModalOpen(false)}
          currentUser={currentUser}
          darkMode={darkMode}
          setPosts={setPosts}
        />
      )}
      {isSessionModalOpen && (
        <CreateSessionModal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          currentUser={currentUser}
          darkMode={darkMode}
          setPosts={setPosts}
        />
      )}
      <PostLoadingScreen type={selectedType} loading={loading} darkMode={darkMode} />
    </div>
  );
};

export default CreatePost;
