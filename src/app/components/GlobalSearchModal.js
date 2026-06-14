"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const PostModal = dynamic(() => import("./Post/Visual/PostModal"), { ssr: false });

export default function GlobalSearchModal({ isOpen, onClose, darkMode = false, token }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], posts: [], events: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      const u = localStorage.getItem("user");
      if (u) setCurrentUser(JSON.parse(u));
    } else {
      setQuery("");
      setResults({ users: [], posts: [], events: [] });
      setSelectedPost(null);
    }
  }, [isOpen]);

  const handleOpenPost = async (postId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPost(data);
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

  const hasResults = results.users.length > 0 || results.posts.length > 0 || results.events.length > 0;

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
            placeholder="Search users, posts, events..."
            className={`w-full bg-transparent border-none outline-none text-lg font-bold ${darkMode ? "text-white placeholder-gray-400" : "text-black placeholder-gray-500"}`}
          />
          <button onClick={onClose} className={`text-xl font-black rounded-full w-8 h-8 flex items-center justify-center transition-colors ${darkMode ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-black"}`}>×</button>
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
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-2 px-2 ${darkMode ? "text-white" : "text-black"}`}>Users</h3>
                  <div className="space-y-1">
                    {results.users.map(user => (
                      <Link href={`/profile/${user.publicId || user._id}`} key={user._id} onClick={onClose} className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-black/5"}`}>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 relative shrink-0">
                          {user.profilePicture ? (
                             <Image src={user.profilePicture} alt="Profile" fill className="object-cover" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-500 to-purple-500 text-white text-xs font-bold">{user.name.charAt(0)}</div>
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-black"}`}>{user.name}</p>
                          <p className={`text-[10px] ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{user.role} • {user.enrollmentNumber}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.events.length > 0 && (
                <div>
                  <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent my-4" />
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-2 px-2 ${darkMode ? "text-white" : "text-black"}`}>Events</h3>
                  <div className="space-y-1">
                    {results.events.map(event => (
                      <button onClick={() => handleOpenPost(event._id)} key={event._id} className={`w-full text-left block p-3 rounded-xl transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-black/5"}`}>
                        <p className={`text-sm font-bold truncate ${darkMode ? "text-white" : "text-black"}`}>📅 {event.title}</p>
                        <p className={`text-xs truncate ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{event.location} • By {event.createdBy?.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.posts.length > 0 && (
                <div>
                  <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent my-4" />
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-2 px-2 ${darkMode ? "text-white" : "text-black"}`}>Posts</h3>
                  <div className="space-y-1">
                    {results.posts.map(post => (
                      <button onClick={() => handleOpenPost(post._id)} key={post._id} className={`w-full text-left block p-3 rounded-xl transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-black/5"}`}>
                        {post.title && <p className={`text-sm font-bold truncate ${darkMode ? "text-white" : "text-black"}`}>{post.title}</p>}
                        <p className={`text-xs line-clamp-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{post.content}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </motion.div>
      
      {/* Dynamic Post Modal Overlay */}
      {selectedPost && (
        <PostModal
          showModal={!!selectedPost}
          setShowModal={() => setSelectedPost(null)}
          post={selectedPost}
          currentUser={currentUser}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
