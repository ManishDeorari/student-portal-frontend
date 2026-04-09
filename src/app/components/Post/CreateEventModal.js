"use client";
import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { createEvent } from "../../../api/dashboard";
import EmojiPickerToggle from "./utils/EmojiPickerToggle";
import PostLoadingScreen from "./utils/PostLoadingScreen";

const CreateEventModal = ({ isOpen, onClose, currentUser, darkMode = false, setPosts }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    timezone: "IST",
    endDate: "",
    registrationCloseDate: "",
    allowGroupRegistration: true,
    showRegistrationInsights: true,
  });

  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  // Registration Form Builder State
  const [registrationFields, setRegistrationFields] = useState({
    name: true,
    profileLink: true,
    enrollmentNumber: true,
    email: true,
    phoneNumber: true,
    course: true,
    courseYear: true,
    branchName: true,
    currentCompany: true,
    currentCity: true,
  });

  const [customQuestions, setCustomQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFieldToggle = (field) => {
    setRegistrationFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const addCustomQuestion = () => {
    if (newQuestion.trim()) {
      setCustomQuestions([...customQuestions, { question: newQuestion, type: "text" }]);
      setNewQuestion("");
    }
  };

  const removeCustomQuestion = (index) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) {
      toast.error("You can upload up to 6 images.");
      return;
    }
    setImages([...images, ...files]);
    setVideo(null);
    setPreviewVideo(null);
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
    setFormData((prev) => ({ ...prev, description: prev.description + emoji.native }));
  };

  const handleTitleEmojiSelect = (emoji) => {
    setFormData((prev) => ({ ...prev, title: prev.title + emoji.native }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = [];
    if (!formData.title) newErrors.push("title");
    if (!formData.description) newErrors.push("description");
    if (!formData.startDate) newErrors.push("startDate");
    if (!formData.startTime) newErrors.push("startTime");
    if (!formData.endDate) newErrors.push("endDate");
    if (!formData.registrationCloseDate) newErrors.push("registrationCloseDate");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      toast.error("❌ Please fill in all required fields.");
      return;
    }
    setErrors([]);

    setLoading(true);
    try {
      const eventData = {
        ...formData,
        registrationFields,
        customQuestions,
      };

      const result = await createEvent(eventData, images, video);

      if (result.event) {
        toast.success("🎉 Event created successfully!");
        onClose();
      } else {
        toast.error("❌ Failed to create event.");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const getErrorClass = (field) => {
    return errors.includes(field)
      ? "p-[2px] rounded-2xl bg-red-500 shadow-lg animate-pulse"
      : "p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 focus-within:ring-2 focus-within:ring-purple-400 shadow-sm transition-all";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className={`p-[2px] rounded-2xl sm:rounded-[2.6rem] bg-gradient-to-tr from-blue-500 to-purple-600 w-full max-w-2xl my-auto shadow-2xl transition-all max-h-[95dvh] sm:max-h-[90vh]`}>
        <div className={`relative w-full h-full ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-xl sm:rounded-[2.5rem] overflow-hidden`}>
        {/* Header */}
        <div className={`px-4 sm:px-8 py-4 sm:py-6 border-b ${darkMode ? "border-white/10" : "border-gray-100"} flex items-center justify-between`}>
          <h2 className={`text-lg sm:text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"} tracking-tight flex items-center gap-2`}>
            <span>📅</span> Create Event
          </h2>
          <button onClick={onClose} className={`text-2xl ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-black"} transition-colors`}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5 sm:space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Media Section */}
          <div className="space-y-4">
            <div className="p-[2px] rounded-3xl bg-gradient-to-r from-blue-500 to-purple-500">
              <div className={`p-6 border-2 border-dashed border-transparent ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-[1.7rem] text-center`}>
                <div className="flex justify-center gap-6 mb-4">
                  <label className="cursor-pointer group">
                    <span className="text-3xl block filter grayscale group-hover:grayscale-0 transition-all">📷</span>
                    <span className={`text-xs font-bold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Add Photos</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  </label>
                  <label className="cursor-pointer group">
                    <span className="text-3xl block filter grayscale group-hover:grayscale-0 transition-all">🎥</span>
                    <span className={`text-xs font-bold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Add Video</span>
                    <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                  </label>
                </div>

                {/* Media Preview */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden">
                        <Image src={URL.createObjectURL(img)} alt="preview" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                {previewVideo && (
                  <div className="mt-4 rounded-xl overflow-hidden max-h-48">
                    <video src={previewVideo} controls className="w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Event Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"} ${errors.includes("title") ? "text-red-500" : ""}`}>Event Title</label>
                <EmojiPickerToggle onEmojiSelect={handleTitleEmojiSelect} icon="😀" darkMode={darkMode} />
              </div>
              <div className={getErrorClass("title")}>
                <input
                  name="title"
                  value={formData.title}
                  onChange={(e) => { handleInputChange(e); setErrors(prev => prev.filter(err => err !== "title")); }}
                  placeholder="Enter event title..."
                  className={`w-full p-3 sm:p-4 rounded-[14px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"} ${errors.includes("startDate") ? "text-red-500" : ""}`}>Start Date</label>
              <div className={getErrorClass("startDate")}>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={(e) => { handleInputChange(e); setErrors(prev => prev.filter(err => err !== "startDate")); }}
                  className={`w-full p-4 rounded-[14px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"} ${errors.includes("startTime") ? "text-red-500" : ""}`}>Start Time</label>
              <div className={getErrorClass("startTime")}>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={(e) => { handleInputChange(e); setErrors(prev => prev.filter(err => err !== "startTime")); }}
                  className={`w-full p-4 rounded-[14px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"} ${errors.includes("registrationCloseDate") ? "text-red-500" : ""}`}>Reg. Close Date</label>
              <div className={getErrorClass("registrationCloseDate")}>
                <input
                  type="date"
                  name="registrationCloseDate"
                  value={formData.registrationCloseDate}
                  onChange={(e) => { handleInputChange(e); setErrors(prev => prev.filter(err => err !== "registrationCloseDate")); }}
                  className={`w-full p-4 rounded-[14px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"} ${errors.includes("endDate") ? "text-red-500" : ""}`}>End Date</label>
              <div className={getErrorClass("endDate")}>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={(e) => { handleInputChange(e); setErrors(prev => prev.filter(err => err !== "endDate")); }}
                  className={`w-full p-4 rounded-[14px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none`}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"} ${errors.includes("description") ? "text-red-500" : ""}`}>Description</label>
              <EmojiPickerToggle onEmojiSelect={handleEmojiSelect} icon="😀" darkMode={darkMode} />
            </div>
            <div className={getErrorClass("description")}>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => { handleInputChange(e); setErrors(prev => prev.filter(err => err !== "description")); }}
                rows="4"
                placeholder="Describe your event..."
                className={`w-full p-4 rounded-[14px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none resize-none`}
              />
            </div>
          </div>

          {/* Registration Form Builder */}
          <div className="p-[2px] rounded-[2rem] bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm transition-all text-left">
            <div className={`p-6 rounded-[1.8rem] ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} space-y-6`}>
              <h3 className={`text-base sm:text-lg font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Registration Form <span className="text-xs font-normal opacity-60 ml-2">[Questions to be asked]</span></h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(registrationFields).map((field) => {
                const isMandatory = ['name', 'email', 'enrollmentNumber'].includes(field);
                return (
                  <label key={field} className={`flex items-center gap-3 ${isMandatory ? 'cursor-not-allowed' : 'cursor-pointer group'}`}>
                    <input 
                      type="checkbox"
                      className="w-5 h-5 accent-blue-600 cursor-pointer"
                      checked={registrationFields[field]}
                      disabled={isMandatory}
                      onChange={() => !isMandatory && handleFieldToggle(field)}
                    />
                    <span className={`text-sm font-bold capitalize ${darkMode ? (isMandatory ? "text-white" : "text-gray-300") : "text-black"}`}>
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                      {isMandatory && <span className="ml-1 text-[10px] text-red-500 font-black uppercase">*Required</span>}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="space-y-4 pt-4 border-t border-dashed border-gray-300 dark:border-white/10">
              <div className="flex gap-2">
                <input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Custom question..."
                  className={`flex-1 min-w-0 p-2.5 sm:p-3 text-xs sm:text-sm rounded-xl border ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-[#FAFAFA] border-gray-200"}`}
                />
                <button type="button" onClick={addCustomQuestion} className="px-3 sm:px-4 py-2 bg-black text-white rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap shrink-0">+ Add</button>
              </div>

              <div className="space-y-2">
                {customQuestions.map((q, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? "bg-[#FAFAFA]/5" : "bg-[#FAFAFA] shadow-sm"}`}>
                    <span className={`text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>{q.question}</span>
                    <button type="button" onClick={() => removeCustomQuestion(i)} className="text-red-500 text-sm font-bold">Remove</button>
                  </div>
                ))}
              </div>
            </div>
           </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className={`text-sm font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"}`}>Event Settings</h3>
            <div className="flex flex-col gap-4">
              <label className={`flex items-center justify-between p-4 rounded-2xl border ${darkMode ? "border-white/5 bg-slate-800" : "border-blue-100 bg-blue-50/50"}`}>
                <span className={`text-sm font-bold ${darkMode ? "text-gray-200" : "text-black"}`}>Allow Group Registration (2-4 members)</span>
                <input type="checkbox" name="allowGroupRegistration" checked={formData.allowGroupRegistration} onChange={handleInputChange} className="w-5 h-5 accent-blue-600" />
              </label>
              <label className={`flex items-center justify-between p-4 rounded-2xl border ${darkMode ? "border-white/5 bg-slate-800" : "border-blue-100 bg-blue-50/50"}`}>
                <span className={`text-sm font-bold ${darkMode ? "text-gray-200" : "text-black"}`}>Show counts and names of registered users</span>
                <input type="checkbox" name="showRegistrationInsights" checked={formData.showRegistrationInsights} onChange={handleInputChange} className="w-5 h-5 accent-blue-600" />
              </label>
            </div>
          </div>

          {/* Post Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 sm:py-5 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:shadow-blue-500/25"
            }`}
          >
            {loading ? "Processing Fields..." : "Post Event Now"}
          </button>
        </form>
      </div>
      <PostLoadingScreen type="Event" loading={loading} darkMode={darkMode} />
     </div>
    </div>
  );
};

export default CreateEventModal;
