"use client";
import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { createAnnouncement } from "../../../api/dashboard";
import EmojiPickerToggle from "./utils/EmojiPickerToggle";
import UserSearchInput from "./utils/UserSearchInput";
import PostLoadingScreen from "./utils/PostLoadingScreen";

const CreateAnnouncementModal = ({ isOpen, onClose, currentUser, darkMode = false, setPosts }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    content: "",
    isWinnerAnnouncement: false,
    pointsRequested: true,
    eventName: "",
  });

  const [winners, setWinners] = useState([
    { name: "", rank: "", points: "", uniqueId: "", isGroup: false, groupId: null, groupName: "" }
  ]);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors.includes(name)) {
      setErrors(prev => prev.filter(e => e !== name));
    }
  };

  const handleWinnerChange = (index, field, value) => {
    const updatedWinners = [...winners];
    const winner = updatedWinners[index];
    
    // If it's a linked field (rank, points, groupName) and this row is in a group
    if (winner.groupId && ["rank", "points", "groupName"].includes(field)) {
      updatedWinners.forEach(w => {
        if (w.groupId === winner.groupId) {
          w[field] = value;
        }
      });
    } else {
      updatedWinners[index][field] = value;
    }

    setWinners(updatedWinners);
    
    // Clear individual field error
    const fieldId = `winner-${field}-${index}`;
    if (errors.includes(fieldId)) {
      setErrors(prev => prev.filter(e => e !== fieldId));
    }
  };

  const handleUserSelect = (index, user) => {
    const updatedWinners = [...winners];
    updatedWinners[index].name = user.name;
    updatedWinners[index].uniqueId = user.publicId || user.enrollmentNumber || "";
    updatedWinners[index].userId = user._id;
    updatedWinners[index].profilePicture = user.profilePicture || "";
    setWinners(updatedWinners);
  };

  const addWinnerRow = () => {
    setWinners([...winners, { name: "", rank: "", points: "", uniqueId: "", isGroup: false, groupId: null, groupName: "" }]);
  };

  const addGroupWinnerRows = (count) => {
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRows = Array.from({ length: count }, () => ({
      name: "",
      rank: "",
      points: "",
      uniqueId: "",
      isGroup: true,
      groupId: groupId,
      groupName: ""
    }));
    setWinners([...winners, ...newRows]);
  };

  const removeWinnerRow = (index) => {
    const winnerToRemove = winners[index];
    if (winners.length > 1) {
      if (winnerToRemove.groupId) {
        // Option: Remove just the row, or the whole group?
        // Let's remove just the row as it gives more flexibility.
        setWinners(winners.filter((_, i) => i !== index));
      } else {
        setWinners(winners.filter((_, i) => i !== index));
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImages([file]); // Only 1 image
      setVideo(null);
      setPreviewVideo(null);
    }
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
    setFormData((prev) => ({ ...prev, content: prev.content + emoji.native }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]); // Clear previous errors
    const newErrors = [];

    if (!formData.content.trim()) {
      newErrors.push("content");
    }

    if (formData.isWinnerAnnouncement) {
      if (!formData.eventName.trim()) {
        newErrors.push("eventName");
      }

      winners.forEach((w, i) => {
        if (!w.name?.trim()) newErrors.push(`winner-name-${i}`);
        if (!w.rank?.trim()) newErrors.push(`winner-rank-${i}`);
        if (!w.points?.toString().trim()) newErrors.push(`winner-points-${i}`);
      });
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      toast.error("❌ Please fill in all required fields marked in red.");
      return;
    }

    setLoading(true);
    try {
      const winnersData = winners
        .filter(w => w.name.trim() !== "")
        .map(w => ({
          name: w.name,
          rank: w.rank,
          points: parseInt(w.points) || 0,
          uniqueId: w.uniqueId,
          isGroup: !!w.groupId,
          groupId: w.groupId || "",
          groupName: w.groupName || "",
          userId: w.userId,
          profilePicture: w.profilePicture || ""
        }));

      const announcementData = {
        content: formData.content,
        announcementDetails: {
          isWinnerAnnouncement: formData.isWinnerAnnouncement,
          eventName: formData.isWinnerAnnouncement ? formData.eventName : "",
          winners: formData.isWinnerAnnouncement ? winnersData : [],
          pointsRequested: formData.isWinnerAnnouncement, // Always true if winners table exists
        }
      };

      const result = await createAnnouncement(announcementData, images, video);

      if (result.post) {
        toast.success("🎉 Announcement created successfully!");
        if (setPosts) {
          setPosts(prev => {
            const exists = prev.some(p => p._id === result.post._id);
            if (exists) return prev;
            return [result.post, ...prev];
          });
        }
        onClose();
      } else {
        toast.error("❌ Failed to create announcement.");
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
      <div className={`p-[2px] rounded-2xl sm:rounded-[2.6rem] bg-gradient-to-tr from-blue-500 to-purple-600 w-full max-w-4xl my-auto shadow-2xl transition-all max-h-[95dvh] sm:max-h-[90vh]`}>
        <div className={`relative w-full h-full ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-xl sm:rounded-[2.5rem] overflow-hidden`}>
          {/* Header */}
          <div className={`px-4 sm:px-8 py-4 sm:py-6 border-b ${darkMode ? "border-white/10" : "border-gray-100"} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
               <span className="text-3xl">📢</span>
               <div>
                  <h2 className={`text-lg sm:text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"} tracking-tight leading-none`}>
                    Create Announcement
                  </h2>
                  <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Posts with structured winner tables & points
                  </p>
               </div>
            </div>
            <button onClick={onClose} className={`text-3xl ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-black"} transition-colors`}>
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5 sm:space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Event Content & Media Section - Vertical Stack */}
            <div className="space-y-6">
              {/* Media Section */}
              <div className="p-[2px] rounded-3xl bg-gradient-to-r from-blue-500 to-purple-500">
                <div className={`p-4 border-2 border-dashed border-transparent ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-[1.7rem] text-center`}>
                  <div className="flex justify-center gap-12 mb-2">
                    <label className="cursor-pointer group flex flex-col items-center">
                      <span className="text-3xl block filter grayscale group-hover:grayscale-0 transition-all">📷</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Add Photo</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    <label className="cursor-pointer group flex flex-col items-center">
                      <span className="text-3xl block filter grayscale group-hover:grayscale-0 transition-all">🎥</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Add Video</span>
                      <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mt-4 border-t pt-4 border-white/5">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 shadow-lg group/img">
                          <Image src={URL.createObjectURL(img)} alt="preview" fill className="object-cover" />
                          <button 
                            type="button"
                            onClick={() => setImages([])}
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
                  <label className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"}`}>Announcement Content</label>
                  <EmojiPickerToggle onEmojiSelect={handleEmojiSelect} icon="😀" darkMode={darkMode} />
                </div>
                <div className={getErrorClass("content")}>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe your announcement..."
                    className={`w-full p-4 rounded-[14px] ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black"} outline-none border-none resize-none text-sm font-medium`}
                  />
                </div>
              </div>
            </div>

            {/* Winner Table Toggle */}
            <div className="space-y-4">
              <div className={`p-[2px] rounded-[2rem] bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ${formData.isWinnerAnnouncement ? "opacity-100 shadow-[0_0_20px_rgba(59,130,246,0.15)]" : "opacity-60"}`}>
                <label className={`flex items-center justify-between p-4 sm:p-7 rounded-[calc(2rem-2px)] transition-all duration-300 cursor-pointer ${
                  formData.isWinnerAnnouncement 
                    ? (darkMode ? "bg-blue-600/20" : "bg-blue-50/80")
                    : (darkMode ? "bg-[#18181b]" : "bg-white")
                }`}>
                  <div className="flex items-center gap-3 sm:gap-5">
                     <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-transform duration-500 ${formData.isWinnerAnnouncement ? "scale-110 rotate-12" : "scale-100"} ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
                        🏆
                     </div>
                     <div>
                        <span className={`text-sm sm:text-base font-black tracking-tight block ${darkMode ? "text-white" : "text-black"}`}>Include Winners/Ranking Table</span>
                        <p className={`text-[10px] font-black uppercase tracking-[0.15em] mt-0.5 ${darkMode ? "text-blue-400/80" : "text-blue-600/70"}`}>
                          Enable to list winners and request points
                        </p>
                     </div>
                  </div>
                  <div className="relative">
                    <input type="checkbox" name="isWinnerAnnouncement" checked={formData.isWinnerAnnouncement} onChange={handleInputChange} className="w-7 h-7 rounded-full accent-blue-600 cursor-pointer" />
                  </div>
                </label>
              </div>

              {formData.isWinnerAnnouncement && (
                <div className={`p-[2px] rounded-[3rem] bg-gradient-to-br from-blue-500 to-purple-600`}>
                  <div className={`space-y-6 sm:space-y-8 p-4 sm:p-8 rounded-[calc(3rem-2px)] ${darkMode ? "bg-[#121213]" : "bg-white"} shadow-2xl`}>
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                         <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Winner List / Ranking Configuration</h3>
                      </div>

                      <div className="space-y-2">
                         <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${darkMode ? "text-gray-400" : "text-black/60"}`}>Event Name</label>
                         <div className={`p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 ${errors.includes("eventName") ? "from-red-500 to-red-600 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "shadow-sm"}`}>
                           <input 
                             name="eventName"
                             value={formData.eventName}
                             onChange={handleInputChange}
                             placeholder="e.g. Annual Sports Meet 2024"
                             className={`w-full p-4 h-[52px] text-sm font-black rounded-[calc(1rem-2px)] ${darkMode ? "bg-slate-800 text-white placeholder-gray-500" : "bg-white text-black placeholder-gray-400"} outline-none transition-all shadow-inner`}
                           />
                         </div>
                      </div>
                      <div className="space-y-4">
                        <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${darkMode ? "text-gray-400" : "text-black/60"}`}>Select Achievement Type</label>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 w-full">
                          <button
                            type="button"
                            onClick={addWinnerRow}
                            className={`flex items-center justify-center gap-2 sm:gap-4 py-3 sm:py-5 px-4 sm:px-8 rounded-2xl transition-all shadow-xl active:scale-95 bg-gradient-to-r from-blue-600 to-purple-700 text-white w-full h-[52px] sm:h-[68px] hover:shadow-blue-500/25 group`}
                          >
                            <span className="text-2xl group-hover:scale-110 transition-transform">👤</span>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Add Individual</span>
                          </button>
                          
                          <div className={`p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-xl h-[52px] sm:h-[68px]`}>
                             <div className={`flex items-center justify-between h-full px-3 sm:px-8 py-2 rounded-[calc(1rem-2px)] ${darkMode ? "bg-slate-800" : "bg-white"}`}>
                               <div className="flex items-center gap-3">
                                 <span className="text-2xl">👥</span>
                                 <span className={`text-[11px] font-black uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Add Group:</span>
                               </div>
                               <div className="flex gap-2">
                                 {[2, 3, 4].map(num => (
                                   <button
                                     key={num}
                                     type="button"
                                     onClick={() => addGroupWinnerRows(num)}
                                     className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${darkMode ? "bg-white/5 hover:bg-white/10 text-white border border-white/10" : "bg-gray-50 hover:bg-blue-600 hover:text-white text-black border border-gray-100 shadow-sm"}`}
                                   >
                                     {num}
                                   </button>
                                 ))}
                               </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  
                  <div className={`p-[2px] rounded-[3rem] bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/10`}>
                    <div className={`p-4 sm:p-6 rounded-[calc(3rem-2px)] ${darkMode ? "bg-[#0f172a]" : "bg-white"} min-h-[300px] sm:min-h-[400px] overflow-x-auto`}>
                      <table className="w-full text-left border-separate border-spacing-y-4 table-auto min-w-[600px]">
                        <thead>
                          <tr className={`text-[11px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-gray-400" : "text-black/80"}`}>
                            <th className="px-3 pb-1 w-[90px]">Type</th>
                            <th className="px-3 pb-1">Member Info</th>
                            <th className="px-3 pb-1 w-[130px]">Student ID</th>
                            <th className="px-3 pb-1 w-[130px]">Position</th>
                            <th className="px-3 pb-1 w-[90px]">Points</th>
                            <th className="pb-1 w-8 text-center"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {winners.map((winner, idx) => {
                            const isFirstInGroup = winner.groupId && winners.findIndex(w => w.groupId === winner.groupId) === idx;
                            const isSubsequent = winner.groupId && !isFirstInGroup;
                            const isIndividual = !winner.groupId;
                            
                            return (
                              <React.Fragment key={idx}>
                                {isFirstInGroup && (
                                  <tr className="group-header">
                                    <td colSpan={6} className="pt-6 pb-2">
                                       <div className="flex items-center gap-4">
                                          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                                          <div className={`p-[2px] rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 shadow-xl min-w-[300px] flex-1`}>
                                            <input 
                                              value={winner.groupName} 
                                              onChange={(e) => handleWinnerChange(idx, "groupName", e.target.value)}
                                              placeholder="Enter Team/Group Name..."
                                              className={`w-full h-[52px] p-4 text-xs font-black rounded-[calc(1rem-2px)] ${darkMode ? "bg-slate-900 text-white" : "bg-white text-black"} outline-none border-none italic text-center uppercase tracking-[0.2em]`}
                                            />
                                          </div>
                                          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                                       </div>
                                    </td>
                                  </tr>
                                )}
                              
                                <tr className={`group transition-all ${isSubsequent ? "border-none" : (isIndividual ? "border-t border-white/5 pt-4" : "")}`}>
                                  <td className="align-top pr-1 text-center">
                                    <div className={`flex items-center justify-center h-[52px] w-full text-xl transition-all ${winner.groupId ? "opacity-100 scale-110" : "opacity-100 scale-100"}`}>
                                      {winner.groupId ? "🔗" : "👤"}
                                    </div>
                                  </td>
                                  <td className="align-top">
                                    <div className="flex items-center gap-2">
                                      <div className={`p-[1.5px] rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 shadow-md flex-shrink-0`}>
                                        <div className={`w-8 h-8 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-gray-100"}`}>
                                           <Image 
                                             src={winner.profilePicture || "/default-profile.jpg"} 
                                             alt="avatar"
                                             width={32}
                                             height={32}
                                             className="w-full h-full object-cover"
                                           />
                                        </div>
                                      </div>
                                      <div className={`p-[2px] h-[52px] flex-1 flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 ${errors.includes(`winner-name-${idx}`) ? "from-red-500 to-red-600 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "shadow-sm"}`}>
                                        <UserSearchInput 
                                          darkMode={darkMode}
                                          role="student"
                                          placeholder={winner.groupId ? "Search member name..." : "Search student name..."} 
                                          value={winner.name}
                                          className={`!bg-transparent !border-none !shadow-none font-black !py-3 !text-[12px] h-[52px] ${darkMode ? "!text-white" : "!text-black"}`}
                                          onChange={(val) => {
                                             handleWinnerChange(idx, "name", val);
                                             if (!val) {
                                               handleWinnerChange(idx, "uniqueId", "");
                                               handleWinnerChange(idx, "profilePicture", "");
                                             }
                                          }}
                                          onSelect={(u) => handleUserSelect(idx, u)}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="align-top px-1.5">
                                    <div className={`p-[2px] h-[52px] flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm`}>
                                      <input 
                                        value={winner.uniqueId} 
                                        readOnly
                                        placeholder="Unique ID"
                                        className={`w-full h-full p-2 text-[11px] font-black rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-slate-800 text-blue-400" : "bg-white text-blue-600"} outline-none border-none italic cursor-not-allowed text-center uppercase`}
                                      />
                                    </div>
                                  </td>
                                  <td className="align-top px-1.5">
                                    {isFirstInGroup || isIndividual ? (
                                      <div className={`p-[2px] h-[52px] flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 ${errors.includes(`winner-rank-${idx}`) ? "from-red-500 to-red-600 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "shadow-sm"}`}>
                                        <input 
                                          value={winner.rank} 
                                          onChange={(e) => handleWinnerChange(idx, "rank", e.target.value)}
                                          placeholder="Rank/Pos"
                                          className={`w-full h-full p-2 text-[11px] font-black rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-slate-800 text-white" : "bg-white text-black"} outline-none border-none shadow-inner text-center uppercase`}
                                        />
                                      </div>
                                    ) : (
                                      <div className="h-[52px] flex items-center justify-center">
                                        <span className={`text-[9px] font-black uppercase opacity-25 tracking-tighter ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Linked</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="align-top px-1.5">
                                    {isFirstInGroup || isIndividual ? (
                                      <div className={`p-[2px] h-[52px] flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 ${errors.includes(`winner-points-${idx}`) ? "from-red-500 to-red-600 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "shadow-sm"}`}>
                                        <div className="relative w-full h-full flex items-center">
                                           <input 
                                             type="text"
                                             inputMode="numeric"
                                             value={winner.points} 
                                             onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                handleWinnerChange(idx, "points", val);
                                             }}
                                             placeholder="0"
                                             className={`w-full h-full p-2 text-[11px] font-black rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-slate-800 text-white" : "bg-white text-black"} outline-none border-none shadow-inner pr-8 text-center`}
                                           />
                                           <span className={`absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-black tracking-tighter ${darkMode ? "text-white/40" : "text-black/40"}`}>PTS</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="h-[52px] flex items-center justify-center">
                                        <span className={`text-[9px] font-black uppercase opacity-25 tracking-tighter ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Linked</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="align-top text-center">
                                    <div className="h-[52px] flex items-center justify-center">
                                      <button type="button" onClick={() => removeWinnerRow(idx)} className="text-red-500/40 hover:text-red-500 text-xl hover:bg-red-50 dark:hover:bg-red-900/20 w-10 h-10 flex items-center justify-center rounded-xl transition-all font-light">&times;</button>
                                    </div>
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className={`p-[2px] rounded-[2rem] bg-gradient-to-r from-green-500 to-emerald-700 shadow-2xl shadow-green-500/20`}>
                     <div className={`p-6 rounded-[calc(2rem-2px)] transition-all ${darkMode ? "bg-[#0f172a]" : "bg-green-50"}`}>
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${darkMode ? "bg-green-500/10" : "bg-green-100/50"}`}>
                              <span className="animate-pulse">⚡</span>
                           </div>
                           <div>
                              <span className={`text-sm font-black tracking-tight ${darkMode ? "text-white" : "text-black"}`}>Points System Active</span>
                              <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${darkMode ? "text-green-400" : "text-green-700"}`}>
                                Points will be automatically awarded to registered users with valid unique IDs upon Admin approval.
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            )}
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
              {loading ? "Publishing Announcement..." : "Post Announcement Now"}
            </button>
          </form>
        </div>
      </div>
      <PostLoadingScreen type="Announcement" loading={loading} darkMode={darkMode} />
    </div>
  );
};

export default CreateAnnouncementModal;
