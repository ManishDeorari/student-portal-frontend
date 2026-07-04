import React, { useEffect, useState } from "react";
import UserAvatar from "../ui/UserAvatar";
import Link from "next/link";
import { getGamificationTier } from "@/utils/gamification";
import ImageViewerModal from "../profile/ImageViewerModal";

export default function TopEarnersWidget({ darkMode }) {
  const [topEarners, setTopEarners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerImage, setViewerImage] = useState(null);
  const [viewerOwnerId, setViewerOwnerId] = useState(null);

  let isAdmin = false;
  let currentUserId = null;
  if (typeof window !== "undefined") {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        isAdmin = u.role === "admin" || u.isAdmin === true || u.isMainAdmin === true || u.email === "manishdeorari377@gmail.com";
        currentUserId = u._id;
      }
    } catch (e) {}
  }
  const isRestricted = !isAdmin && String(viewerOwnerId) !== String(currentUserId);

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
          <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-md shrink-0">
            <span className="text-white text-sm leading-none">👑</span>
          </div>
        </div>
        
        <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 pb-2">
          <div className="flex flex-col gap-2">
          {topEarners.map((user, index) => {
            const tier = getGamificationTier(user.points?.total || 0);
            return (
              <div key={user._id} className="p-[1.5px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500 rounded-[17px] shadow-sm hover:shadow-md transition-all group shrink-0 flex-none h-[60px]">
                <div className={`flex items-center px-3 rounded-[15.5px] transition-all h-full ${darkMode ? 'bg-[#1a1a1c] hover:bg-[#222225]' : 'bg-white hover:bg-orange-50/50'}`}>
                  <div 
                    className="relative shrink-0 mr-3 w-10 h-10 min-w-[40px] min-h-[40px] cursor-pointer group/avatar rounded-full overflow-hidden"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewerImage(user.profilePicture || "/default-profile.jpg");
                      setViewerOwnerId(user._id);
                    }}
                  >
                    <UserAvatar 
                      user={user}
                      src={user.profilePicture || "/default-profile.jpg"} 
                      alt={user.name} 
                      width={40}
                      height={40}
                      wrapperClassName="w-full h-full aspect-square flex items-center justify-center overflow-hidden rounded-full"
                      className={`w-full h-full aspect-square rounded-full object-cover border-2 transition-transform duration-300 group-hover/avatar:scale-110 ${index === 0 ? 'border-yellow-400' : index === 1 ? 'border-gray-300' : index === 2 ? 'border-amber-600' : 'border-transparent'}`}
                    />
                    {index === 0 && (
                      <div className="absolute -top-2.5 -right-2.5 text-xl drop-shadow-md z-10 animate-pulse">👑</div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/profile/${user.publicId || user._id}`} className="min-w-0">
                        <p className={`font-black text-xs uppercase tracking-tight hover:text-orange-500 transition-colors truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                          {user.name.split(' ')[0]}
                        </p>
                      </Link>
                      <div className={`shrink-0 text-[11px] font-black uppercase px-2 py-0.5 rounded-lg ${darkMode ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-orange-50 text-orange-600 border border-orange-200'}`}>
                        {user.points?.total || 0} <span className="text-[8px]">pts</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs drop-shadow-md">{tier.icon}</span>
                      <span className={`text-[8px] font-black tracking-widest uppercase truncate ${darkMode ? tier.colorClassDark : tier.colorClassLight}`}>
                        {tier.name}
                      </span>
                      {(user.course || user.semester || user.branch) && (
                        <>
                          <span className={`text-[8px] font-black ${darkMode ? "text-gray-500" : "text-gray-400"}`}>•</span>
                          <span className={`text-[8px] font-black tracking-widest uppercase truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user.course} {user.semester} {user.branch ? `• ${user.branch}` : ""}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
      
      {viewerImage && (
        <ImageViewerModal
          imageUrl={viewerImage}
          onClose={() => { setViewerImage(null); setViewerOwnerId(null); }}
          isRestricted={isRestricted}
        />
      )}
    </div>
  );
}
