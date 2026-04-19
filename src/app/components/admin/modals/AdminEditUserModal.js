"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, User as UserIcon, BookOpen, Hash, Briefcase, Building } from "lucide-react";
import { toast } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminEditUserModal({ isOpen, onClose, user, onUpdate, darkMode }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        semester: "",
        course: "",
        position: "",
        department: "",
        enrollmentNumber: "",
        employeeId: "",
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                semester: user.semester || "",
                course: user.course || "",
                position: user.position || "",
                department: user.department || "",
                enrollmentNumber: user.enrollmentNumber || "",
                employeeId: user.employeeId || "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === "course") value = value.toUpperCase();
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API}/api/admin/update-user/${user._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update user");

            toast.success("User updated successfully");
            onUpdate();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Update failed");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative p-[2px] bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={`relative ${darkMode ? "bg-black" : "bg-white"} rounded-[calc(2.5rem-2px)] p-6 sm:p-10 h-full w-full`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                    <UserIcon className="w-7 h-7 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"} leading-none`}>Edit User Profile</h3>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                                        Admin Control: {user.role}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className={`p-3 rounded-full hover:bg-gray-100/10 transition-all ${darkMode ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-900"}`}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Basic Info Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${darkMode ? "text-white/50" : "text-slate-500"}`}>Full Name</label>
                                    <div className={`p-[1.5px] bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl`}>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-[calc(0.75rem-1.5px)] outline-none text-sm font-bold ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${darkMode ? "text-white/50" : "text-slate-500"}`}>Email Address</label>
                                    <div className={`p-[1.5px] bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl`}>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-[calc(0.75rem-1.5px)] outline-none text-sm font-bold ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Role Specific Fields */}
                            {user.role === "student" ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${darkMode ? "text-white/50" : "text-slate-500"}`}>Course</label>
                                            <div className="p-[1.5px] bg-gradient-to-tr from-pink-500 to-rose-600 rounded-xl">
                                                <input
                                                    type="text"
                                                    name="course"
                                                    value={formData.course}
                                                    onChange={handleChange}
                                                    placeholder="e.g., MCA"
                                                    className={`w-full p-3 rounded-[calc(0.75rem-1.5px)] outline-none text-sm font-bold ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${darkMode ? "text-white/50" : "text-slate-500"}`}>Semester (1-10)</label>
                                            <div className="p-[1.5px] bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl">
                                                <input
                                                    type="number"
                                                    name="semester"
                                                    min="1"
                                                    max="10"
                                                    value={formData.semester}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 rounded-[calc(0.75rem-1.5px)] outline-none text-sm font-bold ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${darkMode ? "text-white/50" : "text-slate-500"}`}>Enrollment Number</label>
                                        <div className="p-[1.5px] bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl">
                                            <input
                                                type="text"
                                                name="enrollmentNumber"
                                                value={formData.enrollmentNumber}
                                                onChange={handleChange}
                                                className={`w-full p-3 rounded-[calc(0.75rem-1.5px)] outline-none text-sm font-bold ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${darkMode ? "text-white/50" : "text-slate-500"}`}>Position</label>
                                            <div className="p-[1.5px] bg-gradient-to-tr from-violet-500 to-purple-600 rounded-xl">
                                                <input
                                                    type="text"
                                                    name="position"
                                                    value={formData.position}
                                                    onChange={handleChange}
                                                    placeholder="Assistant Professor"
                                                    className={`w-full p-3 rounded-[calc(0.75rem-1.5px)] outline-none text-sm font-bold ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${darkMode ? "text-white/50" : "text-slate-500"}`}>Department</label>
                                            <div className="p-[1.5px] bg-gradient-to-tr from-fuchsia-500 to-pink-600 rounded-xl">
                                                <input
                                                    type="text"
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleChange}
                                                    placeholder="CS"
                                                    className={`w-full p-3 rounded-[calc(0.75rem-1.5px)] outline-none text-sm font-bold ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${darkMode ? "text-white/50" : "text-slate-500"}`}>Employee ID</label>
                                        <div className="p-[1.5px] bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl">
                                            <input
                                                type="text"
                                                name="employeeId"
                                                value={formData.employeeId}
                                                onChange={handleChange}
                                                className={`w-full p-3 rounded-[calc(0.75rem-1.5px)] outline-none text-sm font-bold ${darkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.3em] transition-all bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_15px_30px_rgba(37,99,235,0.3)] active:scale-95 ${isSaving ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
