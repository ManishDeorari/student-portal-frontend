"use client";
import React, { useState, useEffect } from "react";
import UserAvatar from "../ui/UserAvatar";
import { fetchEventReposts, downloadEventRepostsCSV } from "../../../api/dashboard";
import toast from "react-hot-toast";

import { motion, AnimatePresence } from "framer-motion";
import PostModal from "./Visual/PostModal";

const AdminRepostsModal = ({ event, isOpen, onClose, darkMode = false, currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [data, setData] = useState({ totalCount: 0, reposts: [] });
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedRepost, setSelectedRepost] = useState(null);

  useEffect(() => {
    if (isOpen && event?._id) {
      loadReposts();
    }
  }, [isOpen, event?._id]);

  const loadReposts = async () => {
    setLoading(true);
    try {
      const result = await fetchEventReposts(event._id);
      setData(result);
    } catch (err) {
      toast.error("Failed to load reposts.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    setIsDownloading(true);
    try {
      await downloadEventRepostsCSV(event._id, event.title);
      toast.success("CSV download started!");
    } catch (err) {
      toast.error("Failed to download CSV.");
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`relative w-full max-w-3xl p-[2px] ${darkMode ? "bg-gradient-to-tr from-blue-900 to-purple-900" : "bg-gradient-to-tr from-blue-600 to-purple-700"} rounded-[2rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] my-auto flex flex-col`}
        >
          <div className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-[calc(2rem-2px)] w-full overflow-hidden flex flex-col max-h-[85vh]`}>
            <div className={`px-8 py-6 border-b ${darkMode ? "border-white/10" : "border-gray-100"} flex items-center justify-between`}>
              <div>
                <h2 className={`text-xl font-black ${darkMode ? "text-white" : "text-black"}`}>Event Reposts</h2>
                <p className={`text-xs ${darkMode ? "text-white/60" : "text-black/60"}`}>{event.title} • Total: {data.totalCount}</p>
            </div>
            <div className="flex gap-4 items-center">
              <button 
                onClick={handleDownloadCSV}
                disabled={isDownloading}
                className={`px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow-md ${isDownloading ? "opacity-50 cursor-wait" : "hover:bg-green-700 active:scale-95"}`}
              >
                {isDownloading ? "⏳ Downloading..." : "📊 Download CSV"}
              </button>
              <button onClick={onClose} className="text-2xl text-gray-400 hover:text-red-500 transition-colors">&times;</button>
            </div>
          </div>

          <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : data.reposts.length === 0 ? (
            <div className="text-center py-10 opacity-50">No reposts yet.</div>
          ) : (
            <div className="space-y-4">
              {data.reposts.map((repost) => (
                <div key={repost._id} className="p-[1.2px] rounded-2xl bg-gradient-to-r from-blue-500/30 to-purple-600/30 hover:from-blue-500 hover:to-purple-600 transition-all duration-300">
                  <div 
                    onClick={() => toggleRow(repost._id)}
                    className={`p-4 rounded-[15px] flex items-center gap-4 cursor-pointer transition-all ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black hover:bg-gray-50"}`}
                  >
                    <UserAvatar 
                      user={repost.user}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                      wrapperClassName="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className={`text-base font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                        {repost.user?.name || "Unknown User"}
                      </p>
                      <p className="mt-1">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${darkMode ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-blue-100 text-blue-700 border border-blue-200"}`}>
                          {repost.user?.enrollmentNumber || "N/A"}
                        </span>
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="flex flex-col items-end justify-center">
                        <p className={`text-[11px] font-black uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{new Date(repost.createdAt).toLocaleDateString()}</p>
                        <p className={`text-[10px] font-bold ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{new Date(repost.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <div className={`text-gray-400 transition-transform duration-300 ${expandedRows[repost._id] ? "rotate-180" : ""}`}>
                        ▼
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedRows[repost._id] && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`overflow-hidden ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-b-[15px]`}
                      >
                        <div className="p-4 pt-0 space-y-3">
                           <div className="p-[1px] rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20">
                              <div className={`p-4 rounded-[11px] ${darkMode ? "bg-slate-800 text-white" : "bg-blue-50/30 text-black"} space-y-3`}>
                                 <div className="flex justify-between items-center border-b border-dashed border-gray-500/20 pb-3">
                                   <p className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Repost Details</p>
                                   <button 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       setSelectedRepost(repost);
                                     }}
                                     className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95 ${darkMode ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                                   >
                                     🔗 View Post
                                   </button>
                                 </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="p-[1.5px] rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-sm">
                                      <div className={`flex flex-col p-2.5 rounded-[10.5px] h-full ${darkMode ? "bg-slate-800" : "bg-white"}`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-orange-400" : "text-orange-600"}`}>Full Name</span>
                                        <span className={`text-[11px] font-bold ${darkMode ? "text-white" : "text-black"}`}>{repost.user?.name || "N/A"}</span>
                                      </div>
                                    </div>
                                    <div className="p-[1.5px] rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-sm">
                                      <div className={`flex flex-col p-2.5 rounded-[10.5px] h-full ${darkMode ? "bg-slate-800" : "bg-white"}`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-orange-400" : "text-orange-600"}`}>Enrollment Number</span>
                                        <span className={`text-[11px] font-bold ${darkMode ? "text-white" : "text-black"}`}>{repost.user?.enrollmentNumber || "N/A"}</span>
                                      </div>
                                    </div>
                                    <div className="p-[1.5px] rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-sm">
                                      <div className={`flex flex-col p-2.5 rounded-[10.5px] h-full ${darkMode ? "bg-slate-800" : "bg-white"}`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-orange-400" : "text-orange-600"}`}>Course</span>
                                        <span className={`text-[11px] font-bold ${darkMode ? "text-white" : "text-black"}`}>{repost.user?.course || "N/A"}</span>
                                      </div>
                                    </div>
                                    <div className="p-[1.5px] rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-sm">
                                      <div className={`flex flex-col p-2.5 rounded-[10.5px] h-full ${darkMode ? "bg-slate-800" : "bg-white"}`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-orange-400" : "text-orange-600"}`}>Semester</span>
                                        <span className={`text-[11px] font-bold ${darkMode ? "text-white" : "text-black"}`}>{repost.user?.semester || "N/A"}</span>
                                      </div>
                                    </div>
                                    <div className="p-[1.5px] rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-sm">
                                      <div className={`flex flex-col p-2.5 rounded-[10.5px] h-full ${darkMode ? "bg-slate-800" : "bg-white"}`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-orange-400" : "text-orange-600"}`}>Branch & Section</span>
                                        <span className={`text-[11px] font-bold ${darkMode ? "text-white" : "text-black"}`}>{repost.user?.branch || "N/A"}</span>
                                      </div>
                                    </div>
                                    {repost.content && (
                                      <div className="p-[1.5px] rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-sm sm:col-span-2">
                                        <div className={`flex flex-col p-2.5 rounded-[10.5px] h-full ${darkMode ? "bg-slate-800" : "bg-white"}`}>
                                          <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-orange-400" : "text-orange-600"}`}>Repost Caption</span>
                                          <span className={`text-[11px] font-bold italic ${darkMode ? "text-white/80" : "text-black/80"}`}>"{repost.content}"</span>
                                        </div>
                                      </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
        </motion.div>
      </div>
      
      {/* Post Modal for viewing the Repost */}
      {selectedRepost && (
        <PostModal
          post={selectedRepost}
          isOpen={true}
          onClose={() => setSelectedRepost(null)}
          darkMode={darkMode}
          currentUser={currentUser}
        />
      )}
    </AnimatePresence>
  );
};

export default AdminRepostsModal;
