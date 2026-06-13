import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getGamificationTier } from "@/utils/gamification";

export default function TopEarnersWidget({ darkMode }) {
  const [topEarners, setTopEarners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopEarners = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_URL}/api/user/top-earners`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTopEarners(data);
        }
      } catch (err) {
        console.error("Failed to fetch top earners:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopEarners();
  }, []);

  if (loading || topEarners.length === 0) return null;

  return (
    <div className={`w-full h-[470px] p-[2.5px] rounded-[2.5rem] bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-xl overflow-hidden flex flex-col group`}>
      <div className={`flex-1 p-5 md:p-6 rounded-[calc(2.5rem-2.5px)] ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} flex flex-col overflow-hidden`}>
        <div className="flex justify-between items-center mb-6 pl-1 shrink-0">
          <div>
            <h3 className={`text-lg font-black ${darkMode ? "text-white" : "text-slate-900"} tracking-tight flex items-center gap-2`}>
                🏆 Top Earners
            </h3>
            <p className={`text-[9px] ${darkMode ? "text-gray-400" : "text-gray-500"} font-black uppercase tracking-[0.2em] mt-0.5`}>
                Leaderboard
            </p>
          </div>
          <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-md">
            <span className="text-white text-sm">👑</span>
          </div>
        </div>
        
        <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-2">
          {topEarners.map((user, index) => {
            const tier = getGamificationTier(user.points?.total || 0);
            return (
              <div key={user._id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image 
                      src={user.profilePicture || "/default-profile.jpg"} 
                      alt={user.name} 
                      width={36} 
                      height={36} 
                      className={`rounded-full object-cover border border-white/20`}
                    />
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 text-lg drop-shadow-md z-10">👑</div>
                    )}
                  </div>
                  <div>
                    <Link href={`/profile/${user.publicId || user._id}`}>
                      <p className={`font-black text-xs uppercase tracking-tight hover:text-orange-500 transition-colors ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {user.name.split(' ')[0]}
                      </p>
                    </Link>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-sm drop-shadow-md">{tier.icon}</span>
                      <span className={`text-[9px] font-black tracking-widest uppercase ${tier.colorClass}`}>
                        {tier.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${darkMode ? 'bg-white/5 text-yellow-500' : 'bg-orange-50 text-orange-600'}`}>
                  {user.points?.total || 0} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
