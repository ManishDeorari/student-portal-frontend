import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import PointsDistributionModal from "./profile/PointsDistributionModal";
import { useTheme } from "@/context/ThemeContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Leaderboard() {
  const { darkMode } = useTheme();
  const [currentYear, setCurrentYear] = useState([]);
  const [lastYear, setLastYear] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch current & last year leaderboard
  const fetchLeaderboards = useCallback(async () => {
    setLoading(true);
    try {
      const [resCurrent, resLast] = await Promise.all([
        fetch(`${API}/api/admin/leaderboard`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/admin/leaderboard/last-year`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!resCurrent.ok) throw new Error("Failed to fetch current year leaderboard");
      if (!resLast.ok) throw new Error("Failed to fetch last year leaderboard");

      const currentData = await resCurrent.json();
      const lastData = await resLast.json();

      setCurrentYear(currentData);
      setLastYear(lastData);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLeaderboards();
  }, [fetchLeaderboards]);

  const filterUsers = (users) =>
    users.filter((u) =>
      `${u.name} ${u.enrollmentNumber || ""}`.toLowerCase().includes(search.toLowerCase())
    );

  const currentFiltered = filterUsers(currentYear);
  const lastFiltered = filterUsers(lastYear);

  const handlePointClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const Card = ({ title, users, pointsKey }) => (
    <div className="relative p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl overflow-hidden mb-12 transition-all hover:shadow-blue-500/10">
      <div className={`${darkMode ? "bg-black" : "bg-[#FAFAFA]"} rounded-[calc(1.5rem-2px)] overflow-hidden`}>
        <div className={`px-5 sm:px-10 py-4 sm:py-6 ${darkMode ? "bg-white/5" : "bg-gray-50/50"} flex items-center justify-between border-b ${darkMode ? "border-white/10" : "border-gray-200"}`}>
          <h2 className={`text-lg sm:text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"} tracking-tight`}>{title}</h2>
          <div className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow-lg border border-blue-400/30">
            <span className="font-black text-xs uppercase tracking-widest">{users.length} Ranked</span>
          </div>
        </div>
        <div className="p-3 sm:p-6 md:p-10">
          {users.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className={`${darkMode ? "text-white" : "text-slate-500"} font-black italic text-lg`}>No eligible users found for this rank.</p>
            </div>
          ) : (
            <ul className="space-y-3 sm:space-y-5">
              {users.map((user, index) => (
                <div key={user._id} className="p-[1.5px] sm:p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl shadow-xl transition-all hover:scale-[1.01]">
                    <li
                      className={`flex items-center justify-between ${darkMode ? "bg-black" : "bg-white"} rounded-[calc(0.75rem-1.5px)] sm:rounded-[calc(1rem-2px)] p-2 sm:p-3 group transition-all duration-300`}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm sm:text-lg shadow-xl ${index === 0 ? "bg-yellow-500 text-white border-2 border-yellow-400 shadow-yellow-500/40" :
                          index === 1 ? "bg-slate-300 text-slate-900 border-2 border-slate-200 shadow-slate-300/40" :
                            index === 2 ? "bg-amber-600 text-white border-2 border-amber-500 shadow-amber-600/40" :
                              darkMode ? "bg-white/10 text-white border border-white/20" : "bg-gray-100 text-slate-900 border-gray-200"
                          }`}>
                          {index + 1}
                        </div>
                        <Image
                          src={user.profilePicture || "/default-profile.jpg"}
                          alt={user.name}
                          width={48}
                          height={48}
                          className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-white/10 bg-gray-800 shadow-2xl group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="min-w-0">
                           <Link
                            href={`/profile/${user.publicId || user._id}`}
                            className={`font-black text-xs sm:text-base ${darkMode ? "text-white" : "text-slate-900"} hover:text-blue-500 transition-colors block truncate`}
                          >
                            {user.name}
                          </Link>
                          <div className="flex flex-col gap-0.5">
                            <p className={`text-[9px] sm:text-[10px] font-black ${darkMode ? "text-white/60" : "text-slate-500"} tracking-widest uppercase truncate`}>
                                {user.enrollmentNumber || "Student"}
                            </p>
                            <p className={`text-[8px] sm:text-[9px] font-black ${darkMode ? "text-blue-400" : "text-blue-600"} tracking-tighter uppercase`}>
                                {user.course || "N/A"} • SEM {user.semester || "N/A"} • SEC {user.section || "N/A"}
                            </p>
                          </div>
                      </div>
                    </div>
                      <button
                        onClick={() => handlePointClick(user)}
                        className={`px-3 sm:px-6 py-1.5 sm:py-2.5 ${darkMode ? "bg-blue-600/20 border-blue-500/40 text-blue-400" : "bg-blue-600 text-white border-blue-700"} hover:bg-blue-600 hover:text-white border-2 rounded-xl font-black text-sm sm:text-lg transition-all shadow-2xl active:scale-95 flex items-center gap-1 sm:gap-2`}
                      >
                        {user[pointsKey]?.total ?? 0} <span className="text-[8px] uppercase tracking-tighter">pts</span>
                      </button>
                  </li>
                </div>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      key="leaderboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-10"
    >
      <div className="p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-8 ${darkMode ? "bg-black" : "bg-[#FAFAFA]"} backdrop-blur-3xl p-5 sm:p-10 rounded-[calc(2.5rem-2px)] relative overflow-hidden`}>
          <div>
            <h1 className={`text-2xl sm:text-4xl font-black ${darkMode ? "text-white" : "text-slate-900"} tracking-tight mb-2 sm:mb-3 flex items-center gap-3 sm:gap-4`}>
              🏆 Student Leaderboard
            </h1>
            <p className={`${darkMode ? "text-white" : "text-slate-900"} text-xs sm:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]`}>Global Rankings &amp; Verified Points</p>
          </div>
          <div className="relative w-full md:w-96 p-[2px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl shadow-xl">
            <div className="relative h-full">
              <input
                type="text"
                placeholder="Search individuals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 sm:pl-14 pr-4 py-2.5 sm:py-4 ${darkMode ? "bg-black text-white placeholder-white" : "bg-white text-black placeholder-slate-400"} rounded-[calc(1rem-2px)] outline-none transition-all font-black text-sm sm:text-lg`}
              />
              <svg className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 ${darkMode ? "text-white" : "text-gray-900"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className={`${darkMode ? "text-blue-100/40" : "text-gray-400"} font-black uppercase tracking-widest text-xs`}>Loading Rankings...</p>
        </div>
      ) : (
        <>
          <Card title="🥇 Current Season" users={currentFiltered} pointsKey="points" />
          <Card title="🎓 Historical Hall of Fame" users={lastFiltered} pointsKey="lastYearPoints" />
        </>
      )}

      {selectedUser && (
        <PointsDistributionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
        />
      )}
    </motion.div>
  );
}
