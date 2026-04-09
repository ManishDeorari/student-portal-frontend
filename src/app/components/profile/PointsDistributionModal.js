"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, Info, ChevronDown, ChevronRight } from "lucide-react";

import { useTheme } from "@/context/ThemeContext";

const CATEGORY_GROUPS = [
    {
        id: "login",
        label: "Daily Login",
        icon: "🔑",
    },
    {
        id: "profileCompletion",
        label: "Profile Completion",
        icon: "👤",
    },
    {
        id: "studentEngagement",
        label: "Student Engagement",
        icon: "🤝",
        children: [
            { id: "connections", label: "Networking" },
        ]
    },
    {
        id: "contentContribution",
        label: "Content Contribution",
        icon: "📝",
        children: [
            { id: "posts", label: "Posts" },
            { id: "likes", label: "Reactions" },
            { id: "comments", label: "Comments" },
        ]
    },
    {
        id: "referrals",
        label: "Referrals",
        icon: "📢",
    },
    {
        id: "campusEngagement",
        label: "Campus Engagement",
        icon: "🏫",
    },
    {
        id: "innovationSupport",
        label: "Innovation Support",
        icon: "💡",
    },
    {
        id: "alumniParticipation",
        label: "Alumni Participation",
        icon: "🎓",
    },
    {
        id: "other",
        label: "Other Activities",
        icon: "⚙️",
    },
    {
        id: "penalty",
        label: "Penalty",
        icon: "⚠️",
    }
];

export default function PointsDistributionModal({ isOpen, onClose, user }) {
    const [expanded, setExpanded] = React.useState({});
    const { darkMode } = useTheme();

    if (!user || user.role !== "alumni") return null;

    const points = user.points || {};

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-md overflow-hidden relative max-h-[95dvh] sm:max-h-[90vh]"
                    >
                        <div className={`${darkMode ? 'bg-[#121212]' : 'bg-[#FAFAFA]'} rounded-[calc(2.5rem-2.5px)] overflow-hidden relative`}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1 hover:bg-[#FAFAFA]/20 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-3">
                                <Award className="w-8 h-8 text-yellow-300" />
                                <div>
                                    <h2 className="text-xl font-bold">{user.name}&apos;s Points</h2>
                                    <p className="text-white font-bold opacity-100 text-sm">Detailed Breakdown</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="relative p-[2px] mb-4 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-sm">
                                <div className={`flex items-center justify-between p-4 rounded-[calc(1rem-2px)] ${darkMode ? 'bg-black' : 'bg-white'}`}>
                                    <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>Total Balance</span>
                                    <span className="text-2xl font-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">{points.total || 0}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className={`text-sm font-black uppercase tracking-widest px-1 mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    Activity Breakdown
                               </h3>
                                {CATEGORY_GROUPS.map((group) => (
                                    <div 
                                        key={group.id} 
                                        className={`group/item relative p-[2px] mb-3 rounded-xl shadow-sm bg-gradient-to-r ${
                                            group.id === 'penalty' 
                                            ? 'from-red-600 via-orange-500 to-yellow-500' 
                                            : 'from-blue-500 via-purple-500 to-pink-500'
                                        }`}
                                    >
                                        <div className={`rounded-[calc(1rem-2px)] flex flex-col w-full ${darkMode ? 'bg-[#121212]' : 'bg-white'}`}>
                                            <div
                                                onClick={() => group.children && toggleExpand(group.id)}
                                                className={`flex items-center justify-between p-4 transition-all ${group.children ? 'cursor-pointer' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{group.icon}</span>
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{group.label}</span>
                                                        {group.children && (
                                                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                                {expanded[group.id] ? 'Click to hide details' : 'Click to expand details'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {points[group.id] || 0}
                                                    </span>
                                                    {group.children && (
                                                        expanded[group.id] ? <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-gray-900'}`} /> : <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Children */}
                                            <AnimatePresence>
                                                {group.children && expanded[group.id] && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden pb-4"
                                                    >
                                                        {group.children.map(child => (
                                                            <div key={child.id} className="relative p-[2px] mx-4 mb-2 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                                                              <div className={`flex items-center justify-between py-2 px-4 rounded-[calc(0.5rem-2px)] ${darkMode ? 'bg-black' : 'bg-[#FAFAFA]'}`}>
                                                                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{child.label}</span>
                                                                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{points[child.id] || 0}</span>
                                                              </div>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {user.lastYearPoints && (
                                <div className={`mt-8 pt-4 border-t ${darkMode ? 'border-white/20' : 'border-gray-200'}`}>
                                    <h3 className={`text-sm font-black uppercase tracking-widest px-1 mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                        Past Performance
                                    </h3>
                                    <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-gray-500 to-slate-500 shadow-sm">
                                      <div className={`flex items-center justify-between p-4 rounded-[calc(1rem-2px)] ${darkMode ? 'bg-black' : 'bg-white'}`}>
                                          <div className="flex items-center gap-3">
                                              <span className="text-xl">📅</span>
                                              <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Year {user.lastYearPoints.year}</span>
                                          </div>
                                          <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.lastYearPoints.total || 0}</span>
                                      </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={`p-4 border-t ${darkMode ? 'bg-[#121212] border-white/20' : 'bg-gray-50 border-gray-200'} text-center flex justify-center`}>
                            <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 w-full sm:w-auto">
                              <button
                                  onClick={onClose}
                                  className={`px-10 py-2.5 w-full h-full rounded-[calc(0.75rem-2px)] font-bold transition-all active:scale-95 ${darkMode ? 'bg-black hover:bg-black/80 text-white' : 'bg-white hover:bg-gray-50 text-slate-800'}`}
                              >
                                  Done
                              </button>
                            </div>
                        </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
