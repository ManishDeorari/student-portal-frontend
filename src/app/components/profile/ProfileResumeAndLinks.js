"use client";

import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditResumeAndLinksModal from "./modals/EditResumeAndLinksModal";
import { FileText, Github, Globe, CheckCircle, Clock, XCircle, HandHeart } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";

export default function ProfileResumeAndLinks({ profile, setProfile, isPublicView }) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.resume ? (
            <div className={`p-[2px] rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 transition-all hover:scale-[1.02] shadow-sm`}>
              <div className={`h-full flex flex-col justify-between p-4 rounded-[calc(1rem-2px)] ${darkMode ? 'bg-[#121212]' : 'bg-white'}`}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className={`w-5 h-5 ${darkMode ? 'text-pink-400' : 'text-pink-500'}`} />
                    <span className="font-bold text-sm tracking-widest uppercase">Resume</span>
                  </div>
                  <button
                    onClick={() => setSelectedPdf(profile.resume)}
                    className={`text-xs font-bold underline transition-colors text-left ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    View PDF
                  </button>
                </div>
                <div className="mt-4">
                  {renderStatusAndAction("resume", profile.resume, profile.resumePointsStatus)}
                </div>
              </div>
            </div>
          ) : (
             <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-center ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No Resume</p>
             </div>
          )}

          {profile.github ? (
            <div className={`p-[2px] rounded-2xl bg-gradient-to-tr from-gray-600 to-slate-800 transition-all hover:scale-[1.02] shadow-sm`}>
              <div className={`h-full flex flex-col justify-between p-4 rounded-[calc(1rem-2px)] ${darkMode ? 'bg-[#121212]' : 'bg-white'}`}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Github className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                    <span className="font-bold text-sm tracking-widest uppercase">GitHub</span>
                  </div>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs font-bold underline truncate transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    {profile.github.replace(/^https?:\/\//, '')}
                  </a>
                </div>
                <div className="mt-4">
                  {renderStatusAndAction("github", profile.github, profile.githubPointsStatus)}
                </div>
              </div>
            </div>
          ) : (
             <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-center ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No GitHub</p>
             </div>
          )}

          {profile.portfolio ? (
            <div className={`p-[2px] rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 transition-all hover:scale-[1.02] shadow-sm`}>
               <div className={`h-full flex flex-col justify-between p-4 rounded-[calc(1rem-2px)] ${darkMode ? 'bg-[#121212]' : 'bg-white'}`}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
                    <span className="font-bold text-sm tracking-widest uppercase">Portfolio</span>
                  </div>
                  <a
                    href={profile.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs font-bold underline truncate transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    {profile.portfolio.replace(/^https?:\/\//, '')}
                  </a>
                </div>
                <div className="mt-4">
                  {renderStatusAndAction("portfolio", profile.portfolio, profile.portfolioPointsStatus)}
                </div>
              </div>
            </div>
          ) : (
             <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-center ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No Portfolio</p>
             </div>
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

      {selectedPdf && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
          <div className={`relative w-full max-w-4xl h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl ${darkMode ? 'bg-[#121212]' : 'bg-white'}`}>
             <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 flex justify-between items-center text-white">
                <h3 className="font-bold tracking-widest uppercase text-sm">Resume Viewer</h3>
                <button onClick={() => setSelectedPdf(null)} className="hover:bg-white/20 p-1 rounded-full transition">
                   <XCircle className="w-5 h-5"/>
                </button>
             </div>
             <iframe src={selectedPdf} className="w-full flex-1 border-0" title="Resume PDF" />
          </div>
        </div>
      )}
    </>
  );
}
