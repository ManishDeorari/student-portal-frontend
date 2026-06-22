"use client";

import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditResumeAndLinksModal from "./modals/EditResumeAndLinksModal";
import { FileText, Github, Globe, Link as LinkIcon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileResumeAndLinks({ profile, setProfile, isPublicView }) {
  const [isEditing, setIsEditing] = useState(false);
  const { darkMode } = useTheme();

  const handleSave = (updatedData) => {
    setProfile((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  const hasData = !!profile.resume || !!profile.github || !!profile.portfolio || (profile.customLinks && profile.customLinks.length > 0);

  return (
    <>
      <SectionCard
        title="Resume & Links"
        hasData={hasData}
        onEdit={() => setIsEditing(true)}
        isPublicView={isPublicView}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Resume */}
          {profile.resume ? (
            <div className={`p-[2px] rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 transition-all hover:scale-[1.02] shadow-sm`}>
              <div className={`h-full flex flex-col justify-between p-4 rounded-[calc(1rem-2px)] ${darkMode ? 'bg-[#121212]' : 'bg-white'}`}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className={`w-5 h-5 ${darkMode ? 'text-pink-400' : 'text-pink-500'}`} />
                    <span className="font-bold text-sm tracking-widest uppercase">Resume</span>
                  </div>
                  <a
                    href={profile.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs font-bold underline truncate transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    View Resume
                  </a>
                </div>
              </div>
            </div>
          ) : (
             <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-center ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No Resume</p>
             </div>
          )}

          {/* GitHub */}
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
              </div>
            </div>
          ) : (
             <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-center ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No GitHub</p>
             </div>
          )}

          {/* Portfolio */}
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
              </div>
            </div>
          ) : (
             <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-center ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No Portfolio</p>
             </div>
          )}

          {/* Custom Links */}
          {profile.customLinks?.map((link, index) => (
            <div key={index} className={`p-[2px] rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 transition-all hover:scale-[1.02] shadow-sm`}>
              <div className={`h-full flex flex-col justify-between p-4 rounded-[calc(1rem-2px)] ${darkMode ? 'bg-[#121212]' : 'bg-white'}`}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <LinkIcon className={`w-5 h-5 ${darkMode ? 'text-teal-400' : 'text-teal-500'}`} />
                    <span className="font-bold text-sm tracking-widest uppercase truncate">{link.title}</span>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs font-bold underline truncate transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    {link.url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            </div>
          ))}

        </div>
      </SectionCard>

      <EditResumeAndLinksModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        currentData={{
          resume: profile.resume,
          github: profile.github,
          portfolio: profile.portfolio,
          customLinks: profile.customLinks || [],
        }}
        onSave={handleSave}
      />

    </>
  );
}
