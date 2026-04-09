"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import PostCard from "../../components/Post/PostCard";

export default function MyActivityPage() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setActivity(data); // ✅ already sorted in backend
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching activity:", error.message);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading activity...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <Sidebar />
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">My Activity</h1>
        {activity.length > 0 ? (
          activity.map((act, idx) => (
            <div key={idx} className="mb-6">
              <p className="text-sm text-gray-300 mb-2">
                {act.type === "reaction" && <>You reacted <b>{act.reaction}</b></>}
                {act.type === "comment" && (
                  <>You commented: <i>&quot;{String(act.text || "")}&quot;</i></>
                )}
                {act.type === "reply" && (
                  <>You replied: <i>&quot;{String(act.text || "")}&quot;</i></>
                )}
              </p>
              {act.post && <PostCard post={act.post} />}
            </div>
          ))
        ) : (
          <p className="text-gray-200">No activity yet.</p>
        )}
      </div>
    </div>
  );
}
