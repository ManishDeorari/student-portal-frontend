"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Copy, Pencil, UserPlus, Check, Award, QrCode, Download } from "lucide-react";
import toast from "react-hot-toast";
import dynamic from 'next/dynamic';
import ProfileAvatar from "./ProfileAvatar";
import ProfileBanner from "./ProfileBanner";
import ProfileStats from "./ProfileStats";
import ResumeDownloadBtn from "./ResumeDownloadBtn";
import EditBasicInfoModal from "./modals/EditBasicInfoModal";
import QrCodeModal from "./modals/QrCodeModal";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileBasicInfo({ profile, setProfile, onRefresh, isPublicView }) {
    const { darkMode } = useTheme();
    const [copied, setCopied] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null); // null, 'connected', 'pending', 'none'
    const [loading, setLoading] = useState(false);
    const [viewerRole, setViewerRole] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const u = JSON.parse(userStr);
                setViewerRole(u.role);
            } catch(e){}
        }
    }, []);

    const shouldHidePrivateFields = isPublicView && viewerRole === 'student';
    
    const isProfileOwnerStudentOrAlumni = profile.role === 'student' || profile.role === 'alumni';
    const isViewerPrivileged = viewerRole && ['faculty', 'admin', 'main_admin', 'mainadmin', 'superadmin'].includes(viewerRole.toLowerCase());
    const canViewResume = isProfileOwnerStudentOrAlumni && (!isPublicView || isViewerPrivileged);

    const getMissingFields = () => {
        if (!profile || profile.role !== "student" || isPublicView || profile.profileCompletionAwarded) return null;
        
        const missing = [];
        if (!profile.profilePicture || profile.profilePicture.includes("default-profile.jpg")) missing.push("Profile Picture");
        if (!profile.bannerImage || profile.bannerImage.includes("default_banner.jpg")) missing.push("Banner Image");
        if (!profile.secondaryEmail || profile.secondaryEmail === "") missing.push("Secondary Email");
        if (!profile.universityRollNumber || profile.universityRollNumber === "") missing.push("University Roll Number");
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
        if (loading) return;
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
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-3 p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)]">
            <div className={`${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} rounded-[calc(2.5rem-2.5px)] overflow-hidden h-full`}>
                {/* 🔷 Banner */}
                <div className={`relative w-full h-28 sm:h-40 md:h-48 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                    <ProfileBanner
                        image={profile.bannerImage}
                        focus={profile.bannerImageFocus}
                        onUpload={onRefresh}
                        userId={profile._id}
                        isPublicView={isPublicView}
                    />
                </div>

                {/* 🔷 Profile Info Block */}
                <div className="relative px-4 sm:px-6 pb-4 sm:pb-6 -mt-12 sm:-mt-16 flex flex-col items-center">
                    <div className="relative z-10">
                        <ProfileAvatar
                            user={profile}
                            image={profile.profilePicture}
                            onUpload={onRefresh}
                            userId={profile._id}
                            isPublicView={isPublicView}
                        />
                    </div>

                    {/* Action Icons - Top Left */}
                    <div className="absolute top-[8.5rem] sm:top-20 left-2 sm:left-4 z-20 flex items-center gap-2">
                        {canViewResume && <ResumeDownloadBtn profile={profile} darkMode={darkMode} />}
                    </div>

                    {/* Action Icons - Top Right */}
                    <div className="absolute top-[8.5rem] sm:top-20 right-2 sm:right-4 z-20 flex items-center gap-2">
                        {/* QR Code Button - Available to everyone */}
                        <div className="p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg">
                            <button
                                onClick={() => setShowQrModal(true)}
                                className={`p-3 sm:p-2 rounded-[calc(9999px-2px)] transition-all hover:scale-105 ${darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                                title="Show QR Code"
                            >
                                <QrCode className="w-5 h-5 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                        
                        {/* Edit Profile Icon - Only for owner */}
                        {!isPublicView && (
                            <div className="p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg">
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className={`p-3 sm:p-2 rounded-[calc(9999px-2px)] transition-all hover:scale-105 ${darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                                    title="Edit Profile"
                                >
                                    <Pencil className="w-5 h-5 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <div className="flex flex-col items-center w-full mt-2 text-center">
                        <div className="flex items-center justify-center gap-2 w-full">
                            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profile.name || "Unnamed User"}</h2>
                        </div>

                        <p className="mt-1 flex items-center justify-center gap-2 w-full">
                            <span className={`font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded border italic ${darkMode ? 'text-blue-400 bg-blue-900/30 border-blue-900/50' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                                {profile.role || "Member"}
                            </span>
                            {!(profile.isMainAdmin || profile.email === "manishdeorari377@gmail.com") && profile.role !== 'student' && profile.role !== 'alumni' && (
                                <>
                                    <span className={`${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                                    <span className={`font-bold uppercase tracking-widest text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {profile.employeeId || "N/A"}
                                    </span>
                                </>
                            )}
                        </p>
                        {profile.publicId && (
                            <div className={`mt-1 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span className={`select-all px-2 py-0.5 rounded-md transition-all cursor-text ${darkMode ? 'bg-[#121213]/50 text-white/70 border border-white/5' : 'bg-[#FAFAFA]/70 text-black border border-black/5'}`}>
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

                    {/* Profile Completion Tracker Bar */}
                    {(!isPublicView && profile.role === "student" && !profile.profileCompletionAwarded) && (
                        <div className="w-full mt-6 p-[2.5px] bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg hover:scale-[1.01] transition-transform duration-300">
                            <div className={`p-5 rounded-[calc(1rem-2.5px)] ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        <Award className="w-5 h-5 text-yellow-500" />
                                        Profile Completion
                                    </h3>
                                    <span className={`text-sm font-black ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {missingFields ? Math.round(((10 - missingFields.length) / 10) * 100) : 100}%
                                    </span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className={`w-full h-3 rounded-full overflow-hidden mt-3 mb-4 shadow-inner ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative"
                                        style={{ width: `${missingFields ? Math.round(((10 - missingFields.length) / 10) * 100) : 100}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                                    </div>
                                </div>

                                {missingFields && missingFields.length > 0 ? (
                                    <div className="mt-4">
                                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {missingFields.length} Tasks Remaining for Points:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {missingFields.map((field, idx) => (
                                                <div key={idx} className="p-[1.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-md shadow-sm">
                                                    <span className={`block text-[10px] font-black tracking-widest px-2.5 py-1 rounded-[calc(0.375rem-1.5px)] ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-black'}`}>
                                                        {field}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex items-center gap-2 text-green-500">
                                        <Check className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Profile 100% Complete!</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contact row - 2 Rows with Gradient Borders */}
                    <div className="w-full mt-5 sm:mt-8 space-y-3 sm:space-y-4">
                        {/* Level 1: Basics (Emails) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-[2.5px] bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
                                <div className={`p-4 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Primary Email</label>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold truncate lowercase ${darkMode ? 'text-white' : 'text-black'}`}>{profile.email}</span>
                                        <button onClick={() => copyToClipboard(profile.email, "email")} className="text-blue-300 hover:text-blue-600">
                                            {copied === "email" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-[2.5px] bg-gradient-to-tr from-cyan-500 to-teal-500 rounded-2xl shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
                                <div className={`p-4 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Secondary Email</label>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold truncate lowercase ${darkMode ? 'text-white' : 'text-black'}`}>{profile.secondaryEmail || "Not set"}</span>
                                        {profile.secondaryEmail && (
                                            <button onClick={() => copyToClipboard(profile.secondaryEmail, "secondaryEmail")} className="text-blue-300 hover:text-blue-600">
                                                {copied === "secondaryEmail" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* New Level: Role Specific Info */}
                        {profile.role === 'student' ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-[2.5px] bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-2xl shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
                                        <div className={`p-4 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Enrollment Number</label>
                                            <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-black'}`}>{profile.enrollmentNumber || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="p-[2.5px] bg-gradient-to-tr from-purple-500 to-fuchsia-500 rounded-2xl shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
                                        <div className={`p-4 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>University Roll Number</label>
                                            <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-black'}`}>{profile.universityRollNumber || "Not set"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                    <div className="p-[2.5px] bg-gradient-to-tr from-pink-500 to-rose-500 rounded-2xl shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
                                        <div className={`p-4 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Course</label>
                                            <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-black'}`}>{profile.course || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="p-[2.5px] bg-gradient-to-tr from-rose-500/40 to-orange-500/40 rounded-2xl shadow-lg">
                                        <div className={`p-4 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Branch</label>
                                            <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-black'}`}>{profile.branch || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="p-[2.5px] bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-2xl shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
                                        <div className={`p-4 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Semester</label>
                                            <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-black'}`}>{profile.semester || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="p-[2.5px] bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
                                        <div className={`p-4 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Section</label>
                                            <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-black'}`}>{profile.section || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-[2.5px] bg-gradient-to-tr from-violet-500 to-purple-500 rounded-2xl shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
                                    <div className={`p-4 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                        <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Position</label>
                                        <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-black'}`}>
                                            {profile.isMainAdmin ? "Main Admin" : (profile.position || "N/A")}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-[2.5px] bg-gradient-to-tr from-fuchsia-500 to-pink-500 rounded-2xl shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
                                    <div className={`p-4 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                        <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Department</label>
                                        <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-black'}`}>
                                            {profile.isMainAdmin ? "Server" : (profile.department || "N/A")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Level 2: Connect Icons (Phone, WhatsApp, LinkedIn) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Phone */}
                            <div className="p-[2.5px] bg-gradient-to-tr from-green-500 to-teal-500 rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group">
                                <div className={`p-3 sm:p-5 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center transition-all ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Phone Number</label>
                                    <div className="flex items-center gap-2">
                                        {shouldHidePrivateFields ? (
                                            <span className={`text-sm sm:text-base font-black italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Hidden for privacy</span>
                                        ) : (
                                            <>
                                                <span className={`text-sm sm:text-base font-black ${darkMode ? 'text-white' : 'text-black'}`}>{profile.phone || "N/A"}</span>
                                                {profile.phone && (
                                                    <button onClick={() => copyToClipboard(profile.phone, "phone")} className="text-green-300 hover:text-green-600">
                                                        {copied === "phone" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="p-[2.5px] bg-gradient-to-tr from-emerald-500 to-green-500 rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group">
                                <div className={`p-3 sm:p-5 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center transition-all ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>WhatsApp Direct</label>
                                    {shouldHidePrivateFields ? (
                                        <span className={`text-base font-bold italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Hidden for privacy</span>
                                    ) : profile.whatsapp ? (
                                        <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={`font-black text-base hover:underline ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>{profile.whatsapp}</a>
                                    ) : <span className={`text-base font-bold italic ${darkMode ? 'text-gray-500' : 'text-gray-300'}`}>None</span>}
                                </div>
                            </div>

                            {/* LinkedIn */}
                            <div className="p-[2.5px] bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group">
                                <div className={`p-3 sm:p-5 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center transition-all ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Professional LinkedIn</label>
                                    {profile.linkedin ? (
                                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={`font-black text-base hover:underline italic ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>Connect Now →</a>
                                    ) : <span className={`text-base font-bold italic ${darkMode ? 'text-gray-500' : 'text-gray-300'}`}>None</span>}
                                </div>
                            </div>
                        </div>
                        
                        {/* Level 3: Address */}
                        <div className="p-[2.5px] bg-gradient-to-tr from-orange-500 to-red-500 rounded-2xl shadow-lg transition-all duration-300 w-full hover:scale-[1.02] hover:shadow-xl group">
                            <div className={`p-4 rounded-[calc(1rem-2.5px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800' : 'bg-[#FAFAFA]'}`}>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Resident Address</label>
                                {shouldHidePrivateFields ? (
                                    <span className={`text-sm font-bold italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Hidden for privacy</span>
                                ) : (
                                    <span className={`text-sm font-bold leading-tight ${darkMode ? 'text-white' : 'text-black'}`}>{profile.address || "Not set"}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] -mx-4 sm:-mx-6 mt-4 sm:mt-6 flex flex-col items-center">
                        {/* Gradient Divider */}
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mb-2"></div>
                        
                        {/* Mutual Connections Block */}
                        {isPublicView && profile.mutualConnections?.length > 0 && (
                            <div className="w-full px-6 mb-4">
                                <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-md hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                                    <div className={`p-4 rounded-[calc(0.75rem-2.5px)] flex items-center justify-between ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-3">
                                                {profile.mutualConnections.slice(0, 3).map((conn, idx) => (
                                                    <div key={conn._id} className={`w-10 h-10 rounded-full border-2 ${darkMode ? 'border-[#121213] bg-slate-700' : 'border-[#FAFAFA] bg-gray-200'} overflow-hidden relative z-[${3 - idx}]`}>
                                                        <img src={conn.profilePicture || "/default-profile.jpg"} alt={conn.name} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                                {profile.mutualConnections.length > 3 && (
                                                    <div className={`w-10 h-10 rounded-full border-2 ${darkMode ? 'border-[#121213] bg-slate-700 text-white' : 'border-[#FAFAFA] bg-gray-200 text-black'} flex items-center justify-center text-xs font-bold z-0`}>
                                                        +{profile.mutualConnections.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                                                    {profile.mutualConnections.length} Mutual Connection{profile.mutualConnections.length > 1 ? 's' : ''}
                                                </p>
                                                <p className={`text-xs ${darkMode ? 'text-white' : 'text-black'}`}>
                                                    You both know {profile.mutualConnections.slice(0, 2).map(c => c.name?.split(' ')[0]).join(' and ')}
                                                    {profile.mutualConnections.length > 2 ? ' and others' : ''}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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

                {/* QR Code Modal */}
                <QrCodeModal
                    isOpen={showQrModal}
                    onClose={() => setShowQrModal(false)}
                    publicId={profile.publicId}
                    name={profile.name}
                />
            </div>
        </div>
    );
}

