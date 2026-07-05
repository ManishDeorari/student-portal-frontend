"use client";
import React, { useState, useEffect } from "react";
import UserAvatar from "../ui/UserAvatar";
import { fetchEventRegistrations, downloadEventCSV } from "../../../api/dashboard";
import toast from "react-hot-toast";

import { motion, AnimatePresence } from "framer-motion";

const AdminRegistrationsModal = ({ event, isOpen, onClose, darkMode = false }) => {
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [data, setData] = useState({ totalCount: 0, registrations: [] });
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    if (isOpen && event?._id) {
      loadRegistrations();
    }
  }, [isOpen, event?._id]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const result = await fetchEventRegistrations(event._id);
      setData(result);
    } catch (err) {
      toast.error("Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    setIsDownloading(true);
    try {
      await downloadEventCSV(event._id, event.title);
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
                <h2 className={`text-xl font-black ${darkMode ? "text-white" : "text-black"}`}>Event Registrations</h2>
                <p className="text-sm font-bold mt-1">
                  <span className={darkMode ? "text-orange-400" : "text-orange-600"}>{event.title}</span>
                  <span className={`mx-2 ${darkMode ? "text-white/40" : "text-black/40"}`}>•</span>
                  <span className={darkMode ? "text-blue-400" : "text-blue-600"}>Total: {data.totalCount}</span>
                </p>
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
          ) : data.registrations.length === 0 ? (
            <div className="text-center py-10 opacity-50">No registrations yet.</div>
          ) : (
            <div className="space-y-4">
              {data.registrations.map((reg) => (
                <div key={reg._id} className="p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm hover:shadow-md transition-all duration-300">
                  <div 
                    onClick={() => toggleRow(reg._id)}
                    className={`p-4 rounded-[14px] flex items-center gap-4 cursor-pointer transition-all ${darkMode ? "bg-[#121213]" : "bg-white"} hover:opacity-90`}
                  >
                    <UserAvatar 
                      user={reg.userId}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                      wrapperClassName="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className={`text-lg font-black tracking-tight flex items-center gap-2 ${darkMode ? "text-orange-400" : "text-orange-600"}`}>
                        {reg.isGroup && reg.groupName && (
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${darkMode ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-orange-100 text-orange-700 border border-orange-200"}`}>
                            {reg.groupName}
                          </span>
                        )}
                        {reg.userId?.name || "Unknown User"}
                      </p>
                      <div className="mt-1 flex items-center flex-wrap gap-2">
                        <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-black tracking-widest uppercase ${darkMode ? "bg-blue-500 text-white" : "bg-blue-600 text-white"}`}>
                          {reg.userId?.enrollmentNumber || reg.userId?.email || "N/A"}
                        </span>
                        {reg.isGroup && (
                          <span className="inline-flex items-center gap-1 text-blue-500 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border border-blue-500/20">
                            👥 Group ({reg.groupMembers?.length + 1})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="flex flex-col items-end justify-center">
                        <p className={`text-xs font-black uppercase tracking-wider ${darkMode ? "text-white" : "text-black"}`}>{new Date(reg.registeredAt).toLocaleDateString()}</p>
                        <p className={`text-[11px] font-bold ${darkMode ? "text-white" : "text-black"}`}>{new Date(reg.registeredAt).toLocaleTimeString()}</p>
                      </div>
                      <div className={`text-gray-400 transition-transform duration-300 ${expandedRows[reg._id] ? "rotate-180" : ""}`}>
                        ▼
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedRows[reg._id] && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`overflow-hidden ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-b-[15px]`}
                      >
                        <div className="p-4 pt-0 space-y-3">
                           {/* Member 1 / Personal Answers */}
                           <div className="p-[1px] rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20">
                              <div className={`p-4 rounded-[11px] ${darkMode ? "bg-slate-800 text-white" : "bg-blue-50/30 text-black"} space-y-3`}>
                                 <div className="flex justify-between items-center border-b border-dashed border-gray-500/20 pb-2">
                                   <p className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Member 1 (Primary)</p>
                                   <p className={`text-[10px] font-bold ${darkMode ? "text-white" : "text-black"}`}>Headcount +1</p>
                                 </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                    <div className="p-[1.5px] rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-sm">
                                      <div className={`flex flex-col p-2.5 rounded-[10.5px] h-full ${darkMode ? "bg-slate-800" : "bg-white"}`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-orange-400" : "text-orange-600"}`}>Full Name</span>
                                        <span className={`text-[12px] font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>{reg.userId?.name || "N/A"}</span>
                                      </div>
                                    </div>
                                    <div className="p-[1.5px] rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-sm">
                                      <div className={`flex flex-col p-2.5 rounded-[10.5px] h-full ${darkMode ? "bg-slate-800" : "bg-white"}`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-orange-400" : "text-orange-600"}`}>Email Address</span>
                                        <span className={`text-[12px] font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>{reg.userId?.email || "N/A"}</span>
                                      </div>
                                    </div>
                                    <div className="p-[1.5px] rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-sm">
                                      <div className={`flex flex-col p-2.5 rounded-[10.5px] h-full ${darkMode ? "bg-slate-800" : "bg-white"}`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-orange-400" : "text-orange-600"}`}>Enrollment #</span>
                                        <span className={`text-[12px] font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>{reg.userId?.enrollmentNumber || "N/A"}</span>
                                      </div>
                                    </div>
                                    {Object.entries(reg.answers || {}).map(([key, value]) => {
                                      if (!value || key === "$init") return null;
                                      const normalizedKey = key.toLowerCase().trim();
                                      if (['name', 'email', 'enrollmentnumber'].includes(normalizedKey)) return null;
                                      
                                      return (
                                        <div key={key} className="p-[1.5px] rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-sm">
                                          <div className={`flex flex-col p-2.5 rounded-[10.5px] h-full ${darkMode ? "bg-slate-800" : "bg-white"}`}>
                                            <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-orange-400" : "text-orange-600"}`}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            <span className={`text-[12px] font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>{String(value)}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                 </div>
                              </div>
                           </div>

                           {/* Other Group Members */}
                           {reg.isGroup && reg.groupMembers?.map((member, idx) => (
                              <div key={idx} className="p-[1px] rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-600/10">
                                <div className={`p-4 rounded-[11px] ${darkMode ? "bg-slate-800/40 text-white" : "bg-[#FAFAFA] text-black"} space-y-3 shadow-sm`}>
                                   <div className="flex justify-between items-center border-b border-dashed border-gray-500/20 pb-2">
                                     <p className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Member {idx + 2}</p>
                                     <p className={`text-[10px] font-bold ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Headcount +1</p>
                                   </div>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                     {Object.entries(member).map(([key, value]) => {
                                       if (!value) return null;
                                       return (
                                         <div key={key} className="p-[1.5px] rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-sm">
                                           <div className={`flex flex-col p-2.5 rounded-[10.5px] h-full ${darkMode ? "bg-slate-800" : "bg-white"}`}>
                                             <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-orange-400" : "text-orange-600"}`}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                             <span className={`text-[12px] font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>{String(value)}</span>
                                           </div>
                                         </div>
                                       );
                                     })}
                                   </div>
                                </div>
                              </div>
                           ))}
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
    </AnimatePresence>
  );
};

export default AdminRegistrationsModal;
