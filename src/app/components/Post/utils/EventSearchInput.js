"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { fetchEvents } from "../../../../api/dashboard";

const EventSearchInput = ({ value, onChange, onSelect, placeholder = "Search for an event...", darkMode = false, className = "" }) => {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
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
      setIsOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (val) => {
    setQuery(val);
    onChange(val); // Always bubble up typed value as eventName
    if (val.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    fetchAndFilterEvents(val);
  };

  const handleSelect = (eventPost) => {
    setQuery(eventPost.title);
    setResults([]);
    setIsOpen(false);
    onSelect(eventPost); // Passes the selected event object back
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => query.length >= 2 && fetchAndFilterEvents(query)}
        placeholder={placeholder}
        className={`w-full p-3 text-xs rounded-xl border ${
          darkMode 
            ? "bg-slate-900 text-white border-white/10" 
            : "bg-white text-black border-gray-100 shadow-sm"
        } outline-none focus:ring-1 focus:ring-blue-500 transition-all ${className}`}
      />
      
      {isOpen && results.length > 0 && (
        <div className={`absolute z-50 w-full mt-2 rounded-2xl shadow-2xl border overflow-hidden max-h-60 overflow-y-auto ${
          darkMode ? "bg-slate-800 border-white/10" : "bg-white border-gray-100"
        }`}>
          {results.map((eventPost) => (
            <div
              key={eventPost._id}
              onClick={() => handleSelect(eventPost)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                darkMode ? "hover:bg-white/5 text-white" : "hover:bg-blue-50 text-black"
              }`}
            >
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-black/5 flex items-center justify-center bg-gray-100 dark:bg-slate-700 text-lg">
                {eventPost.images && eventPost.images.length > 0 ? (
                  <Image 
                    src={eventPost.images[0].url} 
                    alt={eventPost.title} 
                    fill 
                    className="object-cover" 
                  />
                ) : "📅"}
              </div>
              <div className="flex-1 overflow-hidden font-bold">
                <div className="flex items-center gap-1">
                   <p className="text-xs truncate">{eventPost.title}</p>
                </div>
                <p className="text-[10px] opacity-60 truncate font-black tracking-widest uppercase mt-0.5">
                  {new Date(eventPost.startDate || eventPost.createdAt).toLocaleDateString()} • {eventPost.venue || "TBA"}
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

export default EventSearchInput;
