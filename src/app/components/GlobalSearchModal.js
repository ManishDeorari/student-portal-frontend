"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import UserAvatar from "./ui/UserAvatar";
import UserNameWithBadge from "./ui/UserNameWithBadge";

export default function GlobalSearchModal({ isOpen, onClose, onPostSelect, darkMode = false, token }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], posts: [], events: [] });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults({ users: [], posts: [], events: [] });
    }
  }, [isOpen]);

  const handleOpenPost = async (postId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        onPostSelect(data);
        onClose(); // Automatically close search modal so post modal is fully visible
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || query.trim().length < 2) {
        setResults({ users: [], posts: [], events: [] });
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/search?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setResults(data);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, token]);

  if (!isOpen) return null;

  const hasResults = results.users.length > 0;

  return (
    <div className="fixed inset-0 z-[999999] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-[1.5rem] shadow-2xl p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative"
      >
        <div className={`w-full h-full rounded-[calc(1.5rem-2px)] overflow-hidden ${darkMode ? "bg-[#121213] text-white" : "bg-[#FAFAFA] text-gray-900"}`}>
          <div className={`p-4 border-b flex items-center gap-3 ${darkMode ? "border-white/10" : "border-black/5"}`}>
          <span className="text-xl">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className={`w-full bg-transparent border-none outline-none text-lg font-bold ${darkMode ? "text-white placeholder-gray-400" : "text-black placeholder-gray-500"}`}
          />
          <button onClick={onClose} className={`text-xl font-black rounded-full w-8 h-8 flex items-center justify-center transition-colors ${darkMode ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-black"}`}>×</button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading ? (
            <div className="p-8 text-center opacity-50">Searching...</div>
          ) : !hasResults && query.trim().length >= 2 ? (
            <div className="p-8 text-center opacity-50">No results found for &quot;{query}&quot;</div>
          ) : query.trim().length < 2 ? (
            <div className="p-8 text-center opacity-50 text-sm">Type at least 2 characters to search</div>
          ) : (
            <div className="space-y-4 p-2">
              {results.users.length > 0 && (
                <div>
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-2 px-2 ${darkMode ? "text-white" : "text-black"}`}>Users</h3>
                  <div className="space-y-1">
                      {results.users.map(user => (
                        <div key={user._id} className="p-[1.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl mb-1.5 hover:scale-[1.02] transition-all duration-300 shadow-sm">
                          <Link href={`/profile/${user.publicId || user._id}`} onClick={onClose} className={`flex items-center justify-between gap-3 p-2 rounded-[calc(0.75rem-1.5px)] w-full transition-colors ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 p-[1.5px] bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full relative shrink-0 flex items-center justify-center">
                                <div className={`w-full h-full rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-gray-200"}`}>
                                  <UserAvatar user={user} src={user.profilePicture} alt="Profile" width={40} height={40} wrapperClassName="w-full h-full rounded-full" className="object-cover w-full h-full rounded-full" />
                                </div>
                              </div>
                              <div className="min-w-0">
                                <UserNameWithBadge 
                                  user={user} 
                                  className={`text-sm font-bold truncate ${darkMode ? "text-white" : "text-black"}`} 
                                />
                                {user.role === 'admin' || user.role === 'faculty' ? (
                                  <p className={`text-[10px] truncate ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                    {user.employeeId || "Staff"}
                                    {user.department ? ` • ${user.department}` : ""}
                                    {user.position ? ` • ${user.position}` : ""}
                                  </p>
                                ) : (
                                  <p className={`text-[10px] truncate ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                    {user.enrollmentNumber} 
                                    {user.course ? ` • ${user.course}` : ""} 
                                    {user.branch ? ` • ${user.branch}` : ""} 
                                    {user.semester ? ` • Sem ${user.semester}` : ""}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className={`px-2 py-0.5 rounded shrink-0 text-[9px] font-black uppercase tracking-widest ${
                              user.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                              user.role === 'faculty' ? 'bg-amber-500/10 text-amber-500' :
                              user.role === 'alumni' ? 'bg-purple-500/10 text-purple-500' :
                              'bg-blue-500/10 text-blue-500'
                            }`}>
                              {user.role}
                            </div>
                          </Link>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </motion.div>
    </div>
  );
}
