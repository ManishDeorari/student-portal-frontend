"use client";
import React, { useState, useEffect } from "react";
import { fetchPendingPointsRequests, approvePointsRequest } from "../../../api/dashboard";
import toast from "react-hot-toast";
import PostModal from "../Post/Visual/PostModal";

const PointsRequestsList = ({ darkMode = false, user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [pointsOverrides, setPointsOverrides] = useState({});
  const [sessionPointsDefault, setSessionPointsDefault] = useState(30);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await fetchPendingPointsRequests();
      setRequests(data);
    } catch (err) {
      toast.error("Failed to load points requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (postId, action) => {
    try {
      // Use override if exists, otherwise use the section-level default for sessions
      let awardedPoints = undefined;
      if (action === "approve") {
        const post = requests.find(r => r._id === postId);
        if (post?.type === "Session") {
          awardedPoints = pointsOverrides[postId] !== undefined ? pointsOverrides[postId] : sessionPointsDefault;
        }
      }

      const res = await approvePointsRequest(postId, action, awardedPoints);
      if (res.message) {
        toast.success(res.message);
        setRequests(prev => prev.filter(r => r._id !== postId));
        setPointsOverrides(prev => {
          const newMap = { ...prev };
          delete newMap[postId];
          return newMap;
        });
      }
    } catch (err) {
      toast.error("Process failed");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <p className={`${darkMode ? "text-blue-300" : "text-slate-900"} font-black uppercase tracking-widest text-[10px]`}>Fetching pending requests...</p>
    </div>
  );

  const eventRequests = requests.filter(r => r.type === "Announcement");
  const sessionRequests = requests.filter(r => r.type === "Session");
  const repostRequests = requests.filter(r => r.type === "EventRepost");

  const RequestCard = ({ post }) => (
    <div key={post._id} className={`group relative p-[2px] rounded-[2rem] overflow-hidden transition-all hover:scale-[1.01] ${
        post.type === "Session" 
            ? "bg-gradient-to-r from-orange-500/50 to-red-500/50" 
            : "bg-gradient-to-r from-blue-500/50 to-purple-500/50"
    }`}>
      <div className={`p-3 sm:p-6 flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center rounded-[calc(2rem-2px)] ${
          darkMode ? "bg-black" : "bg-white"
      }`}>
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                <img src={post.user?.profilePicture || "/default-profile.jpg"} alt="profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-black ${darkMode ? "text-white" : "text-black"}`}>{post.user?.name || "Member"}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{post.user?.enrollmentNumber || "N/A"}</span>
              </div>
            </div>
            <span className={`text-[9px] font-bold opacity-40 uppercase`}>
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
              post.type === "Session"
                ? (darkMode ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600")
                : post.type === "EventRepost"
                ? (darkMode ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600")
                : (darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600")
            }`}>
              {post.type === "Session" ? "🤝 Session" : post.type === "EventRepost" ? "🏆 Event Repost" : "📢 Announcement"}
            </span>
          </div>
          
          <p className={`text-sm font-bold leading-relaxed ${darkMode ? "text-gray-200" : "text-slate-800"} line-clamp-1`}>
            {post.content}
          </p>

          <div className="flex flex-wrap gap-2">
            {post.type === "Session" ? (
               <div className={`flex items-center gap-2 p-[1px] rounded-xl bg-gradient-to-tr from-blue-400 to-purple-500 shadow-sm`}>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[calc(0.75rem-1px)] ${darkMode ? "bg-black" : "bg-white"}`}>
                  <span className="text-xs">🎯</span>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-tight ${darkMode ? "text-orange-400" : "text-orange-600"}`}>
                      Campus Engagement
                    </span>
                    <span className={`text-[8px] font-black uppercase ${darkMode ? "text-orange-300" : "text-orange-500"}`}>Points for Session</span>
                  </div>
                </div>
              </div>
            ) : post.type === "EventRepost" ? (
              <div className={`flex items-center gap-2 p-[1px] rounded-xl bg-gradient-to-tr from-green-400 to-emerald-500 shadow-sm`}>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[calc(0.75rem-1px)] ${darkMode ? "bg-black" : "bg-white"}`}>
                  <span className="text-xs">✅</span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black tracking-tight ${darkMode ? "text-green-400" : "text-green-600"}`}>
                        {post.eventRepostDetails?.eventName || post.eventRepostDetails?.originalEventId?.title || "Event Attended"}
                      </span>
                      {post.eventRepostDetails?.originalEventId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPost({
                              ...post.eventRepostDetails.originalEventId,
                              type: "Event",
                              content: post.eventRepostDetails.originalEventId.description,
                              user: typeof post.eventRepostDetails.originalEventId.createdBy === "object" 
                                ? post.eventRepostDetails.originalEventId.createdBy 
                                : post.user
                            });
                            setShowPostModal(true);
                          }}
                          className={`flex items-center justify-center w-7 h-7 rounded-full border transition-all active:scale-95 group/eye2 ${
                            darkMode 
                              ? "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-green-500/50 hover:bg-green-500/10" 
                              : "border-gray-200 bg-white text-gray-400 hover:text-green-600 hover:border-green-400 font-bold"
                          }`}
                          title="View Original Event"
                        >
                          <svg className="w-4 h-4 transition-transform group-hover/eye2:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    <span className={`text-[8px] font-black uppercase ${darkMode ? "text-green-300" : "text-green-500"}`}>
                      {post.eventRepostDetails?.campus && post.eventRepostDetails?.campus !== "None" ? `${post.eventRepostDetails.campus} • ` : ""}
                      {post.eventRepostDetails?.date ? new Date(post.eventRepostDetails.date).toLocaleDateString() : ""}
                      {!post.eventRepostDetails?.campus && !post.eventRepostDetails?.date && "Event Repost Details"}
                    </span>
                  </div>
                </div>
              </div>
            ) : post.type === "Announcement" ? (
              <div className={`flex flex-col gap-3 w-full mt-2`}>
                {(post.announcementDetails?.originalEventId || post.announcementDetails?.eventName) && (
                  <div className={`flex items-center gap-2 p-[1px] rounded-xl bg-gradient-to-tr from-blue-400 to-purple-500 shadow-sm self-start mb-2`}>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[calc(0.75rem-1px)] ${darkMode ? "bg-black" : "bg-white"}`}>
                      <span className="text-sm">🏆</span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black tracking-tight ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                            {post.announcementDetails?.eventName || post.announcementDetails?.originalEventId?.title || "Announcement Event"}
                          </span>
                          {post.announcementDetails?.originalEventId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPost({
                                  ...post.announcementDetails.originalEventId,
                                  type: "Event",
                                  content: post.announcementDetails.originalEventId.description,
                                  user: typeof post.announcementDetails.originalEventId.createdBy === "object" 
                                    ? post.announcementDetails.originalEventId.createdBy 
                                    : post.user
                                });
                                setShowPostModal(true);
                              }}
                              className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border transition-all active:scale-95 group/eye2 ${
                                darkMode 
                                  ? "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10" 
                                  : "border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-400 font-bold"
                              }`}
                              title="View Original Event"
                            >
                              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover/eye2:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                              </svg>
                            </button>
                          )}
                        </div>
                        <span className={`text-[8px] font-black uppercase ${darkMode ? "text-blue-300" : "text-blue-500"}`}>
                          {post.announcementDetails?.originalEventId ? "Linked Original Event" : "Event"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {post.announcementDetails?.winners?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Winners Requesting Points
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {post.announcementDetails.winners.map((w, i) => (
                        <div key={i} className={`p-[1.5px] rounded-xl bg-gradient-to-tr from-blue-400 to-purple-500 shadow-sm`}>
                          <div className={`flex items-center gap-3 px-3 py-2 rounded-[calc(0.75rem-1.5px)] ${darkMode ? "bg-black" : "bg-white"}`}>
                            <div className="relative">
                              <img 
                                src={w.userId?.profilePicture || w.profilePicture || "/default-profile.jpg"} 
                                alt="profile" 
                                className="w-8 h-8 rounded-full object-cover border border-white/10" 
                              />
                              <span className="absolute -bottom-1 -right-1 text-xs">{(w.userId || (w.isGroup && w.groupMembers?.length > 0)) ? "✅" : "❓"}</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className={`text-xs font-black uppercase tracking-tight truncate ${darkMode ? "text-white" : "text-slate-800"}`}>
                                {w.name}
                                {w.isGroup && <span className="ml-1 opacity-50 text-[9px]">(Group)</span>}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold opacity-60 font-mono tracking-tighter ${darkMode ? "text-blue-200" : "text-blue-600"}`}>
                                  {w.uniqueId || (w.isGroup && "Group IDs") || "ID Undefined"}
                                </span>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${darkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
                                  Rank {w.rank}
                                </span>
                              </div>
                            </div>
                            <div className={`flex flex-col items-end border-l pl-3 ml-1 ${darkMode ? "border-white/10" : "border-gray-200"}`}>
                              <span className={`text-[8px] font-black uppercase tracking-widest opacity-50 ${darkMode ? "text-white" : "text-black"}`}>Points</span>
                              <span className="text-xs font-black text-blue-400">+{w.points}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
            <button 
              onClick={() => handleAction(post._id, "approve")}
              className="flex-1 lg:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              Approve
            </button>
            <button 
              onClick={() => handleAction(post._id, "reject")}
              className={`flex-1 lg:flex-none px-4 sm:px-6 py-2.5 sm:py-3 border rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm ${
                darkMode 
                  ? "border-red-500/30 text-red-400 hover:bg-red-500/10" 
                  : "border-red-100 text-red-600 hover:bg-red-50 shadow-red-100/20"
              }`}
            >
              Reject
            </button>
            <button 
              onClick={() => {
                setSelectedPost(post);
                setShowPostModal(true);
              }}
              className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl border transition-all active:scale-95 group/eye ${
                darkMode 
                  ? "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10" 
                  : "border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-400 font-bold"
              }`}
              title="View Full Post"
            >
              <svg className="w-5 h-5 transition-transform group-hover/eye:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* 1. EVENTS SECTION */}
      <div className="relative p-[2px] bg-gradient-to-tr from-blue-400 to-purple-400 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500">
        <section className={`${darkMode ? "bg-black" : "bg-[#FAFAFA]"} p-4 sm:p-10 rounded-[calc(2.5rem-2px)] relative overflow-hidden group`}>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-dashed border-gray-200 dark:border-white/10">
              <h3 className={`text-base sm:text-xl font-black ${darkMode ? "text-white" : "text-slate-900"} flex items-center gap-2 sm:gap-3`}>
                <span className="p-2 bg-blue-600/20 rounded-xl text-blue-400">📢</span>
                Event & Announcement Points
              </h3>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                eventRequests.length > 0 
                  ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" 
                  : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
              }`}>
                {eventRequests.length} Pending
              </span>
            </div>

            {eventRequests.length === 0 ? (
              <div className={`p-10 text-center rounded-[2rem] border-2 border-dashed ${darkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"}`}>
                <p className={`text-sm font-bold ${darkMode ? "text-gray-500" : "text-gray-400"}`}>No pending event requests! ✨</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {eventRequests.map((post) => <RequestCard key={post._id} post={post} />)}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 2. SESSIONS SECTION */}
      <div className="relative p-[2px] bg-gradient-to-tr from-orange-400 to-red-400 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500">
        <section className={`${darkMode ? "bg-black" : "bg-[#FAFAFA]"} p-4 sm:p-10 rounded-[calc(2.5rem-2px)] relative overflow-hidden group`}>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 border-dashed border-gray-200 dark:border-white/10 gap-4">
              <div className="flex items-center gap-3">
                 <h3 className={`text-base sm:text-xl font-black ${darkMode ? "text-white" : "text-slate-900"} flex items-center gap-2 sm:gap-3`}>
                    <span className="p-2 bg-orange-600/20 rounded-xl text-orange-400">🤝</span>
                    Student Session Points
                 </h3>
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  sessionRequests.length > 0 
                    ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" 
                    : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                }`}>
                  {sessionRequests.length} Pending
                </span>
              </div>

              <div className="p-[1.5px] rounded-2xl bg-gradient-to-tr from-orange-400 to-red-500 shadow-md">
                <div className={`flex items-center gap-4 px-4 py-2 rounded-[calc(1rem-1.5px)] ${darkMode ? "bg-black" : "bg-white"}`}>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-slate-500"}`}>Point Allocation:</span>
                   <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        value={sessionPointsDefault}
                        onChange={(e) => setSessionPointsDefault(Number(e.target.value))}
                        className={`w-20 p-2 rounded-xl text-center text-sm font-black outline-none border transition-all ${
                          darkMode ? "bg-slate-900 text-orange-400 border-white/10 focus:border-orange-500/50" : "bg-gray-50 text-orange-600 border-gray-200 focus:border-orange-400"
                        }`}
                      />
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">per session</span>
                   </div>
                </div>
              </div>
            </div>

            {sessionRequests.length === 0 ? (
              <div className={`p-10 text-center rounded-[2.5rem] border-2 border-dashed ${darkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"}`}>
                <p className={`text-sm font-bold ${darkMode ? "text-gray-500" : "text-gray-400"}`}>No pending session requests! ✨</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {sessionRequests.map((post) => <RequestCard key={post._id} post={post} />)}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 3. EVENT REPOSTS SECTION */}
      <div className="relative p-[2px] bg-gradient-to-tr from-green-400 to-emerald-400 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500">
        <section className={`${darkMode ? "bg-black" : "bg-[#FAFAFA]"} p-4 sm:p-10 rounded-[calc(2.5rem-2px)] relative overflow-hidden group`}>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-dashed border-gray-200 dark:border-white/10">
              <h3 className={`text-base sm:text-xl font-black ${darkMode ? "text-white" : "text-slate-900"} flex items-center gap-2 sm:gap-3`}>
                <span className="p-2 bg-green-600/20 rounded-xl text-green-400">📸</span>
                Event Repost Points
              </h3>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                repostRequests.length > 0 
                  ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                  : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
              }`}>
                {repostRequests.length} Pending
              </span>
            </div>

            {repostRequests.length === 0 ? (
              <div className={`p-10 text-center rounded-[2.5rem] border-2 border-dashed ${darkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"}`}>
                <p className={`text-sm font-bold ${darkMode ? "text-gray-500" : "text-gray-400"}`}>No pending repost requests! ✨</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {repostRequests.map((post) => <RequestCard key={post._id} post={post} />)}
              </div>
            )}
          </div>
        </section>
      </div>

      {showPostModal && selectedPost && (
        <PostModal
          showModal={showPostModal}
          setShowModal={setShowPostModal}
          post={selectedPost}
          currentUser={user}
          darkMode={darkMode}
          hideInteractions={true}
          // No-op handlers just in case, though hidden
          handleReact={() => {}}
          getReactionCount={() => 0}
          userReacted={() => false}
          handleComment={() => {}}
          handleDelete={() => {}}
          toggleEdit={() => {}}
        />
      )}
    </div>
  );
};

export default PointsRequestsList;
