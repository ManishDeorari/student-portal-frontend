"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { FaTimes, FaSearch } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Image from "next/image";
import GroupImageCropperModal from "./GroupImageCropperModal";
import { resizeImage } from "./groupImageUtils";
import GroupAvatar from "../GroupAvatar";

export default function EditGroupModal({ isOpen, onClose, onUpdate, group, onRemoveMember, onDeleteGroup, currentUser }) {
    const { darkMode } = useTheme();
    const [name, setName] = useState(group?.name || "");
    const [description, setDescription] = useState(group?.description || "");
    const [allowFacultyMessaging, setAllowFacultyMessaging] = useState(group?.allowFacultyMessaging ?? false);
    const [allowStudentMessaging, setAllowStudentMessaging] = useState(group?.allowStudentMessaging ?? false);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageSettings, setProfileImageSettings] = useState(group?.profileImageSettings || { x: 0, y: 0, zoom: 1, width: 100, height: 100 });
    const [imagePreview, setImagePreview] = useState(group?.profileImage || "/default-group.jpg");
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    const isAdmin = currentUser?.isAdmin || currentUser?.role === "admin" || group?.admin?._id === currentUser?._id;
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (group) {
            setName(group.name || "");
            setDescription(group.description || "");
            setAllowFacultyMessaging(group.allowFacultyMessaging ?? false);
            setAllowStudentMessaging(group.allowStudentMessaging ?? false);
            setImagePreview(group.profileImage || "/default-group.jpg");
            setProfileImageSettings(group.profileImageSettings || { x: 0, y: 0, zoom: 1, width: 100, height: 100 });
        }
    }, [group]);

    if (!isOpen || !group) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            try {
                // Resize for faster upload (max 1600px is enough for viewer)
                const resizedFile = await resizeImage(file, 1600);
                setProfileImage(resizedFile);
                setTempImage(URL.createObjectURL(resizedFile));
                setShowCropper(true);
            } catch (err) {
                console.error("Image processing error:", err);
                toast.error("Error processing image");
            } finally {
                setUploading(false);
                e.target.value = null; // reset for same-file re-selection
            }
        }
    };

    const handleCropComplete = (blob, url, settings) => {
        setProfileImageSettings(settings);
        setImagePreview(tempImage);
        setShowCropper(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        let finalImageUrl = group.profileImage;
        let finalPublicId = group.profileImagePublicId;

        if (profileImage) {
            try {
                const formData = new FormData();
                formData.append("file", profileImage);
                formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
                
                const res = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, {
                    method: "POST",
                    body: formData
                });
                const data = await res.json();
                if (data.secure_url) {
                    finalImageUrl = data.secure_url;
                    finalPublicId = data.public_id;
                }
            } catch (err) {
                console.error("Upload error:", err);
                toast.error("Failed to upload image");
            }
        }

        onUpdate(group._id, { 
            name, 
            description, 
            allowFacultyMessaging: allowFacultyMessaging,
            allowStudentMessaging: allowStudentMessaging,
            profileImage: finalImageUrl,
            profileImagePublicId: finalPublicId,
            profileImageSettings,
            oldImageUrl: group.profileImage
        });
        setUploading(false);
    };

    const handleDeletePhoto = async () => {
        if (window.confirm("Are you sure you want to remove the group profile photo?")) {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/groups/${group._id}/image`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setImagePreview("/default-group.jpg");
                    setProfileImage(null);
                    toast.success("Group photo removed");
                    if (onUpdate) onUpdate(group._id, data.group);
                }
            } catch (err) {
                console.error("Photo deletion error:", err);
                toast.error("Failed to delete group photo");
            }
        }
    };

    const handleRemoveBulk = async (role) => {
        if (!window.confirm(`Are you sure you want to remove ALL ${role} members from this group?`)) return;
        
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/groups/${group._id}/remove-role`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ role })
            });

            if (res.ok) {
                const updatedGroup = await res.json();
                toast.success(`All ${role} members removed`);
                if (onUpdate) onUpdate(group._id, updatedGroup);
            } else {
                const error = await res.json();
                toast.error(error.message || "Failed to remove members");
            }
        } catch (err) {
            console.error("Bulk removal error:", err);
            toast.error("Network error during bulk removal");
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="relative w-full max-w-xl p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95dvh] sm:max-h-[90vh]">
                    <div className={`relative w-full rounded-[calc(2.5rem-2.5px)] overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? "bg-black" : "bg-white"}`}>
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className={`text-2xl font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>Group Settings</h2>
                                <button onClick={onClose} className={`p-2 rounded-full transition-colors ${darkMode ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-900"}`}>
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-7">
                            <div className="flex flex-col items-center mb-4">
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    className="relative w-28 h-28 p-[2px] bg-gradient-to-tr from-blue-500 to-pink-500 rounded-[2.5rem] shadow-xl cursor-pointer hover:scale-105 transition-all group"
                                >
                                    <div className={`w-full h-full rounded-[calc(2.5rem-2px)] flex items-center justify-center overflow-hidden ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
                                        <GroupAvatar 
                                            group={{ 
                                                profileImage: imagePreview, 
                                                profileImageSettings, 
                                                name 
                                            }} 
                                            size={112} 
                                        />
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] uppercase font-black tracking-widest gap-2 rounded-[2.5rem]">
                                        <span>Change</span>
                                    </div>
                                </div>
                                
                                {imagePreview && !imagePreview.includes("default-group.jpg") && (
                                    <button
                                        type="button"
                                        onClick={handleDeletePhoto}
                                        className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-400 transition-colors underline underline-offset-4 decoration-red-500/30"
                                    >
                                        Delete Photo
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className={`block text-[11px] font-black uppercase tracking-[0.2em] mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>Group Primary Name</label>
                                <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500">
                                    <input
                                        required
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`w-full rounded-[calc(1rem-1.5px)] px-6 py-4 font-black text-sm outline-none transition-all ${darkMode ? "bg-slate-950 text-white focus:bg-black" : "bg-white text-slate-900 focus:bg-slate-50"}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-[11px] font-black uppercase tracking-[0.2em] mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>Brief Description</label>
                                <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500">
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className={`w-full rounded-[calc(1rem-1.5px)] px-6 py-4 font-black text-sm outline-none resize-none h-24 transition-all ${darkMode ? "bg-slate-950 text-white focus:bg-black" : "bg-white text-slate-900 focus:bg-slate-50"}`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-[1.5px] rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg">
                                    <div className={`p-5 rounded-[calc(1.5rem-1.5px)] flex flex-col items-center justify-between gap-3 h-full transition-all ${darkMode ? "bg-slate-950" : "bg-white"}`}>
                                        <div className="text-center">
                                            <h3 className={`font-black text-[10px] uppercase tracking-tighter ${darkMode ? "text-white" : "text-slate-900"}`}>Faculty Messaging</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setAllowFacultyMessaging(!allowFacultyMessaging)}
                                            className={`w-14 h-8 rounded-full relative transition-all duration-500 shadow-inner ${allowFacultyMessaging ? "bg-blue-600" : "bg-slate-800"}`}
                                        >
                                            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-xl transition-all duration-500 ${allowFacultyMessaging ? "right-1" : "left-1"}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-[1.5px] rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-lg">
                                    <div className={`p-5 rounded-[calc(1.5rem-1.5px)] flex flex-col items-center justify-between gap-3 h-full transition-all ${darkMode ? "bg-slate-950" : "bg-white"}`}>
                                        <div className="text-center">
                                            <h3 className={`font-black text-[10px] uppercase tracking-tighter ${darkMode ? "text-white" : "text-slate-900"}`}>Student Messaging</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setAllowStudentMessaging(!allowStudentMessaging)}
                                            className={`w-14 h-8 rounded-full relative transition-all duration-500 shadow-inner ${allowStudentMessaging ? "bg-blue-600" : "bg-slate-800"}`}
                                        >
                                            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-xl transition-all duration-500 ${allowStudentMessaging ? "right-1" : "left-1"}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Remove Members Section */}
                            <div className="space-y-6">
                                <div className="flex flex-col gap-4 px-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className={`font-black text-[12px] uppercase tracking-[0.3em] ${darkMode ? "text-white" : "text-slate-900"}`}>Remove Members</h3>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Filter by Role</span>
                                            <div className="p-[1.5px] rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                                                <select
                                                    value={roleFilter}
                                                    onChange={(e) => setRoleFilter(e.target.value)}
                                                    className={`bg-transparent outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer px-3 py-1 rounded-[calc(0.75rem-1.5px)] h-8 ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}
                                                >
                                                    <option value="ALL">ALL ROLES</option>
                                                    <option value="STUDENT">STUDENT</option>
                                                    <option value="FACULTY">FACULTY</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1 p-[1.5px] rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 shadow-lg shadow-purple-500/20">
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveBulk("faculty")}
                                                className={`w-full py-3 rounded-[calc(1rem-1.5px)] text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 ${darkMode ? "bg-black text-purple-400 hover:bg-purple-900/20" : "bg-white text-purple-600 hover:bg-purple-50"}`}
                                            >
                                                <span>Bulk Faculty</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                            </button>
                                        </div>

                                        <div className="flex-1 p-[1.5px] rounded-2xl bg-gradient-to-br from-blue-500 to-blue-800 shadow-lg shadow-blue-500/20">
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveBulk("student")}
                                                className={`w-full py-3 rounded-[calc(1rem-1.5px)] text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 ${darkMode ? "bg-black text-blue-400 hover:bg-blue-900/20" : "bg-white text-blue-600 hover:bg-blue-50"}`}
                                            >
                                                <span>Bulk Student</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/10">
                                    <div className={`flex items-center gap-3 px-6 py-5 rounded-[calc(1rem-1.5px)] transition-all ${darkMode ? "bg-black" : "bg-white"}`}>
                                        <FaSearch className="text-blue-500" size={14} />
                                        <input 
                                            type="text" 
                                            placeholder="Search members to remove..." 
                                            className={`bg-transparent border-none outline-none w-full text-xs font-black uppercase tracking-widest ${darkMode ? "text-white" : "text-slate-900"}`}
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="max-h-[250px] overflow-y-auto pr-3 custom-scrollbar space-y-4">
                                    {group.members?.filter(m => {
                                        if (!m) return false;
                                        const mIsAdmin = m.role === 'admin' || m.isAdmin || String(m._id) === String(group.admin?._id);
                                        const matchesSearch = (m.name || "").toLowerCase().includes(memberSearch.toLowerCase()) || 
                                                             (m.enrollmentNumber || m.employeeId || "").toLowerCase().includes(memberSearch.toLowerCase());
                                        const matchesRole = roleFilter === "ALL" || (m.role || "student").toUpperCase() === roleFilter;
                                        return !mIsAdmin && matchesSearch && matchesRole;
                                    }).map(member => (
                                        <div key={member._id} className="p-[1.5px] rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 transition-all hover:scale-[1.01] hover:shadow-xl group">
                                            <div className={`p-4 rounded-[calc(1.5rem-1.5px)] flex items-center justify-between transition-all ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
                                                <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                                                    <div className="p-[2px] rounded-2xl bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-400 shadow-lg">
                                                        <div className="relative w-12 h-12 rounded-[calc(1rem-2.5px)] overflow-hidden bg-slate-800">
                                                            <Image src={member.profilePicture || "/default-profile.jpg"} width={48} height={48} className="object-cover" alt={member.name} />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className={`text-[13px] sm:text-[15px] font-black tracking-tight truncate ${darkMode ? "text-white" : "text-slate-900"}`}>{member.name}</span>
                                                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                                                                member.role === 'admin' ? 'bg-yellow-500/20 text-yellow-500' : 
                                                                member.role === 'faculty' ? 'bg-purple-500/20 text-purple-500' : 
                                                                'bg-blue-500/20 text-blue-500'
                                                            }`}>
                                                                {member.role || 'student'}
                                                            </span>
                                                        </div>
                                                        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] mt-1 truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                                            {member.role === 'faculty' ? member.employeeId : (member.enrollmentNumber || "Student")}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => onRemoveMember(member._id)}
                                                    className="shrink-0 px-3 sm:px-5 py-2 rounded-xl bg-red-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.2em] shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delete Group Button (Danger Zone) */}
                            {isAdmin && (
                                <div className="pt-6 border-t border-slate-800">
                                    <div className="p-[2px] rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 shadow-lg shadow-red-500/20">
                                        <button 
                                            type="button"
                                            onClick={() => onDeleteGroup(group._id)}
                                            className={`w-full py-5 rounded-[calc(1rem-2px)] font-black text-[11px] uppercase tracking-[0.3em] transition-all ${darkMode ? "bg-black text-red-500 hover:bg-red-600 hover:text-white" : "bg-white text-red-600 hover:bg-red-600 hover:text-white"}`}
                                        >
                                            Delete Group Permanently
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={uploading || (!name.trim())}
                                className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                {uploading ? "Updating System..." : "Save Changes"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

            <GroupImageCropperModal 
                isOpen={showCropper}
                imageSrc={tempImage}
                onComplete={handleCropComplete}
                onClose={() => setShowCropper(false)}
            />
        </>
    );
}
