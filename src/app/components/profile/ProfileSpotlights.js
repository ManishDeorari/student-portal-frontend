"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../Post/PostCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileSpotlights({ userId, currentUser, darkMode }) {
  const [spotlights, setSpotlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
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

        <div className="space-y-6">
          {spotlights.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={currentUser}
              darkMode={darkMode}
              hideActions={true} // Hide like/comment buttons for a cleaner profile view
              transparentBackground={true}
            />
          ))}
        </div>
        
      </div>
    </div>
  );
}
