import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function WelcomeBanner({ user, darkMode }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const isAdmin = user?.role === "admin" || user?.isMainAdmin;

  return (
    <div className="relative p-[2.5px] rounded-3xl md:rounded-[2.5rem] shadow-xl overflow-hidden mb-6 group">
      {/* Animated gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-[bg-spin_4s_linear_infinite]" style={{ backgroundSize: "200% 200%" }}></div>
      
      <section className={`relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 rounded-[calc(1.875rem-2.5px)] md:rounded-[calc(2.5rem-2.5px)] overflow-hidden transition-colors duration-500 ${darkMode ? "bg-[#121213]/90" : "bg-[#FAFAFA]/90"} backdrop-blur-xl`}>
        
        {/* Background Mesh */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 z-10 w-full md:w-auto">
          <div className="relative group/avatar cursor-pointer">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl sm:rounded-3xl blur opacity-60 group-hover/avatar:opacity-100 transition duration-500"></div>
            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl ${darkMode ? "bg-black" : "bg-white"} flex items-center justify-center transform group-hover/avatar:scale-105 transition duration-500`}>
              <span className="text-3xl sm:text-4xl">👋</span>
            </div>
          </div>
          
          <div className="text-center sm:text-left">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-black ${darkMode ? "text-white" : "text-black"} tracking-tight mb-2`}>
              Welcome back, {user?.name || "Student"}!
            </h2>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 md:gap-3 items-center">
              <span className={`text-[10px] md:text-xs ${darkMode ? "bg-white/10 text-white" : "bg-gray-200 text-black"} px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-white/10 shadow-sm`}>
                {user?.enrollmentNumber || user?.employeeId || "N/A"}
              </span>
              <span className={`text-[10px] md:text-xs px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-md flex items-center gap-1.5 ${
                isAdmin ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" : "bg-blue-500 text-white"
              }`}>
                {isAdmin ? "👑 Admin" : (user?.role || "Member")}
              </span>
              
              {/* Community Avatars (Visible to All) */}
              {!loading && stats?.communityStats && (
                <div className={`flex items-center gap-2 ml-0 sm:ml-4 px-3 py-1.5 rounded-full border ${darkMode ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"}`}>
                  <div className="flex -space-x-2">
                    {stats.communityStats.randomAvatars.map((url, i) => (
                      <img key={i} src={url} alt="user" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                    Join {stats.communityStats.totalUsers.toLocaleString()}+ Users
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Dashboard Metrics (Only visible to Admin) */}
        {isAdmin && stats?.adminStats && (
          <div className="mt-6 md:mt-0 z-10 w-full md:w-auto flex flex-col items-center md:items-end">
            <span className={`text-[10px] font-black uppercase tracking-widest mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Live Platform Pulse</span>
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className={`flex flex-col items-center justify-center p-3 rounded-2xl ${darkMode ? "bg-white/5" : "bg-black/5"} min-w-[100px] border ${darkMode ? "border-white/10" : "border-black/5"}`}>
                <span className={`text-xl font-black ${darkMode ? "text-blue-400" : "text-blue-600"}`}>{stats.adminStats.currentlyActive}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"} mt-1 flex items-center gap-1`}><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Active</span>
              </div>
              <div className={`flex flex-col items-center justify-center p-3 rounded-2xl ${darkMode ? "bg-white/5" : "bg-black/5"} min-w-[100px] border ${darkMode ? "border-white/10" : "border-black/5"}`}>
                <span className={`text-xl font-black ${darkMode ? "text-purple-400" : "text-purple-600"}`}>{stats.adminStats.loginsToday}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>Logins Today</span>
              </div>
              <div className={`flex flex-col items-center justify-center p-3 rounded-2xl ${darkMode ? "bg-white/5" : "bg-black/5"} min-w-[100px] border ${darkMode ? "border-white/10" : "border-black/5"}`}>
                <span className={`text-xl font-black ${darkMode ? "text-pink-400" : "text-pink-600"}`}>{stats.adminStats.postsToday}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>Posts Today</span>
              </div>
              <div className={`flex flex-col items-center justify-center p-3 rounded-2xl ${darkMode ? "bg-white/5" : "bg-black/5"} min-w-[100px] border ${darkMode ? "border-white/10" : "border-black/5"}`}>
                <span className={`text-xl font-black ${darkMode ? "text-orange-400" : "text-orange-600"}`}>+{stats.adminStats.pointsGivenToday}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>Pts Given</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
