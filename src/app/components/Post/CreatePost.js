"use client";
import React, { useState, useEffect } from "react";
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
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(undefined);
  const [error, setError] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [selectedType, setSelectedType] = useState("Regular");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const availableTags = [];
  // if (currentUser?.role === "student") availableTags.push("Session");
  if (currentUser?.role === "faculty" || currentUser?.isAdmin) {
    availableTags.push("Event");
    availableTags.push("Announcement");
  }

  const hasContent = content.trim().length > 0;

  useEffect(() => {
    const savedDraft = localStorage.getItem("postDraft");
    if (savedDraft) {
      setContent(savedDraft);
    }
  }, []);

  useEffect(() => {
    if (content) {
      localStorage.setItem("postDraft", content);
    } else {
      localStorage.removeItem("postDraft");
    }
  }, [content]);

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

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(f => f.size <= 20 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast.error("❌ Some documents exceed the 20MB limit.");
    }
    
    if (validFiles.length + documents.length > 5) {
      toast.error("You can upload up to 5 documents.");
      return;
    }
    setDocuments([...documents, ...validFiles]);
    setError("");
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
    setUploadProgress(undefined);

    try {
      const postPayload = {
        content,
        type: selectedType,
      };
      if (publishAt) {
        postPayload.publishAt = new Date(publishAt).toISOString();
      }

      const result = await createPost(postPayload, images, video, selectedType, documents, {}, setUploadProgress);

      const newPost = result?.data || result?.post || (Array.isArray(result.posts) ? result.posts[0] : null);

      setContent("");
      setVideo(null);
      setPreviewVideo(null);
      setImages([]);
      setDocuments([]);
      setPublishAt("");
      setSelectedType("Regular");
      setUploadProgress(undefined);

      if (newPost && setPosts) {
        localStorage.removeItem("postDraft");
        setPosts(prev => {
          const exists = prev.some((p) => p._id === newPost._id);
          if (exists) return prev;
          return [newPost, ...prev];
        });
        toast.success("🎉 Post uploaded successfully!", { autoClose: 1500 });
        if (typeof setIsMainModalOpen === 'function') setIsMainModalOpen(false);
      } else {
        console.warn("❌ Unexpected post format:", result);
        toast.error("❌ Post failed to upload correctly.");
      }
    } catch (err) {
      console.error("Post error:", err);
      toast.error(`❌ Post failed: ${err.response?.data?.message || err.message || "Unknown error"}. Try again.`);
    } finally {
      setLoading(false);
    }
  };

  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Post");

  // Determine available tabs
  const tabs = [{ id: "Post", label: "✍️ Regular Post" }];
  // if (currentUser?.role === "student") {
  //   tabs.push({ id: "Session", label: "🤝 Session" });
  // }
  if (currentUser?.role === "faculty" || currentUser?.isAdmin) {
    tabs.push({ id: "Announcement", label: "📢 Announcement" });
    tabs.push({ id: "Event", label: "📅 Event" });
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Post":
        return (
          <div className="space-y-4">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col space-y-3">
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <div className={`p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-700 rounded-2xl shadow-lg transition-all duration-500`}>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className={`w-full border-none outline-none ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} rounded-[calc(1rem-2.5px)] p-3 resize-none placeholder-gray-500 focus:ring-0 transition-all duration-500`}
                        rows="4"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
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

                      <label className={`cursor-pointer ${darkMode ? "text-green-400" : "text-green-600"} font-bold hover:underline text-sm flex items-center gap-1.5`}>
                        <span>📄</span> Document
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt"
                          multiple
                          onChange={handleDocumentChange}
                          className="hidden"
                        />
                      </label>

                      <div className={`relative flex items-center gap-1.5 text-sm font-bold ${darkMode ? "text-orange-400" : "text-orange-600"}`}>
                        <span>⏱️</span>
                        <input
                          type="datetime-local"
                          value={publishAt}
                          onChange={(e) => setPublishAt(e.target.value)}
                          className={`bg-transparent border-b border-orange-500/30 focus:border-orange-500 outline-none p-1 text-[10px] sm:text-xs cursor-pointer ${darkMode ? "text-white [color-scheme:dark]" : "text-black"} transition-colors`}
                          title="Schedule Post"
                        />
                      </div>
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

                  {documents.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      {documents.map((doc, index) => (
                        <div key={index} className={`relative flex items-center justify-between p-3 rounded-xl border ${darkMode ? "bg-[#1a1a1c] border-white/10" : "bg-white border-gray-200"} shadow-sm`}>
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-2xl">📄</span>
                            <span className={`text-sm font-bold truncate ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{doc.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = documents.filter((_, i) => i !== index);
                              setDocuments(updated);
                            }}
                            className="text-red-500 hover:text-red-700 p-1 bg-red-500/10 rounded-lg ml-2"
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        );
      case "Event":
        return <CreateEventModal isInline={true} isOpen={true} onClose={() => setIsMainModalOpen(false)} currentUser={currentUser} setPosts={setPosts} darkMode={darkMode} />;
      case "Announcement":
        return <CreateAnnouncementModal isInline={true} isOpen={true} onClose={() => setIsMainModalOpen(false)} currentUser={currentUser} setPosts={setPosts} darkMode={darkMode} />;
      case "Session":
        return <CreateSessionModal isInline={true} isOpen={true} onClose={() => setIsMainModalOpen(false)} currentUser={currentUser} setPosts={setPosts} darkMode={darkMode} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-[1.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2rem] shadow-md mb-4">
      <div className={`w-full ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} p-2.5 sm:p-3 rounded-[calc(2rem-1.5px)] transition-colors duration-500`}>
        <div className="flex items-center gap-3">
          <div className="flex-1 p-[1.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95">
            <div 
              onClick={() => setIsMainModalOpen(true)}
              className={`w-full h-full py-2.5 px-3 rounded-[calc(0.75rem-1.5px)] cursor-pointer transition-all duration-300 flex items-center ${darkMode ? "bg-[#121213] text-gray-300 hover:bg-[#1a1a1c]" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <span className="text-lg mr-2">✍️</span>
              <span className="font-medium text-xs sm:text-sm">Start a post...</span>
            </div>
          </div>
        <button 
          onClick={() => setIsMainModalOpen(true)}
          className="hidden sm:block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-md hover:shadow-blue-500/25 active:scale-95 whitespace-nowrap"
        >
          Create Post
        </button>
      </div>

      {isMainModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl transition-all ${darkMode ? "bg-[#1a1a1c]" : "bg-white"}`}>
            {/* Modal Header & Tabs */}
            <div className={`p-4 sm:p-6 border-b ${darkMode ? "border-white/10" : "border-gray-200"}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl sm:text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"} flex items-center gap-2`}>
                  Create Post
                </h2>
                <button 
                  onClick={() => setIsMainModalOpen(false)} 
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${darkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-black"} transition-colors`}
                >
                  &times;
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : `${darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className={`p-4 sm:p-6 max-h-[75vh] overflow-y-auto custom-scrollbar ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"}`}>
              {renderTabContent()}
            </div>
          </div>
        </div>
      )}

      <PostLoadingScreen loading={loading} type={selectedType} darkMode={darkMode} progress={uploadProgress} />
      </div>
    </div>
  );
};

export default CreatePost;
