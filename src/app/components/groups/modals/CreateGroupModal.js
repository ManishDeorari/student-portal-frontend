"use client";
import React, { useState, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { FaTimes, FaCamera, FaUsers, FaPlus } from "react-icons/fa";
import MemberSearchModal from "./MemberSearchModal";
import GroupImageCropperModal from "./GroupImageCropperModal";
import { resizeImage } from "./groupImageUtils";
import { toast } from "react-hot-toast";

export default function CreateGroupModal({ isOpen, onClose, onCreate }) {
    const { darkMode } = useTheme();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isAllAlumni, setIsAllAlumni] = useState(false);
    const [isAllFaculty, setIsAllFaculty] = useState(false);
    const [allowFacultyMessaging, setAllowFacultyMessaging] = useState(false);
    const [allowAlumniMessaging, setAllowAlumniMessaging] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageSettings, setProfileImageSettings] = useState({ x: 0, y: 0, zoom: 1, width: 100, height: 100 });
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedMemberIds, setSelectedMemberIds] = useState([]);
    const [showMemberSearch, setShowMemberSearch] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

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
                e.target.value = null; // Reset for same-file re-selection
            }
        }
    };

    const handleCropComplete = (blob, url, settings) => {
        // We ignore blob/url here because we want the original (resized) file
        setProfileImageSettings(settings);
        setImagePreview(tempImage); // Use the original preview
        setShowCropper(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        let finalImageUrl = "/default-group.jpg";
        let finalPublicId = null;

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
                toast.error("Failed to upload group image");
            }
        }

        onCreate({ 
            name, 
            description, 
            isAllAlumniGroup: isAllAlumni,
            isAllFacultyGroup: isAllFaculty,
            profileImage: finalImageUrl,
            profileImagePublicId: finalPublicId,
            profileImageSettings,
            allowFacultyMessaging,
            allowAlumniMessaging,
            members: selectedMemberIds 
        });

        // Reset
        setName("");
        setDescription("");
        setIsAllAlumni(false);
        setIsAllFaculty(false);
        setProfileImage(null);
        setImagePreview(null);
        setAllowFacultyMessaging(false);
        setAllowAlumniMessaging(true);
        setSelectedMemberIds([]);
        setUploading(false);
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="relative w-full max-w-xl p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95dvh] sm:max-h-[90vh]">
                    <div className={`relative w-full rounded-[calc(2.5rem-2.5px)] overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? "bg-black" : "bg-white"}`}>
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className={`text-2xl font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>Create Group</h2>
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
                                        <div className={`w-full h-full rounded-[calc(2.5rem-2px)] flex items-center justify-center overflow-hidden ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
                                            {imagePreview ? (
                                                <img src={imagePreview} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Preview" />
                                            ) : (
                                                <FaCamera size={32} className="text-blue-500 animate-pulse" />
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] uppercase font-black tracking-widest rounded-[2.5rem]">
                                            Change
                                        </div>
                                    </div>
                                    <span className={`text-[10px] uppercase font-black tracking-widest mt-4 italic ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Group Identity Picture</span>
                                </div>

                                <div>
                                    <label className={`block text-[11px] font-black uppercase tracking-[0.2em] mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>Group Primary Name</label>
                                    <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm">
                                        <input
                                            required
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className={`w-full rounded-[calc(1rem-1.5px)] px-6 py-4 font-black text-sm outline-none transition-all ${darkMode ? "bg-slate-950 text-white focus:bg-black" : "bg-white text-slate-900 focus:bg-slate-50"}`}
                                            placeholder="Mech Engineering 2024..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-[11px] font-black uppercase tracking-[0.2em] mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>Brief Description</label>
                                    <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm">
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className={`w-full rounded-[calc(1rem-1.5px)] px-6 py-4 font-black text-sm outline-none resize-none h-24 transition-all ${darkMode ? "bg-slate-950 text-white focus:bg-black" : "bg-white text-slate-900 focus:bg-slate-50"}`}
                                            placeholder="Describe the purpose of this alumni circle..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className={`block text-[11px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"}`}>Group Membership</label>

                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsAllFaculty(!isAllFaculty)}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 group relative overflow-hidden ${isAllFaculty
                                                ? "bg-gradient-to-br from-purple-600 to-purple-800 border-purple-400 text-white shadow-lg shadow-purple-500/40"
                                                : (darkMode ? "bg-slate-950 border-slate-800 text-white hover:border-purple-500" : "bg-white border-slate-200 text-slate-900 hover:border-purple-500")
                                                }`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest relative z-10">Add All Faculty</span>
                                            {isAllFaculty && <span className="text-[8px] font-black relative z-10">ACTIVE ✨</span>}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setIsAllAlumni(!isAllAlumni)}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 group relative overflow-hidden ${isAllAlumni
                                                ? "bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400 text-white shadow-lg shadow-blue-500/40"
                                                : (darkMode ? "bg-slate-950 border-slate-800 text-white hover:border-blue-500" : "bg-white border-slate-200 text-slate-900 hover:border-blue-500")
                                                }`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest relative z-10">Add All Alumni</span>
                                            {isAllAlumni && <span className="text-[8px] font-black relative z-10">ACTIVE ✨</span>}
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4 pt-4">
                                        <label className={`block text-[11px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"}`}>Messaging Logic</label>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg">
                                                <div className={`p-4 rounded-[calc(1rem-1.5px)] flex flex-col items-center justify-between gap-3 h-full transition-all ${darkMode ? "bg-slate-950" : "bg-white"}`}>
                                                    <div className="text-center">
                                                        <h3 className={`font-black text-[9px] uppercase tracking-tighter ${darkMode ? "text-white" : "text-slate-900"}`}>Faculty Message</h3>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setAllowFacultyMessaging(!allowFacultyMessaging)}
                                                        className={`w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner ${allowFacultyMessaging ? "bg-blue-600" : "bg-slate-800"}`}
                                                    >
                                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${allowFacultyMessaging ? "right-1" : "left-1"}`} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-lg">
                                                <div className={`p-4 rounded-[calc(1rem-1.5px)] flex flex-col items-center justify-between gap-3 h-full transition-all ${darkMode ? "bg-slate-950" : "bg-white"}`}>
                                                    <div className="text-center">
                                                        <h3 className={`font-black text-[9px] uppercase tracking-tighter ${darkMode ? "text-white" : "text-slate-900"}`}>Alumni Message</h3>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setAllowAlumniMessaging(!allowAlumniMessaging)}
                                                        className={`w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner ${allowAlumniMessaging ? "bg-blue-600" : "bg-slate-800"}`}
                                                    >
                                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${allowAlumniMessaging ? "right-1" : "left-1"}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg">
                                        <button
                                            type="button"
                                            onClick={() => setShowMemberSearch(true)}
                                            className={`w-full p-5 rounded-[calc(1rem-1.5px)] flex items-center justify-between transition-all ${darkMode ? "bg-slate-950 text-white" : "bg-white text-slate-900 hover:bg-slate-50"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <FaPlus size={12} className="text-blue-500" />
                                                <span className="text-[11px] font-black uppercase tracking-widest">Select Individual Members</span>
                                            </div>
                                            {selectedMemberIds.length > 0 && (
                                                <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] animate-in zoom-in">
                                                    {selectedMemberIds.length} Selected
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading || (!name.trim())}
                                    className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                                >
                                    {uploading ? "Configuring Group..." : "Initialize Group"}
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

            <MemberSearchModal 
                isOpen={showMemberSearch}
                onClose={() => setShowMemberSearch(false)}
                onSelect={(ids) => setSelectedMemberIds(ids)}
                selectedMemberIds={selectedMemberIds}
            />
        </>
    );
}
