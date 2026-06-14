"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function GlobalSearchModal({ isOpen, onClose, darkMode = false, token }) {
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

  const hasResults = results.users.length > 0 || results.posts.length > 0 || results.events.length > 0;

  return (
    <div className="fixed inset-0 z-[999999] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border ${darkMode ? "bg-slate-900 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}`}
      >
        <div className={`p-4 border-b flex items-center gap-3 ${darkMode ? "border-white/10" : "border-gray-100"}`}>
          <span className="text-xl opacity-60">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, posts, events..."
            className={`w-full bg-transparent border-none outline-none text-lg ${darkMode ? "placeholder-gray-500" : "placeholder-gray-400"}`}
          />
          <button onClick={onClose} className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded bg-black/5 hover:bg-black/10">ESC</button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading ? (
            <div className="p-8 text-center opacity-50">Searching...</div>
          ) : !hasResults && query.trim().length >= 2 ? (
            <div className="p-8 text-center opacity-50">No results found for "{query}"</div>
          ) : query.trim().length < 2 ? (
            <div className="p-8 text-center opacity-50 text-sm">Type at least 2 characters to search</div>
          ) : (
            <div className="space-y-4 p-2">
              {results.users.length > 0 && (
                <div>
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-2 px-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Users</h3>
                  <div className="space-y-1">
                    {results.users.map(user => (
                      <Link href={`/profile/${user._id}`} key={user._id} onClick={onClose} className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${darkMode ? "hover:bg-white/5" : "hover:bg-black/5"}`}>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 relative shrink-0">
                          {user.profilePicture ? (
                             <Image src={user.profilePicture} alt="Profile" fill className="object-cover" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-500 to-purple-500 text-white text-xs font-bold">{user.name.charAt(0)}</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{user.name}</p>
                          <p className={`text-[10px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user.role} • {user.enrollmentNumber}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.events.length > 0 && (
                <div>
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-2 px-2 pt-2 border-t ${darkMode ? "text-gray-500 border-white/5" : "text-gray-400 border-gray-100"}`}>Events</h3>
                  <div className="space-y-1">
                    {results.events.map(event => (
                      <Link href={`/events/${event._id}`} key={event._id} onClick={onClose} className={`block p-3 rounded-xl transition-colors ${darkMode ? "hover:bg-white/5" : "hover:bg-black/5"}`}>
                        <p className="text-sm font-bold truncate">📅 {event.title}</p>
                        <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{event.location} • By {event.createdBy?.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.posts.length > 0 && (
                <div>
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-2 px-2 pt-2 border-t ${darkMode ? "text-gray-500 border-white/5" : "text-gray-400 border-gray-100"}`}>Posts</h3>
                  <div className="space-y-1">
                    {results.posts.map(post => (
                      <Link href={`/dashboard`} key={post._id} onClick={onClose} className={`block p-3 rounded-xl transition-colors ${darkMode ? "hover:bg-white/5" : "hover:bg-black/5"}`}>
                        {post.title && <p className="text-sm font-bold truncate">{post.title}</p>}
                        <p className={`text-xs line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{post.content}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
