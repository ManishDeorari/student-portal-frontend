import React, { useState } from "react";
import Link from "next/link";
import SectionCard from "./SectionCard";
import { Activity, Trophy, Calendar, Eye, Users } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import PostModal from "../Post/Visual/PostModal";

export default function ProfileEventParticipation({ profile, isPublicView }) {
    const { darkMode } = useTheme();
    const [activeTab, setActiveTab] = useState("participated"); // "participated" or "won"
    const [showPostModal, setShowPostModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    const participatedEvents = profile.events?.participatedEvents || [];
    const wonEvents = profile.events?.wonEvents || [];

    const hasData = participatedEvents.length > 0 || wonEvents.length > 0;

    const handleViewEvent = (event) => {
        // Format as post so PostModal can render it
        const formattedEvent = {
            ...event,
            type: "Event",
            content: event.description,
            user: typeof event.createdBy === "object" ? event.createdBy : { _id: event.createdBy, name: "Admin" }
        };
        setSelectedPost(formattedEvent);
        setShowPostModal(true);
    };

    const handleViewAnnouncement = (announcement) => {
        setSelectedPost(announcement);
        setShowPostModal(true);
    };

    return (
        <>
            <SectionCard title="Event Participation" hasData={hasData} isPublicView={isPublicView}>
                <div className="flex flex-wrap gap-3 mb-5">
                    <div className={`relative p-[1.5px] rounded-xl transition-all ${activeTab === "participated" ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20' : 'bg-transparent border border-gray-300 dark:border-gray-700'}`}>
                        <button
                            onClick={() => setActiveTab("participated")}
                            className={`px-4 py-2 rounded-[calc(0.75rem-1.5px)] text-sm font-black transition-all h-full w-full ${activeTab === "participated"
                                    ? (darkMode ? "bg-[#1A1A1B] text-white" : "bg-white text-blue-600")
                                    : (darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black")
                                }`}
                        >
                            Participated ({participatedEvents.length})
                        </button>
                    </div>
                    <div className={`relative p-[1.5px] rounded-xl transition-all ${activeTab === "won" ? 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg shadow-amber-500/20' : 'bg-transparent border border-gray-300 dark:border-gray-700'}`}>
                        <button
                            onClick={() => setActiveTab("won")}
                            className={`px-4 py-2 rounded-[calc(0.75rem-1.5px)] text-sm font-black transition-all h-full w-full flex items-center justify-center gap-1.5 ${activeTab === "won"
                                    ? (darkMode ? "bg-[#1A1A1B] text-white" : "bg-white text-amber-600")
                                    : (darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black")
                                }`}
                        >
                            Won ({wonEvents.length})
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {activeTab === "participated" && (
                        participatedEvents.length === 0 ? (
                            <div className={`py-8 text-center rounded-xl border border-dashed ${darkMode ? 'bg-slate-800/30 border-white/5 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">No participated events.</p>
                            </div>
                        ) : (
                            <div className="relative p-[2px] bg-gradient-to-tr from-blue-400/60 to-purple-500/60 rounded-2xl">
                                <div className={`p-3.5 rounded-[calc(1rem-2px)] ${darkMode ? "bg-[#121212]" : "bg-gray-50"}`}>
                                    <div className="space-y-3">
                                        {participatedEvents.slice(0, 5).map((ev, idx) => (
                                            <div key={idx} className="relative p-[1.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl transition-transform hover:scale-[1.02]">
                                                <div className={`flex justify-between items-center gap-2 p-3 rounded-[calc(0.75rem-1.5px)] h-full ${darkMode ? "bg-[#1A1A1B]" : "bg-white"}`}>
                                                    <div className="flex flex-col gap-1.5 min-w-0">
                                                        <h4 className={`font-black text-lg leading-tight truncate ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{ev.title || "Event"}</h4>
                                                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                                                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
                                                                <Calendar className="w-3 h-3"/> {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : "Unknown Date"}
                                                            </span>
                                                            {ev.startTime && <span className="text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">{ev.startTime}</span>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleViewEvent(ev)}
                                                        className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg border-0 transition-all shadow-md hover:shadow-lg text-xs font-black text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 active:scale-[0.98]`}
                                                        title="View Event"
                                                    >
                                                        <Eye className="w-4 h-4" /> View
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {activeTab === "won" && (
                        wonEvents.length === 0 ? (
                            <div className={`py-8 text-center rounded-xl border border-dashed ${darkMode ? 'bg-slate-800/30 border-white/5 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">No won events yet.</p>
                            </div>
                        ) : (
                            <div className="relative p-[2px] bg-gradient-to-tr from-yellow-400/60 to-amber-500/60 rounded-2xl">
                                <div className={`p-3.5 rounded-[calc(1rem-2px)] ${darkMode ? "bg-[#121212]" : "bg-gray-50"}`}>
                                    <div className="space-y-3">
                                        {wonEvents.slice(0, 5).map((post, idx) => {
                                            const eventName = post.announcementDetails?.eventName || "Event";
                                            const winnerInfo = post.announcementDetails?.winners?.find(
                                                w => w.userId === profile._id || (w.groupMembers && w.groupMembers.includes(profile._id))
                                            );
                                            
                                            return (
                                                <div key={idx} className="relative p-[1.5px] bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-xl transition-transform hover:scale-[1.02]">
                                                    <div className={`flex justify-between items-center gap-2 p-3 rounded-[calc(0.75rem-1.5px)] h-full ${darkMode ? "bg-[#1A1A1B]" : "bg-white"}`}>
                                                        <div className="flex flex-col gap-1.5 min-w-0">
                                                            <h4 className={`font-black text-lg leading-tight truncate ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                                                {eventName}
                                                            </h4>
                                                            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                                                                <span className="text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md">Rank {winnerInfo?.rank || "N/A"}</span>
                                                                {winnerInfo?.points > 0 && <span className="text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-md">+{winnerInfo.points} PTS</span>}
                                                                <span className="text-amber-600 dark:text-amber-500 px-1 uppercase tracking-widest font-black text-[10px]">Winner</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleViewAnnouncement(post)}
                                                            className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg border-0 transition-all shadow-md hover:shadow-lg text-xs font-black text-white bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 active:scale-[0.98]`}
                                                            title="View Announcement"
                                                        >
                                                            <Eye className="w-4 h-4" /> View
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    <div className="pt-2 text-center">
                        <Link
                            href={`/profile/${profile.publicId || profile._id}/events`}
                            className={`inline-flex items-center gap-2 text-sm font-bold transition px-6 py-2.5 rounded-full border hover:shadow-md active:scale-95 ${darkMode ? 'bg-blue-900/20 text-blue-400 border-blue-900/40 hover:bg-blue-900/30' : 'bg-blue-50/50 text-blue-600 border-blue-100 hover:text-blue-800'}`}
                        >
                            Show all events
                        </Link>
                    </div>
                </div>
            </SectionCard>

            {showPostModal && selectedPost && (
                <PostModal 
                    showModal={showPostModal}
                    setShowModal={setShowPostModal}
                    post={selectedPost} 
                    darkMode={darkMode}
                    currentUser={profile}
                    hideInteractions={true}
                />
            )}
        </>
    );
}
