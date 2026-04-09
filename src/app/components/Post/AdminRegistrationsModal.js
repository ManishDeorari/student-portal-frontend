"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
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
          className={`relative w-full max-w-3xl ${darkMode ? "bg-[#121213] border-white/10" : "bg-[#FAFAFA] border-gray-200"} border rounded-[2rem] shadow-2xl overflow-hidden my-auto`}
        >
          <div className={`px-8 py-6 border-b ${darkMode ? "border-white/10" : "border-gray-100"} flex items-center justify-between`}>
            <div>
              <h2 className={`text-xl font-black ${darkMode ? "text-white" : "text-black"}`}>Event Registrations</h2>
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
          ) : data.registrations.length === 0 ? (
            <div className="text-center py-10 opacity-50">No registrations yet.</div>
          ) : (
            <div className="space-y-4">
              {data.registrations.map((reg) => (
                <div key={reg._id} className="p-[1.2px] rounded-2xl bg-gradient-to-r from-blue-500/30 to-purple-600/30 hover:from-blue-500 hover:to-purple-600 transition-all duration-300">
                  <div 
                    onClick={() => toggleRow(reg._id)}
                    className={`p-4 rounded-[15px] flex items-center gap-4 cursor-pointer transition-all ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-black hover:bg-gray-50"}`}
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                      <Image src={reg.userId?.profilePicture || "/default-profile.jpg"} alt={reg.userId?.name || "User"} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black ${darkMode ? "text-white" : "text-black"}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-widest mr-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>[{reg.groupName}]</span>
                        {reg.userId?.name}
                      </p>
                      <p className={`text-xs flex items-center flex-wrap gap-2 ${darkMode ? "text-white/50" : "text-black/50"}`}>
                        <span className="truncate">{reg.userId?.email}</span>
                        {reg.isGroup && (
                          <span className="inline-flex items-center gap-1 text-blue-500 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                            👥 Group ({reg.groupMembers?.length + 1})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className={`text-[10px] font-bold ${darkMode ? "text-white/40" : "text-black/40"}`}>{new Date(reg.registeredAt).toLocaleDateString()}</p>
                        <p className={`text-[10px] font-bold ${darkMode ? "text-white/40" : "text-black/40"}`}>{new Date(reg.registeredAt).toLocaleTimeString()}</p>
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
                                   <p className={`text-[10px] font-bold ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Headcount +1</p>
                                 </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                    <div className="flex flex-col">
                                      <span className={`text-[9px] font-black uppercase tracking-tighter ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Full Name</span>
                                      <span className={`text-[11px] font-bold ${darkMode ? "text-white" : "text-black"}`}>{reg.userId?.name}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className={`text-[9px] font-black uppercase tracking-tighter ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Email Address</span>
                                      <span className={`text-[11px] font-bold ${darkMode ? "text-white" : "text-black"}`}>{reg.userId?.email}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className={`text-[9px] font-black uppercase tracking-tighter ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Enrollment #</span>
                                      <span className={`text-[11px] font-bold ${darkMode ? "text-white" : "text-black"}`}>{reg.userId?.enrollmentNumber}</span>
                                    </div>
                                    {Object.entries(reg.answers || {}).map(([key, value]) => {
                                      if (!value || key === "$init") return null;
                                      const normalizedKey = key.toLowerCase().trim();
                                      if (['name', 'email', 'enrollmentnumber'].includes(normalizedKey)) return null;
                                      
                                      return (
                                        <div key={key} className="flex flex-col">
                                          <span className={`text-[9px] font-black uppercase tracking-tighter ${darkMode ? "text-gray-500" : "text-black/50"}`}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                          <span className={`text-[11px] font-bold ${darkMode ? "text-white" : "text-black"}`}>{String(value)}</span>
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
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                     {Object.entries(member).map(([key, value]) => {
                                       if (!value) return null;
                                       return (
                                         <div key={key} className="flex flex-col">
                                           <span className={`text-[9px] font-black uppercase tracking-tighter ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                           <span className={`text-[11px] font-bold ${darkMode ? "text-white" : "text-black"}`}>{String(value)}</span>
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminRegistrationsModal;
