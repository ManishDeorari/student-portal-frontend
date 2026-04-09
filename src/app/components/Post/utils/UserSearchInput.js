"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { searchUsers } from "../../../../api/dashboard";

const UserSearchInput = ({ value, onChange, placeholder, onSelect, darkMode = false, role = null, className = "" }) => {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (val) => {
    setQuery(val);
    onChange(val);
    if (val.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const data = await searchUsers(val, role);
      setResults(data);
      setIsOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (user) => {
    setQuery(user.name);
    setResults([]);
    setIsOpen(false);
    onSelect(user);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        placeholder={placeholder}
        className={`w-full p-3 text-xs rounded-xl border ${
          darkMode 
            ? "bg-slate-900 text-white border-white/10" 
            : "bg-white text-black border-gray-100 shadow-sm"
        } outline-none focus:ring-1 focus:ring-blue-500 transition-all ${className}`}
      />
      
      {isOpen && results.length > 0 && (
        <div className={`absolute z-50 w-full mt-2 rounded-2xl shadow-2xl border overflow-hidden ${
          darkMode ? "bg-slate-800 border-white/10" : "bg-white border-gray-100"
        }`}>
          {results.map((user) => (
            <div
              key={user._id}
              onClick={() => handleSelect(user)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                darkMode ? "hover:bg-white/5 text-white" : "hover:bg-blue-50 text-black"
              }`}
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-black/5">
                <Image 
                  src={user.profilePicture || "/default-profile.jpg"} 
                  alt={user.name} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="flex-1 overflow-hidden font-bold">
                <div className="flex items-center gap-1">
                   <p className="text-xs truncate">{user.name}</p>
                   {user.enrollmentNumber && (
                     <span className={`text-[9px] opacity-40 font-mono tracking-tighter ${darkMode ? 'text-white' : 'text-gray-500'}`}>
                       ({user.enrollmentNumber})
                     </span>
                   )}
                </div>
                <p className="text-[10px] opacity-60 truncate font-black tracking-widest uppercase mt-0.5">
                  {user.publicId ? `@${user.publicId}` : user.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default UserSearchInput;
