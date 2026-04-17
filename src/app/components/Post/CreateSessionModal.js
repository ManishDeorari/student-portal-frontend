"use client";
import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { createPost } from "../../../api/dashboard";
import EmojiPickerToggle from "./utils/EmojiPickerToggle";
import PostLoadingScreen from "./utils/PostLoadingScreen";

const CreateSessionModal = ({ isOpen, onClose, currentUser, darkMode = false, setPosts }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [sessionDetails, setSessionDetails] = useState({
    schoolOrCollege: "Graphic Era Hill University",
    campus: "Dehradun",
    date: "",
    time: ""
  });
  const [errors, setErrors] = useState([]);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e;
    setSessionDetails(prev => ({ ...prev, [name]: value }));
    setErrors(prev => prev.filter(err => err !== name));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) {
      toast.error("❌ You can upload up to 6 images.");
      return;
    }
    setImages([...images, ...files]);
    setVideo(null);
    setPreviewVideo(null);
    e.target.value = ""; // Reset for re-selection
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("❌ Video must be smaller than 100MB.");
        return;
      }
      setVideo(file);
      setPreviewVideo(URL.createObjectURL(file));
      setImages([]);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setContent((prev) => prev + emoji.native);
    setErrors(prev => prev.filter(err => err !== "content"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = [];
    if (!content.trim()) newErrors.push("content");
    if (!sessionDetails.schoolOrCollege) newErrors.push("schoolOrCollege");
    if (sessionDetails.schoolOrCollege === "Graphic Era Hill University" && !sessionDetails.campus) newErrors.push("campus");
    if (!sessionDetails.date) newErrors.push("date");
    if (!sessionDetails.time) newErrors.push("time");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      toast.error("❌ Please fill in all required fields.");
      return;
    }
    setErrors([]);

    setLoading(true);
    try {
      // For Sessions, we set the type and request points for the owner
      const sessionData = {
        content,
        type: "Session",
        sessionDetails,
        pointsRequested: true,
        pointsStatus: "pending"
      };

      const result = await createPost(sessionData, images, video);

      if (result.post) {
        toast.success("🎉 Session created! Awaiting admin approval for points.");
        if (setPosts) {
          setPosts(prev => {
            const exists = prev.some(p => p._id === result.post._id);
            if (exists) return prev;
            return [result.post, ...prev];
          });
        }
        onClose();
      } else {
        toast.error("❌ Failed to create session.");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className={`p-[2px] rounded-2xl sm:rounded-[2.6rem] bg-gradient-to-tr from-blue-500 to-purple-600 w-full max-w-2xl my-auto shadow-2xl transition-all max-h-[95dvh] sm:max-h-[90vh]`}>
        <div className={`relative w-full h-full ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-xl sm:rounded-[2.5rem] overflow-hidden`}>
          {/* Header */}
          <div className={`px-4 sm:px-8 py-4 sm:py-6 border-b ${darkMode ? "border-white/10" : "border-gray-100"} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
               <span className="text-3xl">🤝</span>
               <div>
                  <h2 className={`text-lg sm:text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"} tracking-tight leading-none`}>
                    Create Student Session
                  </h2>
                  <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${darkMode ? "text-blue-500" : "text-blue-400"}`}>
                    Earn Points for Campus Engagement
                  </p>
               </div>
            </div>
            <button onClick={onClose} className={`text-3xl ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-black"} transition-colors`}>
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5 sm:space-y-8">
            <div className="space-y-6">
              {/* Media Section */}
              <div className="p-[2px] rounded-3xl bg-gradient-to-r from-blue-500 to-purple-500">
                <div className={`p-4 border-2 border-dashed border-transparent ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-[1.7rem] text-center`}>
                  <div className="flex justify-center gap-12 mb-2">
                    <label className="cursor-pointer group flex flex-col items-center">
                      <span className="text-3xl block filter grayscale group-hover:grayscale-0 transition-all">📷</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Add Photo</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                    </label>
                    <label className="cursor-pointer group flex flex-col items-center">
                      <span className="text-3xl block filter grayscale group-hover:grayscale-0 transition-all">🎥</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Add Video</span>
                      <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mt-4 border-t pt-4 border-white/5">
                      {images.map((img, index) => (
                        <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 shadow-lg group/img">
                          <Image src={URL.createObjectURL(img)} alt="preview" fill className="object-cover" />
                          <button 
                            type="button"
                            onClick={() => {
                                const updated = images.filter((_, i) => i !== index);
                                setImages(updated);
                            }}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {previewVideo && (
                    <div className="mt-4 rounded-xl overflow-hidden max-h-48 border border-white/10 relative group/vid">
                      <video src={previewVideo} controls className="w-full" />
                      <button 
                        type="button"
                        onClick={() => { setVideo(null); setPreviewVideo(null); }}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover/vid:opacity-100 transition-opacity z-10"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"}`}>Session Description</label>
                  <EmojiPickerToggle onEmojiSelect={handleEmojiSelect} icon="😀" darkMode={darkMode} />
                </div>
                <div className="p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="6"
                    placeholder="Tell everyone what your session is about..."
                    className={`w-full p-4 rounded-[14px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none resize-none text-sm font-medium`}
                  />
                </div>
              </div>

              {/* Session Logistics (School, Campus, Time) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"} ${errors.includes("schoolOrCollege") ? "text-red-500" : ""}`}>College</label>
                  <div className={errors.includes("schoolOrCollege") ? "p-[2px] rounded-2xl bg-red-500 shadow-lg animate-pulse" : "p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm"}>
                    <div className="relative">
                      <select
                        name="schoolOrCollege"
                        value={sessionDetails.schoolOrCollege}
                        onChange={(e) => handleInputChange(e.target)}
                        className={`w-full p-4 rounded-[14px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none cursor-pointer appearance-none font-bold`}
                      >
                        <option value="Graphic Era Hill University">Graphic Era Hill University</option>
                        <option value="Graphic Era Deemed to be University">Graphic Era Deemed to be University</option>
                      </select>
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? "text-white" : "text-black"}`}>
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {sessionDetails.schoolOrCollege === "Graphic Era Hill University" && (
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"} ${errors.includes("campus") ? "text-red-500" : ""}`}>Campus</label>
                    <div className={errors.includes("campus") ? "p-[2px] rounded-2xl bg-red-500 shadow-lg animate-pulse" : "p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm"}>
                      <div className="relative">
                        <select
                          name="campus"
                          value={sessionDetails.campus}
                          onChange={(e) => handleInputChange(e.target)}
                          className={`w-full p-4 rounded-[14px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none cursor-pointer appearance-none font-bold`}
                        >
                          <option value="Dehradun">Dehradun</option>
                          <option value="Haldwani">Haldwani</option>
                          <option value="Bhimtal">Bhimtal</option>
                        </select>
                        <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? "text-white" : "text-black"}`}>
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"} ${errors.includes("date") ? "text-red-500" : ""}`}>Select Date</label>
                  <div className={errors.includes("date") ? "p-[2px] rounded-2xl bg-red-500 shadow-lg animate-pulse" : "p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm"}>
                    <input
                      type="date"
                      name="date"
                      value={sessionDetails.date}
                      onChange={(e) => handleInputChange(e.target)}
                      className={`w-full p-4 rounded-[14px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none font-bold [&::-webkit-calendar-picker-indicator]:opacity-100 ${darkMode ? "[&::-webkit-calendar-picker-indicator]:invert" : ""}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"} ${errors.includes("time") ? "text-red-500" : ""}`}>Select Time</label>
                  <div className={errors.includes("time") ? "p-[2px] rounded-2xl bg-red-500 shadow-lg animate-pulse" : "p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm"}>
                    <input
                      type="time"
                      name="time"
                      value={sessionDetails.time}
                      onChange={(e) => handleInputChange(e.target)}
                      className={`w-full p-4 rounded-[14px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none font-bold [&::-webkit-calendar-picker-indicator]:opacity-100 ${darkMode ? "[&::-webkit-calendar-picker-indicator]:invert" : ""}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Post Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 sm:py-6 rounded-2xl sm:rounded-[2.5rem] text-xs sm:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed opacity-60" 
                  : "bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:shadow-blue-500/25"
              }`}
            >
              {loading ? "Creating Session..." : "Submit Session for Approval"}
            </button>
          </form>
        </div>
      </div>
      <PostLoadingScreen type="Session" loading={loading} darkMode={darkMode} />
    </div>
  );
};

export default CreateSessionModal;
