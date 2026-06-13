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
    <div className={`mt-6 p-[1.5px] rounded-3xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-xl overflow-hidden`}>
      <div className={`p-5 rounded-[calc(1.5rem-1.5px)] ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
            <span className="text-white text-xl">🏆</span>
          </div>
          <h3 className={`font-black uppercase tracking-widest text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Top Earners</h3>
        </div>
        
        <div className="space-y-4">
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
