import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditExperienceModal from "./modals/EditExperienceModal";
import { Briefcase, MapPin, Calendar, ExternalLink, Building2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileExperience({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedUser) => {
        setProfile((prev) => ({
            ...prev,
            experience: updatedUser.experience,
        }));
    };

    const calculateDuration = (startDate, endDate) => {
        if (!startDate) return "";
        const start = new Date(startDate);
        const end = endDate === "Present" ? new Date() : new Date(endDate);

        if (isNaN(start.getTime())) return "";

        let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        if (months < 0) return "";

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        let result = "";
        if (years > 0) result += `${years} yr${years > 1 ? "s" : ""} `;
        if (remainingMonths > 0) result += `${remainingMonths} mo${remainingMonths > 1 ? "s" : ""}`;

        return result.trim();
    };

    return (
        <>
            <SectionCard
                title="Experience"
                hasData={profile.experience?.length > 0}
                onEdit={() => setIsEditing(true)}
                isPublicView={isPublicView}
            >
                <div className="space-y-8">
                    {profile.experience?.map((exp, idx) => {
                        const duration = calculateDuration(exp.startDate, exp.endDate);

                        return (
                            <div key={idx} className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_10px_30px_rgba(37,99,235,0.2)] group w-full mb-6">
                                <div className={`p-5 rounded-[calc(2.5rem-2.5px)] flex gap-4 transition duration-300 ${darkMode ? 'bg-[#121213] hover:bg-slate-900' : 'bg-[#FAFAFA] hover:bg-white'}`}>
                                    {/* Logo Placeholder */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${darkMode ? 'bg-blue-900/30 shadow-none' : 'bg-blue-50 shadow-sm'}`}>
                                            <Building2 className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow space-y-2.5">
                                        <div className="flex flex-col">
                                            <h3 className={`text-base font-black leading-tight ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600'}`}>
                                                {exp.title}
                                            </h3>
                                            <p className={`text-sm font-black mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                                {exp.company}
                                                {exp.employmentType && ` · ${exp.employmentType}`}
                                            </p>
                                        </div>

                                        <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                            <Calendar className="w-3.5 h-3.5" />
                                            {exp.startDate} - {exp.endDate}
                                            {duration && <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}> · {duration}</span>}
                                        </div>

                                        {(exp.location || exp.locationType) && (
                                            <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                                <MapPin className="w-3.5 h-3.5" />
                                                {exp.location}
                                                {exp.location && exp.locationType && " · "}
                                                {exp.locationType}
                                            </div>
                                        )}

                                        {exp.description && (
                                            <div className="pt-1">
                                                <p className={`text-sm font-semibold whitespace-pre-wrap leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {exp.description}
                                                </p>
                                            </div>
                                        )}

                                        {exp.skills && exp.skills.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Skills:</span>
                                                {exp.skills.map((skill, sIdx) => (
                                                    <span
                                                        key={sIdx}
                                                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${darkMode ? 'bg-slate-800 text-gray-300 border-white/10' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {(!profile.experience || profile.experience.length === 0) && (
                    <div className={`py-6 text-center rounded-lg border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                        <Briefcase className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'} font-medium`}>No professional experience added yet.</p>
                    </div>
                )}
            </SectionCard>

            <EditExperienceModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                currentExperience={profile.experience || []}
                onSave={handleSave}
            />
        </>
    );
}
