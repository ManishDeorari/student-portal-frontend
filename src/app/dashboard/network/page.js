"use client";
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import Link from "next/link";
import Image from "next/image";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
} from "@/api/connect";
import RequestsModal from "../../components/network/RequestsModal";
import { useTheme } from "@/context/ThemeContext";
import HybridInput from "../../components/ui/HybridInput";
import socket from "@/utils/socket";

const COURSE_OPTIONS = ["B.Tech", "M.Tech", "MBA", "BCA", "MCA"];
const currentYearForDropdown = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYearForDropdown + 5 - 2000 + 1 }, (_, i) => String(2000 + i));

const NetworkPage = () => {
  const { darkMode } = useTheme();
  const [alumni, setAlumni] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [requested, setRequested] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [suggestions, setSuggestions] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    course: "",
    year: "",
    industry: ""
  });

  // ⚡ OPTIMISTIC HYDRATION
  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      setCurrentUser(JSON.parse(cachedUser));
    }
  }, []);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      // ⚡ PARALLEL FETCH: Load user and suggestions simultaneously
      const [meRes, suggRes] = await Promise.all([
        fetch(`${BASE_URL}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/connect/suggestions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const [meData, suggData] = await Promise.all([
        meRes.json(),
        suggRes.json().catch(() => ({}))
      ]);

      if (meRes.ok) {
        setCurrentUser(meData);
        localStorage.setItem("user", JSON.stringify(meData)); // Keep cache fresh
      }
      setSuggestions(suggData || {});
    } catch (err) {
      console.error("Fetch initial data error:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const handleSocketUpdate = (notif) => {
      if (notif && ["connect_request", "connect_accept", "connect_reject"].includes(notif.type)) {
        fetchData();
      }
    };

    socket.on("liveNotification", handleSocketUpdate);
    return () => socket.off("liveNotification", handleSocketUpdate);
  }, [fetchData]);

  const handleConnect = async (toUserId) => {
    try {
      await sendConnectionRequest(toUserId);
      setRequested((prev) => ({ ...prev, [toUserId]: true }));
    } catch (err) {
      console.error("Connect error:", err);
    }
  };

  const handleSearch = async () => {
    // Check if at least one search parameter is provided
    if (!searchQuery.trim() && !filters.course && !filters.year && !filters.industry) {
      alert("Please enter a name or select a filter to search");
      return;
    }
    setAlumni([]); // Clear previous results immediately
    setSearched(true); // Track that a search was performed

    const token = localStorage.getItem("token");
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    let url = `${BASE_URL}/api/connect/search?query=${searchQuery}`;
    if (filters.course) url += `&course=${filters.course}`;
    if (filters.year) url += `&year=${filters.year}`;
    if (filters.industry) url += `&industry=${filters.industry}`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAlumni(data || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const userObj = currentUser || JSON.parse(localStorage.getItem("user"));
    setIsAdmin(userObj?.isAdmin || userObj?.role === "admin");
  }, [currentUser]);

  const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white relative">
      <SidebarComponent />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10 pb-24 md:pb-8">
        {/* Header Section */}
        <div className="relative p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl overflow-hidden">
          <div className={`px-4 sm:px-8 py-5 sm:py-6 rounded-[calc(1.5rem-2.5px)] ${darkMode ? 'bg-black text-white' : 'bg-[#FAFAFA] text-slate-900'} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6`}>
            <div>
              <h1 className={`text-2xl sm:text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Network</h1>
              <p className={`text-xs sm:text-sm ${darkMode ? 'text-white font-bold' : 'text-slate-600 font-bold'} opacity-75`}>Build your professional circle with alumni</p>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="relative p-[1.5px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl group transition-all duration-300 hover:shadow-lg">
                <Link href="/dashboard/myconnections" className={`relative flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm transition-all backdrop-blur-md ${darkMode ? 'bg-[#0f172a] text-white hover:bg-black' : 'bg-white text-slate-900 hover:bg-gray-50'}`}>
                  My Network
                  {currentUser?.connections?.length > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)] font-black">
                      {currentUser.connections.length}
                    </span>
                  )}
                </Link>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="relative px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:from-blue-500 hover:to-purple-500 transition-all shadow-xl flex items-center gap-2 group active:scale-95"
              >
                Requests
                {currentUser?.pendingRequests?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-7 h-7 flex items-center justify-center rounded-full border-2 border-white shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse font-black">
                    {currentUser.pendingRequests.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="relative p-[2px] sm:p-[2.5px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-[2.5rem] shadow-2xl">
          <div className={`px-3 sm:px-10 py-3 sm:py-10 rounded-xl sm:rounded-[calc(2.5rem-2.5px)] ${darkMode ? 'bg-black/90' : 'bg-[#FAFAFA]'} space-y-3 sm:space-y-8`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-6">
              <div className="md:col-span-3 relative p-[1.5px] bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-xl sm:rounded-2xl transition-all hover:from-blue-500 hover:to-purple-500">
                <div className="relative h-full">
                  <input
                    type="text"
                    placeholder="Search by name, email..."
                    value={searchQuery}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-4 rounded-xl sm:rounded-2xl outline-none transition-all font-black text-xs sm:text-base ${darkMode ? 'bg-black text-white placeholder-white' : 'bg-white text-black placeholder-black border border-gray-200'} shadow-sm`}
                  />
                  <svg className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${darkMode ? 'text-white' : 'text-slate-800'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="px-6 sm:px-10 py-2 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-wider sm:tracking-[0.2em] text-[10px] sm:text-[11px] transition-all shadow-xl active:scale-95"
              >
                Search Alumni
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-6">
              <div className="relative p-[1.5px] bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl sm:rounded-2xl transition-all focus-within:from-blue-500 focus-within:to-purple-500">
                <HybridInput
                  value={filters.course}
                  onChange={(val) => setFilters({ ...filters, course: val })}
                  options={COURSE_OPTIONS}
                  placeholder="Course (e.g. BCA)"
                  uppercase={true}
                  className={`w-full pl-4 pr-10 py-1.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[11px] uppercase tracking-wider sm:tracking-[0.2em] ${darkMode ? 'bg-black text-white placeholder-white' : 'bg-white text-black placeholder-black border border-gray-200'}`}
                />
              </div>

              <div className="relative p-[1.5px] bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl sm:rounded-2xl transition-all focus-within:from-blue-500 focus-within:to-purple-500">
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className={`w-full pl-4 pr-10 py-1.5 sm:py-[15px] rounded-xl sm:rounded-2xl appearance-none outline-none font-black text-[9px] sm:text-[11px] uppercase tracking-wider sm:tracking-[0.2em] cursor-pointer ${darkMode ? 'bg-black text-white' : 'bg-white text-black border border-gray-200'}`}
                >
                  <option value="">Graduation / Passing Year</option>
                  {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <svg className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${darkMode ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searched && alumni.length === 0 ? (
          <div className="relative p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className={`p-10 rounded-[calc(2.5rem-2.5px)] text-center ${darkMode ? 'bg-black text-white' : 'bg-[#FAFAFA] text-slate-900'}`}>
              <h2 className="text-2xl font-black">No Results Found</h2>
              <p className={`mt-2 text-sm font-bold ${darkMode ? 'text-white opacity-60' : 'text-slate-500'}`}>Try adjusting your filters or search terms</p>
            </div>
          </div>
        ) : alumni.length > 0 && (
          <div className="relative p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className={`px-4 sm:px-8 py-4 sm:py-8 rounded-[calc(2.5rem-2.5px)] ${darkMode ? 'bg-black' : 'bg-[#FAFAFA]'} space-y-4 sm:space-y-8`}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <h2 className={`text-lg sm:text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Search Results</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {alumni.map((user) => (
                  <div key={user._id} className="relative p-[1.5px] bg-gradient-to-br from-blue-500/50 via-purple-500/50 to-pink-500/50 rounded-2xl group transition-all duration-500 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 shadow-sm hover:shadow-xl">
                    <div className={`rounded-2xl p-3 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 relative overflow-hidden h-full ${darkMode ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-900'} transition-colors`}>
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 relative z-10 w-full">
                        <div className="relative p-[2px] bg-gradient-to-br from-blue-400 to-purple-400 rounded-full shrink-0 shadow-lg">
                          <Image
                            src={user.profilePicture || "/default-profile.jpg"}
                            alt={user.name || "User"}
                            width={64}
                            height={64}
                            className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-2 ${darkMode ? 'border-slate-800' : 'border-white'}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/profile/${user.publicId || user._id}`}>
                            <h3 className="font-black text-sm sm:text-lg truncate hover:text-blue-500 transition-colors uppercase tracking-tight">{user.name}</h3>
                          </Link>
                          {/* Enrollment / Employee ID - Hidden for Main Admin */}
                          {user.role !== "admin" && (
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mt-0.5">
                              {user.enrollmentNumber || user.employeeId || (user.role === "faculty" ? "Faculty" : "Alumni")}
                            </p>
                          )}
                          <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white/60' : 'text-slate-500'} mt-1`}>{user.course} {user.year}</p>
                        </div>
                      </div>
                      <div className="relative z-10 shrink-0">
                        {user.connectionStatus === "connected" ? (
                          <div className="px-4 py-2 border border-green-500/30 bg-green-500/10 rounded-xl">
                            <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">Friends</span>
                          </div>
                        ) : (user.connectionStatus === "sent" || requested[user._id]) ? (
                          <div className="px-4 py-2 border border-white/10 bg-white/5 rounded-xl">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Sent</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleConnect(user._id)} 
                            className="relative group/btn p-[1.5px] bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl overflow-hidden transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                          >
                            <div className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover/btn:from-blue-500 group-hover/btn:to-purple-500 rounded-[calc(0.75rem-1.5px)] flex items-center justify-center transition-all">
                              <span className="text-white text-[10px] font-black uppercase tracking-widest">Connect</span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categorized Suggestions */}
        <div className="space-y-16 pb-20">
          {[
            { id: "randomRecommendations", title: "Random Recommendations", icon: "🎲", color: "blue", data: suggestions.randomRecommendations },
            { id: "facultyAndAdmin", title: "Faculty and Admin", icon: "🎓", color: "amber", data: suggestions.facultyAndAdmin },
            { id: "relatedPeople", title: "Based on Your Course", icon: "🤝", color: "purple", data: suggestions.relatedPeople }
          ].map((section) => (
            section.data?.length > 0 && (
              <div key={section.id} className="relative p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className={`px-4 sm:px-8 py-4 sm:py-8 rounded-[calc(2.5rem-2.5px)] ${darkMode ? 'bg-black' : 'bg-[#FAFAFA]'} space-y-4 sm:space-y-8`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-2 rounded-full ${section.color === 'blue' ? 'bg-blue-600' : section.color === 'amber' ? 'bg-amber-500' : 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]'}`}></div>
                    <h2 className={`text-lg sm:text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{section.icon} {section.title}</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {section.data.map((user) => (
                      <div key={user._id} className="relative p-[1.5px] bg-gradient-to-br from-blue-400/50 via-purple-400/50 to-pink-400/50 rounded-2xl h-full group transition-all duration-500 hover:from-blue-500 hover:to-pink-500 hover:shadow-xl">
                        <div className={`rounded-2xl flex flex-col items-center text-center p-3 sm:p-6 space-y-2 sm:space-y-4 transition-all relative overflow-hidden h-full ${darkMode ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-900 border'}`}>
                          <div className="relative p-[2px] bg-gradient-to-br from-blue-400 to-purple-400 rounded-full shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                            <Image
                              src={user.profilePicture || "/default-profile.jpg"}
                              alt={user.name || "User"}
                              width={72}
                              height={72}
                              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 ${darkMode ? 'border-slate-800' : 'border-white'}`}
                            />
                          </div>
                          <div className="w-full min-w-0">
                            <Link href={`/profile/${user.publicId || user._id}`}>
                              <h3 className="font-black text-sm truncate hover:text-blue-500 transition-colors px-1 uppercase tracking-tight">{user.name}</h3>
                            </Link>
                            {/* Enrollment ID */}
                            {user.role !== "admin" && (
                              <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mt-1">
                                {user.enrollmentNumber || user.employeeId || (user.role === "faculty" ? "Faculty" : "Alumni")}
                              </p>
                            )}
                            <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white/60' : 'text-slate-500'} mt-1.5`}>{user.course} {user.year}</p>
                          </div>
                          <div className="w-full pt-2">
                             <button
                               onClick={() => handleConnect(user._id)}
                               disabled={requested[user._id]}
                               className={`w-full relative group/btn p-[1.5px] rounded-xl overflow-hidden transition-all active:scale-95 shadow-md ${requested[user._id] ? 'bg-gray-200 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}
                             >
                               <div className={`${requested[user._id] ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'} py-2.5 rounded-[calc(0.75rem-1.5px)] flex items-center justify-center transition-all`}>
                                 <span className="text-[10px] font-black uppercase tracking-widest">
                                   {requested[user._id] ? "Pending" : "Connect"}
                                 </span>
                               </div>
                             </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </main>

      <RequestsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onActionComplete={fetchData}
      />
    </div>
  );
};

export default NetworkPage;
