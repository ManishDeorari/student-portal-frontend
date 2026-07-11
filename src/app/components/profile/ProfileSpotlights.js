"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye } from 'lucide-react';
import SmartPostModal from '../Post/SmartPostModal';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
export default function ProfileSpotlights({ userId, currentUser, darkMode }) {
  const [spotlights, setSpotlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchSpotlights = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/posts/achievements/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSpotlights(res.data);
      } catch (err) {
        console.error("Error fetching spotlights:", err);
        setError("Failed to load spotlights.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSpotlights();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-2xl text-center ${darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  if (spotlights.length === 0) {
    return null; // Don't show the section at all if there are no spotlights
  }

  const handleViewAnnouncement = (announcement) => {
    setSelectedPost(announcement);
    setShowPostModal(true);
  };

  return (
    <>
      <div className={`mt-8 mb-8 p-1 sm:p-[2px] rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-2xl`}>
        <div className={`p-4 sm:p-6 rounded-[calc(1.5rem-2px)] ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg transform -rotate-6">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                College Spotlights
              </h2>
              <p className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                Official Recognitions & Achievements
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {spotlights.slice(0, 5).map((post, idx) => {
                const eventName = post.announcementDetails?.eventName || "Event / Organization";
                const achievementCategory = post.announcementDetails?.achievementCategory || "Placement";
                const winnerInfo = post.announcementDetails?.winners?.find(w => {
                    const wId = w.userId?._id ? w.userId._id.toString() : w.userId?.toString();
                    const matchesUser = wId === userId?.toString();
                    const matchesGroup = w.groupMembers && w.groupMembers.some(m => {
                        const mId = m?._id ? m._id.toString() : m?.toString();
                        return mId === userId?.toString();
                    });
                    return matchesUser || matchesGroup;
                });
                
                return (
                    <div key={idx} className="relative p-[1.5px] bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl transition-transform hover:scale-[1.02]">
                        <div className={`flex justify-between items-center gap-2 p-3 rounded-[calc(0.75rem-1.5px)] h-full ${darkMode ? "bg-[#1A1A1B]" : "bg-white"}`}>
                            <div className="flex flex-col gap-1 min-w-0">
                                <h4 className={`font-black text-base leading-tight truncate ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                    {achievementCategory}: <span className="font-medium">{eventName}</span>
                                </h4>
                                <div className={`text-[11px] font-bold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    Role/Title: <span className="font-black text-emerald-500">{winnerInfo?.roleTitle || winnerInfo?.rank || "N/A"}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold mt-1">
                                    {winnerInfo?.points > 0 && <span className="text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded">+{winnerInfo.points} PTS</span>}
                                    <span className="text-emerald-600 dark:text-emerald-500 px-1 uppercase tracking-widest font-black text-[10px]">Achiever</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleViewAnnouncement(post)}
                                className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg border-0 transition-all shadow-md hover:shadow-lg text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-cyan-700 active:scale-[0.98]`}
                                title="View Announcement"
                            >
                                <Eye className="w-4 h-4" /> View
                            </button>
                        </div>
                    </div>
                );
            })}

            {spotlights.length > 5 && (
              <div className="pt-2 text-center">
                <Link href={`/profile/${userId === "me" ? currentUser?._id : userId}/spotlights`} className="inline-block p-[2px] rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:scale-[1.02] transition-transform">
                  <span className={`block px-6 py-2 rounded-[calc(0.75rem-2px)] text-sm font-black ${darkMode ? "bg-slate-900 text-white" : "bg-white text-emerald-700"}`}>
                    View All Spotlights ({spotlights.length})
                  </span>
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* SmartPostModal for viewing full announcement details */}
      {showPostModal && selectedPost && (
          <SmartPostModal
              isOpen={showPostModal}
              onClose={() => setShowPostModal(false)}
              post={selectedPost}
              currentUser={currentUser}
              darkMode={darkMode}
          />
      )}
    </>
  );
}
