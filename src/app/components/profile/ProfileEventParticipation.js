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
                    <button
                        onClick={() => setActiveTab("participated")}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeTab === "participated"
                                ? (darkMode ? "bg-blue-900/30 text-blue-400 border-blue-500/50 shadow-md" : "bg-blue-50 text-blue-700 border-blue-200 shadow-sm")
                                : (darkMode ? "bg-transparent text-gray-400 border-white/10 hover:bg-white/5 hover:text-white" : "bg-transparent text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800")
                            }`}
                    >
                        Participated ({participatedEvents.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("won")}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 border ${activeTab === "won"
                                ? (darkMode ? "bg-amber-900/30 text-amber-400 border-amber-500/50 shadow-md" : "bg-amber-50 text-amber-700 border-amber-200 shadow-sm")
                                : (darkMode ? "bg-transparent text-gray-400 border-white/10 hover:bg-white/5 hover:text-white" : "bg-transparent text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800")
                            }`}
                    >
                        Won ({wonEvents.length})
                    </button>
                </div>

                <div className="space-y-4">
                    {activeTab === "participated" && (
                        participatedEvents.length === 0 ? (
                            <div className={`py-8 text-center rounded-xl border border-dashed ${darkMode ? 'bg-slate-800/30 border-white/5 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">No participated events.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {participatedEvents.slice(0, 5).map((ev, idx) => (
                                    <div key={idx} className="relative p-[1.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl transition-transform hover:scale-[1.02]">
                                        <div className={`flex items-center justify-between p-3 rounded-[calc(0.75rem-1.5px)] h-full ${darkMode ? "bg-[#1A1A1B]" : "bg-white"}`}>
                                            <div>
                                                <h4 className={`font-bold text-sm leading-tight mb-0.5 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{ev.title || "Event"}</h4>
                                                <p className={`text-[11px] font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                    {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : "Unknown"} {ev.startTime ? `at ${ev.startTime}` : ""}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleViewEvent(ev)}
                                                className={`p-1.5 rounded-full transition ${darkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
                                                title="View Event"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
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
                            <div className="space-y-3">
                                {wonEvents.slice(0, 5).map((post, idx) => {
                                    const eventName = post.announcementDetails?.eventName || "Event";
                                    const winnerInfo = post.announcementDetails?.winners?.find(
                                        w => w.userId === profile._id || (w.groupMembers && w.groupMembers.includes(profile._id))
                                    );
                                    
                                    return (
                                        <div key={idx} className="relative p-[1.5px] bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-xl transition-transform hover:scale-[1.02]">
                                            <div className={`flex items-center justify-between p-3 rounded-[calc(0.75rem-1.5px)] h-full ${darkMode ? "bg-[#1A1A1B]" : "bg-white"}`}>
                                                <div>
                                                    <h4 className={`font-bold text-sm leading-tight mb-0.5 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                                        {eventName}
                                                    </h4>
                                                    <div className={`text-[11px] font-medium flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                        <span>Rank {winnerInfo?.rank || "N/A"}</span>
                                                        {winnerInfo?.points > 0 && <span className="font-bold text-green-500">+{winnerInfo.points} PTS</span>}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleViewAnnouncement(post)}
                                                    className={`p-1.5 rounded-full transition ${darkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
                                                    title="View Announcement"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
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
                />
            )}
        </>
    );
}
