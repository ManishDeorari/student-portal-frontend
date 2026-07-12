"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const UserSearchInput = ({ 
  value = "", 
  onChange, 
  onSelect, 
  placeholder = "Search for a user by name or email...", 
  darkMode = false,
  className = ""
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Sync internal state with external value if it changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAndFilterUsers = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setResults(data.users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (val) => {
    setQuery(val);
    setIsOpen(true);
    if (onChange) onChange(val);
    fetchAndFilterUsers(val);
  };

  const handleSelect = (user) => {
    setQuery(user.name);
    setResults([]);
    setIsOpen(false);
    if (onChange) onChange(user.name);
    if (onSelect) onSelect(user);
  };

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      <div className="relative flex items-center h-full w-full">
        {!className.includes('!bg-transparent') && (
          <FaSearch className={`absolute left-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={
            className || 
            `w-full h-full pl-9 pr-3 py-2 rounded-xl outline-none transition-all ${
              darkMode 
                ? "bg-slate-800 text-white placeholder-gray-500 focus:bg-slate-700" 
                : "bg-gray-50 text-black placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            }`
          }
        />
        {loading && (
          <div className="absolute right-3 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[9999] top-[calc(100%+4px)] left-0 w-full max-w-[350px] sm:w-[400px] rounded-2xl shadow-xl overflow-hidden border ${
              darkMode ? "bg-[#121213] border-white/10" : "bg-white border-gray-100"
            }`}
          >
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
              {results.length === 0 && !loading ? (
                <div className="p-4 text-center opacity-50">
                  <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    No users found
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleSelect(user)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        darkMode ? "hover:bg-slate-800" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white ${darkMode ? "bg-slate-700" : "bg-gray-200 text-gray-500"}`}>
                        {user.avatar ? (
                          <Image src={user.avatar} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          user.name?.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold truncate text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {user.name}
                        </p>
                        <p className={`text-[10px] font-black uppercase tracking-widest truncate ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSearchInput;
