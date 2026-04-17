"use client";
import React, { useEffect, useState } from "react";

export default function AdminPointsPanel() {
  const [users, setUsers] = useState([]);
  const [category, setCategory] = useState("profileCompletion");
  const [value, setValue] = useState(0);

  useEffect(() => {
    fetch("/api/user/award-eligible", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  const assignPoints = async (userId) => {
    await fetch("/api/admin/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ userId, category, value: parseInt(value) })
    });
    alert("✅ Points updated!");
  };

  return (
    <div className="bg-[#FAFAFA] text-black p-6 shadow rounded-xl">
      <h2 className="text-xl font-bold mb-4">Admin Points Panel</h2>
      <label>Category:</label>
      <select className="ml-2 border p-1" onChange={(e) => setCategory(e.target.value)}>
        <option value="profileCompletion">Profile Completion</option>
        <option value="studentEngagement">Student Engagement</option>
        <option value="referrals">Referrals</option>
        <option value="contentContribution">Content Contribution</option>
        <option value="campusEngagement">Campus Engagement</option>
        <option value="innovationSupport">Idea &amp; Innovation</option>
        <option value="studentParticipation">Student Participation</option>
      </select>
      <input
        type="number"
        className="ml-4 border px-2 py-1 w-20"
        placeholder="Points"
        onChange={(e) => setValue(e.target.value)}
      />
      <ul className="mt-4 space-y-2">
        {users.map((u) => (
          <li key={u._id} className="flex justify-between border-b pb-2">
            <span>{u.name} ({u.points?.total || 0} pts)</span>
            <button
              onClick={() => assignPoints(u._id)}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Assign
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
