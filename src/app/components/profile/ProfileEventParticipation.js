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
                <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                    <button
                        onClick={() => setActiveTab("participated")}
                        className={`text-sm font-bold transition-colors ${activeTab === "participated"
                                ? (darkMode ? "text-blue-400 border-b-2 border-blue-400" : "text-blue-600 border-b-2 border-blue-600")
                                : (darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700")
                            }`}
                    >
                        Participated ({participatedEvents.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("won")}
                        className={`text-sm font-bold transition-colors flex items-center gap-1 ${activeTab === "won"
                                ? (darkMode ? "text-yellow-400 border-b-2 border-yellow-400" : "text-yellow-600 border-b-2 border-yellow-600")
                                : (darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700")
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
                                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${darkMode ? "bg-[#1A1A1B] border-white/5" : "bg-white border-gray-100 shadow-sm"}`}>
                                        <div>
                                            <h4 className={`font-bold text-sm ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{ev.title || "Event"}</h4>
                                            <p className={`text-xs mt-1 flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                <Calendar className="w-3 h-3" />
                                                {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : "Unknown"} {ev.startTime ? `at ${ev.startTime}` : ""}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleViewEvent(ev)}
                                            className={`p-2 rounded-full transition ${darkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
                                            title="View Event"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
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
                                        <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${darkMode ? "bg-[#1A1A1B] border-white/5" : "bg-white border-gray-100 shadow-sm"}`}>
                                            <div>
                                                <h4 className={`font-bold text-sm ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                                    {eventName}
                                                </h4>
                                                <div className={`text-xs mt-1 flex items-center gap-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                    <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-500" /> Rank {winnerInfo?.rank || "N/A"}</span>
                                                    {winnerInfo?.points > 0 && <span className="font-bold text-green-500">+{winnerInfo.points} PTS</span>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleViewAnnouncement(post)}
                                                className={`p-2 rounded-full transition ${darkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
                                                title="View Announcement"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
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
                    post={selectedPost} 
                    onClose={() => setShowPostModal(false)} 
                    darkMode={darkMode}
                    currentUser={profile} // Used for rendering buttons like edit if applicable
                />
            )}
        </>
    );
}
