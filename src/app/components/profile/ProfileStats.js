import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award } from "lucide-react"; // Importing an icon for Points
import PointsDistributionModal from "./PointsDistributionModal";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileStats({ profile: initialProfile, isPublicView }) {
    const { darkMode } = useTheme();
    const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
    
    const [stats, setStats] = useState({
        connections: initialProfile?.connections?.length || 0,
        totalVisits: initialProfile?.visitStats?.totalVisits || 0,
        todayVisits: initialProfile?.visitStats?.todayVisits || 0,
        points: initialProfile?.points?.total || 0,
        fullPoints: initialProfile?.points || {},
    });

    useEffect(() => {
        if (!initialProfile?._id) return;
        let isMounted = true;

        const fetchLatestStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const endpoint = isPublicView 
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/user/${initialProfile._id}`
                    : `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`;
                    
                const res = await fetch(endpoint, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) {
                        setStats({
                            connections: data.connections?.length || 0,
                            totalVisits: data.visitStats?.totalVisits || 0,
                            todayVisits: data.visitStats?.todayVisits || 0,
                            points: data.points?.total || 0,
                            fullPoints: data.points || {},
                        });
                    }
                }
            } catch (err) {
                console.error("Error fetching live stats:", err);
            }
        };

        // Poll every 10 seconds for truly live numbers
        const intervalId = setInterval(fetchLatestStats, 10000);
        
        // Initial sync to catch any immediate changes since load
        fetchLatestStats();

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [initialProfile?._id, isPublicView]);

    if (!initialProfile) return null;

    const connectionsLink = isPublicView
        ? `/dashboard/myconnections?id=${initialProfile._id}`
        : "/dashboard/myconnections";

    return (
        <div className="p-[2px] bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 rounded-2xl shadow-xl overflow-hidden mt-4">
            <div className={`flex flex-wrap justify-between items-center w-full px-6 py-6 gap-6 rounded-[calc(1rem-1px)] transition-colors duration-500 ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                {/* Connections */}
                <div className="flex flex-col items-center text-center flex-1 min-w-[120px]">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${darkMode ? 'text-gray-400' : 'text-black'}`}>Connections</p>
                    <Link href={connectionsLink}>
                        <button className={`text-3xl font-normal transition-all active:scale-95 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
                            {stats.connections}
                        </button>
                    </Link>
                </div>

                {/* Total Visitors */}
                <div className="flex flex-col items-center text-center flex-1 min-w-[120px]">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${darkMode ? 'text-gray-400' : 'text-black'}`}>Total Visitors</p>
                    <p className={`text-3xl font-normal ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{stats.totalVisits}</p>
                </div>

                {/* Today's Visits */}
                <div className="flex flex-col items-center text-center flex-1 min-w-[120px]">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${darkMode ? 'text-gray-400' : 'text-black'}`}>Today’s Visits</p>
                    <p className={`text-3xl font-normal ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{stats.todayVisits}</p>
                </div>

                {/* My Points (Student Only) */}
                {initialProfile.role === "student" && (
                    <div
                        className="flex flex-col items-center text-center cursor-pointer group flex-1 min-w-[120px]"
                        onClick={() => setIsPointsModalOpen(true)}
                    >
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-yellow-600 transition-colors ${darkMode ? 'text-gray-400' : 'text-black'}`}>
                            {isPublicView ? "Points" : "My Points"}
                            <Award className="w-3.5 h-3.5 text-yellow-500" />
                        </div>
                        <p className={`text-3xl font-normal group-hover:scale-110 transition-transform ${darkMode ? 'text-yellow-500' : 'text-yellow-600'}`}>
                            {stats.points}
                        </p>
                    </div>
                )}
            </div>

            <PointsDistributionModal
                isOpen={isPointsModalOpen}
                onClose={() => setIsPointsModalOpen(false)}
                user={{ ...initialProfile, points: stats.fullPoints }}
            />
        </div>
    );
}
