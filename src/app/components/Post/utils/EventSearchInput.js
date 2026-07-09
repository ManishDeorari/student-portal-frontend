"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { fetchEvents } from "../../../../api/dashboard";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaCalendarAlt } from "react-icons/fa";

const EventSearchInput = ({ value, onChange, onSelect, placeholder = "Search for an event...", darkMode = false, className = "" }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const inputRef = useRef(null);

  // When modal opens, autofocus the search input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const fetchAndFilterEvents = async (searchQuery) => {
    setLoading(true);
    try {
      let eventsToFilter = allEvents;
      
      // Fetch events only once to minimize API calls
      if (!hasFetched) {
        const data = await fetchEvents();
        // Assume data returns { posts: [...] } based on getEvents backend
        const fetchedEvents = data.posts || data || [];
        eventsToFilter = fetchedEvents;
        setAllEvents(fetchedEvents);
        setHasFetched(true);
      }

      // Filter events by title locally
      const filtered = eventsToFilter.filter(ev => 
        ev.title && ev.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setResults(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (val) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setResults([]);
      return;
    }
    fetchAndFilterEvents(val);
  };

  const handleSelect = (eventPost) => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onChange(eventPost.title);
    if (onSelect) onSelect(eventPost);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          if (!hasFetched) fetchAndFilterEvents("");
        }}
        className="relative w-full p-[2px] rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-transform active:scale-95"
      >
        <div className={`flex items-center justify-between p-3 text-sm rounded-[calc(0.75rem-2px)] w-full h-full transition-all ${
          darkMode 
            ? "bg-[#121213] text-white hover:bg-slate-900" 
            : "bg-[#FAFAFA] text-black hover:bg-white"
        }`}>
          <span className={`truncate font-bold ${!value ? "opacity-50" : ""}`}>
            {value || placeholder || "Search & Select Event..."}
          </span>
          <FaSearch className={darkMode ? "text-gray-400" : "text-gray-500"} />
        </div>
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg p-[2px] rounded-3xl bg-gradient-to-tr from-blue-500 to-purple-600 shadow-2xl"
              style={{ maxHeight: '80vh' }}
            >
              <div className={`w-full h-full flex flex-col rounded-[calc(1.5rem-2px)] overflow-hidden ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
              {/* Modal Header */}
              <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${darkMode ? "border-white/10" : "border-gray-100"}`}>
                <h3 className={`text-xl font-black flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                  <span className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><FaCalendarAlt /></span>
                  Select Event
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-full border-2 transition-all hover:rotate-90 ${darkMode ? "text-white border-white hover:bg-white/20" : "text-black border-black hover:bg-black/10"}`}
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Search Bar */}
              <div className={`p-4 sm:p-6 border-b ${darkMode ? "border-white/10 bg-black/20" : "border-gray-100 bg-gray-50/50"}`}>
                <div className={`relative flex items-center p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm`}>
                  <div className={`flex-1 flex items-center gap-3 px-4 py-3 sm:py-4 rounded-[calc(1rem-2px)] ${darkMode ? "bg-[#1a1a1c]" : "bg-white"}`}>
                    <FaSearch className={darkMode ? "text-gray-400" : "text-gray-400"} />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Type event name..."
                      className={`w-full bg-transparent border-none outline-none font-bold ${darkMode ? "text-white placeholder-gray-500" : "text-black placeholder-gray-400"}`}
                    />
                    {loading && (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Results Area */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-4 min-h-[250px] custom-scrollbar">
                {query.length < 2 && results.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-8">
                    <FaSearch className="text-4xl mb-4" />
                    <p className={`font-black text-sm uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Type at least 2 characters</p>
                  </div>
                ) : results.length === 0 && !loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-8">
                    <span className="text-4xl mb-4">🤷‍♂️</span>
                    <p className={`font-black text-sm uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No events found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {results.map((eventPost) => (
                      <div key={eventPost._id} className="p-[1.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                        <div
                          onClick={() => handleSelect(eventPost)}
                          className={`flex items-center justify-between gap-4 p-3 sm:p-4 rounded-[calc(1rem-1.5px)] cursor-pointer transition-all group ${
                            darkMode ? "bg-[#121213]" : "bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-4 overflow-hidden w-full">
                            <div className="w-12 h-12 p-[1.5px] bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg relative shrink-0 flex items-center justify-center">
                              <div className={`w-full h-full rounded-[calc(0.5rem-1px)] overflow-hidden relative ${darkMode ? "bg-slate-800" : "bg-gray-200"} flex items-center justify-center text-2xl`}>
                                {eventPost.images && eventPost.images.length > 0 ? (
                                  <Image 
                                    src={eventPost.images[0].url} 
                                    alt={eventPost.title} 
                                    fill 
                                    className="object-cover" 
                                  />
                                ) : "📅"}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`font-bold truncate text-base sm:text-[17px] ${darkMode ? "text-white" : "text-gray-900"}`}>
                                {eventPost.title}
                              </p>
                              <p className={`text-[10px] sm:text-xs font-black uppercase tracking-widest truncate mt-0.5 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                                {new Date(eventPost.startDate || eventPost.createdAt).toLocaleDateString()} • {eventPost.venue || "TBA"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EventSearchInput;
