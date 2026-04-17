"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Copy, Edit, UserPlus, Check, Award } from "lucide-react";
import toast from "react-hot-toast";
import ProfileAvatar from "./ProfileAvatar";
import ProfileBanner from "./ProfileBanner";
import ProfileStats from "./ProfileStats";
import EditBasicInfoModal from "./modals/EditBasicInfoModal";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileBasicInfo({ profile, setProfile, onRefresh, isPublicView }) {
    const { darkMode } = useTheme();
    const [copied, setCopied] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null); // null, 'connected', 'pending', 'none'
    const [loading, setLoading] = useState(false);

    const getMissingFields = () => {
        if (!profile || profile.role !== "student" || isPublicView || profile.profileCompletionAwarded) return null;
        
        const missing = [];
        if (!profile.profilePicture || profile.profilePicture.includes("default-profile.jpg")) missing.push("Profile Picture");
        if (!profile.bannerImage || profile.bannerImage.includes("default_banner.jpg")) missing.push("Banner Image");
        if (!profile.phone || profile.phone === "Not provided" || profile.phone === "") missing.push("Phone Number");
        if (!profile.address || profile.address === "Not set" || profile.address === "") missing.push("Address");
        if (!profile.whatsapp || profile.whatsapp === "Not linked" || profile.whatsapp === "") missing.push("WhatsApp");
        if (!profile.linkedin || profile.linkedin === "Not linked" || profile.linkedin === "") missing.push("LinkedIn");
        if (!profile.bio || profile.bio.trim().length === 0) missing.push("Bio (About Section)");
        
        const MANDATORY_DEGREES = [
            "High School (Secondary - Class 10)",
            "Intermediate (Higher Secondary - Class 12)",
            "Undergraduate (Bachelor's Degree)",
            "Postgraduate (Master's Degree)"
        ];
        const userEducations = profile.education || [];
        const completedMandatoryCount = MANDATORY_DEGREES.filter(degree => {
            const found = userEducations.find(e => e.level === degree || e.degree === degree);
            return found && found.institution && found.startDate && found.endDate;
        }).length;

        if (completedMandatoryCount < 3) {
            missing.push("Education (At least 3/4 of 10th, 12th, UG, PG)");
        }

        return missing.length > 0 ? missing : null;
    };
    const missingFields = getMissingFields();

    const copyToClipboard = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleProfileUpdate = (updatedProfile) => {
        setProfile((prev) => ({
            ...prev,
            ...updatedProfile,
        }));
    };

    const fetchConnectionStatus = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const currentUserRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const currentUser = await currentUserRes.json();

            // Check if already connected
            const connections = currentUser.connections || [];
            if (connections.some(id => id.toString() === profile._id.toString())) {
                setConnectionStatus('connected');
                return;
            }

            // Check if request already sent
            const sentRequests = currentUser.sentRequests || [];
            if (sentRequests.some(id => id.toString() === profile._id.toString())) {
                setConnectionStatus('pending');
                return;
            }

            // Check if they sent you a request
            const pendingRequests = currentUser.pendingRequests || [];
            if (pendingRequests.some(id => id.toString() === profile._id.toString())) {
                setConnectionStatus('accept');
                return;
            }

            setConnectionStatus('none');
        } catch (err) {
            console.error("Error fetching connection status:", err);
        }
    }, [profile._id]);

    // Fetch connection status when viewing another user's profile
    useEffect(() => {
        if (isPublicView && profile._id) {
            fetchConnectionStatus();
        }
    }, [isPublicView, profile._id, fetchConnectionStatus]);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connect/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ to: profile._id }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Connection request sent!");
                setConnectionStatus('pending');
            } else {
                toast.error(data.message || "Failed to send request");
            }
        } catch (err) {
            console.error("Error sending connection request:", err);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-3 p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)]">
            <div className={`${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} rounded-[calc(2.5rem-2.5px)] overflow-hidden h-full`}>
                {/* 🔷 Banner */}
                <div className={`relative w-full h-28 sm:h-40 md:h-48 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                    <ProfileBanner
                        image={profile.bannerImage}
                        onUpload={onRefresh}
                        userId={profile._id}
                        isPublicView={isPublicView}
                    />
                </div>

                {/* 🔷 Profile Info Block */}
                <div className="relative px-4 sm:px-6 pb-4 sm:pb-6 -mt-12 sm:-mt-16 flex flex-col items-center">
                    {/* Avatar - Centered */}
                    <div className="relative z-10">
                        <ProfileAvatar
                            image={profile.profilePicture}
                            onUpload={onRefresh}
                            userId={profile._id}
                            isPublicView={isPublicView}
                        />
                    </div>

                    {/* Name + Edit */}
                    <div className="flex flex-col items-center w-full mt-2 text-center">
                        <div className="flex items-center justify-center gap-2 w-full">
                            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profile.name || "Unnamed User"}</h2>
                            {!isPublicView && (
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className={`p-1.5 shadow-sm border rounded-full transition-all ${darkMode ? 'bg-slate-800 text-white border-white/10 hover:bg-slate-700' : 'bg-[#FAFAFA] text-gray-900 border-gray-200 hover:bg-gray-50'}`}
                                    title="Edit Profile"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <p className="mt-1 flex items-center justify-center gap-2 w-full">
                            <span className={`font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded border italic ${darkMode ? 'text-blue-400 bg-blue-900/30 border-blue-900/50' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                                {profile.role || "Member"}
                            </span>
                            {!(profile.isMainAdmin || profile.email === "admin@studentportal.com" || profile.email === "manishdeorari377@gmail.com") && (
                                <>
                                    <span className={`${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                                    <span className={`font-bold uppercase tracking-widest text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {profile.role === 'admin' || profile.role === 'faculty' ? (profile.employeeId || "N/A") : (profile.enrollmentNumber || "N/A")}
                                    </span>
                                </>
                            )}
                        </p>
                        {profile.publicId && (
                            <div className={`mt-1 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span className={`select-all px-2 py-0.5 rounded-md transition-all cursor-text ${darkMode ? 'bg-[#121213]/50 text-white/70 border border-white/5' : 'bg-[#FAFAFA]/70 text-gray-700 border border-black/5'}`}>
                                    @{profile.publicId}
                                </span>
                                <button 
                                    onClick={() => copyToClipboard(`${window.location.origin}/profile/${profile.publicId}`, "publicId")} 
                                    className={`p-1 rounded-md transition-colors ${darkMode ? 'hover:bg-white/10 text-blue-400' : 'hover:bg-black/5 text-blue-600'}`}
                                    title="Copy Profile Link"
                                >
                                    {copied === "publicId" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Missing Fields Alert for Points */}
                    {missingFields && (
                        <div className="w-full mt-6 p-[2.5px] bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.25)]">
                            <div className={`p-4 rounded-[calc(1rem-2.5px)] ${darkMode ? 'bg-[#121213]/90 text-yellow-100' : 'bg-yellow-50 text-yellow-900'} backdrop-blur-md`}>
                                <h3 className="text-sm font-black uppercase tracking-wider mb-3 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Award className="w-5 h-5 text-yellow-500" />
                                        Complete Profile for Points
                                    </span>
                                    <span className="text-[10px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full font-black tracking-widest">
                                        {missingFields.length} Tasks Left
                                    </span>
                                </h3>
                                <ul className="text-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 font-medium">
                                    {missingFields.map((field, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0"></span>
                                            <span className="opacity-90 leading-tight">{field}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Contact row - 2 Rows with Gradient Borders */}
                    <div className="w-full mt-5 sm:mt-8 space-y-3 sm:space-y-4">
                        {/* Level 1: Basics (Email & Address) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-[2.5px] bg-gradient-to-tr from-blue-600/40 to-purple-600/40 rounded-2xl shadow-lg">
                                <div className={`p-4 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Primary Email</label>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold truncate lowercase ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{profile.email}</span>
                                        <button onClick={() => copyToClipboard(profile.email, "email")} className="text-blue-300 hover:text-blue-600">
                                            {copied === "email" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-[2.5px] bg-gradient-to-tr from-orange-600/40 to-red-600/40 rounded-2xl shadow-lg">
                                <div className={`p-4 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Resident Address</label>
                                    <span className={`text-sm font-bold leading-tight ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{profile.address || "Not set"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Level 2: Connect Icons (Phone, WhatsApp, LinkedIn) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Phone */}
                            <div className="p-[2.5px] bg-gradient-to-tr from-green-600/40 to-teal-600/40 rounded-2xl shadow-lg">
                                <div className={`p-3 sm:p-5 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center transition-all ${darkMode ? 'bg-slate-800 hover:bg-green-900/10' : 'bg-[#FAFAFA] hover:bg-green-50/10'}`}>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Phone Number</label>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm sm:text-base font-black ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{profile.phone || "N/A"}</span>
                                        {profile.phone && (
                                            <button onClick={() => copyToClipboard(profile.phone, "phone")} className="text-green-300 hover:text-green-600">
                                                {copied === "phone" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="p-[2.5px] bg-gradient-to-tr from-emerald-600/40 to-green-600/40 rounded-2xl shadow-lg">
                                <div className={`p-3 sm:p-5 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center transition-all cursor-pointer ${darkMode ? 'bg-slate-800 hover:bg-emerald-900/10' : 'bg-[#FAFAFA] hover:bg-emerald-50/10'}`}>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>WhatsApp Direct</label>
                                    {profile.whatsapp ? (
                                        <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={`font-black text-base hover:underline ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>{profile.whatsapp}</a>
                                    ) : <span className={`text-base font-bold italic ${darkMode ? 'text-gray-500' : 'text-gray-300'}`}>None</span>}
                                </div>
                            </div>

                            {/* LinkedIn */}
                            <div className="p-[2.5px] bg-gradient-to-tr from-indigo-600/40 to-blue-600/40 rounded-2xl shadow-lg">
                                <div className={`p-3 sm:p-5 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center transition-all cursor-pointer ${darkMode ? 'bg-slate-800 hover:bg-indigo-900/10' : 'bg-[#FAFAFA] hover:bg-indigo-50/10'}`}>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Professional LinkedIn</label>
                                    {profile.linkedin ? (
                                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={`font-black text-base hover:underline italic ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>Connect Now →</a>
                                    ) : <span className={`text-base font-bold italic ${darkMode ? 'text-gray-500' : 'text-gray-300'}`}>None</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] -mx-4 sm:-mx-6 mt-4 sm:mt-6 flex flex-col items-center">
                        {/* Gradient Divider */}
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mb-2"></div>
                        <div className="w-full px-6">
                            <ProfileStats profile={profile} isPublicView={isPublicView} />
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                <EditBasicInfoModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    currentProfile={profile}
                    onSave={handleProfileUpdate}
                />
            </div>
        </div>
    );
}
