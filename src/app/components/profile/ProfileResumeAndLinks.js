"use client";

import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditResumeAndLinksModal from "./modals/EditResumeAndLinksModal";
import { FileText, Github, Globe, CheckCircle, Clock, XCircle, HandHeart } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";

export default function ProfileResumeAndLinks({ profile, setProfile, isPublicView }) {
  const [isEditing, setIsEditing] = useState(false);
  const { darkMode } = useTheme();

  const handleSave = (updatedData) => {
    setProfile((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  const handleRequestPoints = async (field) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile/points-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ field }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to request points");

      toast.success("Points requested successfully!");
      setProfile((prev) => ({
        ...prev,
        [`${field}PointsStatus`]: "pending",
      }));
    } catch (err) {
      toast.error(err.message || "Error requesting points");
    }
  };

  const renderStatusAndAction = (field, value, status) => {
    if (isPublicView) return null;
    if (!value) return null; // No action if field is not filled

    return (
      <div className="flex items-center gap-2 mt-1">
        {status === "pending" && (
          <span className="flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Pending Approval
          </span>
        )}
        {status === "approved" && (
          <span className="flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" /> Points Awarded
          </span>
        )}
        {status === "rejected" && (
          <span className="flex items-center gap-1 text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        )}
        {(status === "none" || status === "rejected") && (
          <button
            onClick={() => handleRequestPoints(field)}
            className="flex items-center gap-1 text-xs text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded-full transition-colors"
          >
            <HandHeart className="w-3 h-3" /> Request 10 Points
          </button>
        )}
      </div>
    );
  };

  const hasData = !!profile.resume || !!profile.github || !!profile.portfolio;

  return (
    <>
      <SectionCard
        title="Resume & Portfolio"
        hasData={hasData}
        onEdit={() => setIsEditing(true)}
        isPublicView={isPublicView}
      >
        {!isPublicView && (
          <p className={`text-xs italic mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Tip: You can request 10 points each for adding your Resume, GitHub, and Portfolio. Admin approval is required.
          </p>
        )}

        <div className="space-y-4">
          {profile.resume ? (
            <div>
              <a
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 p-3 rounded-xl border transition-all hover:shadow-md ${darkMode ? 'bg-slate-800/50 border-white/10 hover:bg-slate-800 text-blue-400 hover:text-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-blue-600 hover:text-blue-800'}`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-semibold">View Resume (PDF)</span>
              </a>
              {renderStatusAndAction("resume", profile.resume, profile.resumePointsStatus)}
            </div>
          ) : (
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No resume uploaded yet.</p>
          )}

          {profile.github && (
            <div>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
              >
                <Github className="w-5 h-5" />
                {profile.github.replace(/^https?:\/\//, '')}
              </a>
              {renderStatusAndAction("github", profile.github, profile.githubPointsStatus)}
            </div>
          )}

          {profile.portfolio && (
            <div>
              <a
                href={profile.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 font-medium transition-colors ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
              >
                <Globe className="w-5 h-5" />
                {profile.portfolio.replace(/^https?:\/\//, '')}
              </a>
              {renderStatusAndAction("portfolio", profile.portfolio, profile.portfolioPointsStatus)}
            </div>
          )}

          {!hasData && (
            <p className={`font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              No resume or portfolio details added yet.
            </p>
          )}
        </div>
      </SectionCard>

      <EditResumeAndLinksModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        currentData={{
          resume: profile.resume,
          github: profile.github,
          portfolio: profile.portfolio,
        }}
        onSave={handleSave}
      />
    </>
  );
}
