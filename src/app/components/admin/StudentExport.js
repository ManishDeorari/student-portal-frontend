"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import HybridInput from "../ui/HybridInput";
import { useTheme } from "@/context/ThemeContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const COURSE_OPTIONS = ["B.Tech", "M.Tech", "MBA", "BCA", "MCA"];
const currentYearForDropdown = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYearForDropdown + 5 - 2000 + 1 }, (_, i) => String(2000 + i));

export default function StudentExport() {
    const { darkMode } = useTheme();
    const [student, setStudent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        course: "",
        semester: "",
        section: ""
    });

    const getToken = () => localStorage.getItem("token");

    const handleSearch = async () => {
        setLoading(true);
        try {
            let url = `${API}/api/admin/export-student?query=${searchQuery}`;
            if (filters.course) url += `&course=${filters.course}`;
            if (filters.semester) url += `&semester=${filters.semester}`;
            if (filters.section) url += `&section=${filters.section}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Search failed");
            setStudent(data || []);
            if (data.length === 0) toast.error("No student found with these filters");
            else toast.success(`Found ${data.length} student`);
        } catch (err) {
            console.error("Search error:", err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadExcel = async () => {
        if (student.length === 0) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Student Data");

        // Row 1: Group Headers
        const r1 = [
            "", "", "", "", "", "CURRENT COURSE", "", "", "ADDRESS", "", "", "EDUCATION",
            ...Array(17).fill(""), // Spanning Education
            "EXPERIENCE"
        ];

        // Row 2: Sub-Groups
        const r2 = [
            "", "", "", "", "", "", "", "", "", "", "", "High School", "", "", "Intermediate", "", "", "Undergraduate", "", "", "", "", "", "Postgraduate", "", "", "", "", "", ""
        ];

        // Row 3: Column Names
        const r3 = [
            "S.No", "ID", "Enrollment No", "Name", "Linkedin URL", "Course", "Semester", "Section", "City", "State", "Country", "Phone",
            "School Name", "Passing Year", "Grades/%",
            "School Name", "Passing Year", "Grades/%",
            "College Name", "Campus", "Course", "Start Year", "End Year", "Grades/%",
            "College Name", "Campus", "Course", "Start Year", "End Year", "Grades/%",
            "Recent Role", "Company", "Duration"
        ];

        worksheet.addRow(r1);
        worksheet.addRow(r2);
        worksheet.addRow(r3);

        // Merging for Group Headers
        worksheet.mergeCells('F1:H2'); // Current Course (Merged F,G,H across Row 1 and 2)
        worksheet.mergeCells('I1:K2'); // Address (Merged I,J,K across Row 1 and 2)
        
        // Fix r1 indices for ADDRESS, EDUCATION, etc. (They shifted)
        // Note: r1 is just for visual structure, mergeCells does the heavy lifting.

        const MANDATORY_DEGREES = [
            "High School (Secondary - Class 10)",
            "Intermediate (Higher Secondary - Class 12)",
            "Undergraduate (Bachelor's Degree)",
            "Postgraduate (Master's Degree)"
        ];

        const formatPhone = (phone) => {
            if (!phone || phone === "N/A") return "N/A";
            let cleaned = String(phone).replace(/\D/g, "");
            if (cleaned.startsWith("91") && cleaned.length === 12) {
                return `+91 ${cleaned.substring(2)}`;
            }
            if (cleaned.length === 10) {
                return `+91 ${cleaned}`;
            }
            return phone.startsWith("+") ? phone : `+${cleaned}`;
        };

        student.forEach((u, index) => {
            const getEdu = (degreeName) => (u.education || []).find(e => e.degree === degreeName) || {};

            const hs = getEdu(MANDATORY_DEGREES[0]);
            const inter = getEdu(MANDATORY_DEGREES[1]);
            const ug = getEdu(MANDATORY_DEGREES[2]);
            const pg = getEdu(MANDATORY_DEGREES[3]);

            let recentExp = (u.experience || []).find(e => !e.endDate || e.endDate.toLowerCase().includes("present") || e.endDate.toLowerCase().includes("current"));
            if (!recentExp && u.experience?.length > 0) {
                recentExp = [...u.experience].sort((a, b) => {
                    const yearA = parseInt(a.endDate?.split(" ").pop()) || 0;
                    const yearB = parseInt(b.endDate?.split(" ").pop()) || 0;
                    return yearB - yearA;
                })[0];
            }
            recentExp = recentExp || {};

            const addrParts = (u.address || "").split(",").map(p => p.trim());
            const city = addrParts[0] || "N/A";
            const state = addrParts[1] || "N/A";
            const country = addrParts[2] || "N/A";

            // Format plain text values for Excel
            const publicIdText = u.publicId ? `@${u.publicId}` : "N/A";
            const linkedinText = u.linkedin && u.linkedin.startsWith("http") ? u.linkedin : 
                                u.linkedin ? `https://linkedin.com/in/${u.linkedin.replace(/[^a-zA-Z0-9-]/g, '')}` : "N/A";

            worksheet.addRow([
                index + 1,
                publicIdText,
                u.enrollmentNumber || "N/A",
                u.name,
                linkedinText,
                u.course || "N/A",
                u.semester || "N/A",
                u.section || "N/A",
                city, state, country,
                formatPhone(u.phone),
                hs.institution || "NA", hs.endDate?.split(" ").pop() || "NA", hs.grade || "NA",
                inter.institution || "NA", inter.endDate?.split(" ").pop() || "NA", inter.grade || "NA",
                ug.institution || "NA", ug.campus || "NA", ug.course || ug.fieldOfStudy || "NA", ug.startDate?.split(" ").pop() || "NA", ug.endDate?.split(" ").pop() || "NA", ug.grade || "NA",
                pg.institution || "NA", pg.campus || "NA", pg.course || pg.fieldOfStudy || "NA", pg.startDate?.split(" ").pop() || "NA", pg.endDate?.split(" ").pop() || "NA", pg.grade || "NA",
                recentExp.title || "NA", recentExp.company || "NA", recentExp.startDate && recentExp.endDate ? `${recentExp.startDate} - ${recentExp.endDate}` : "NA"
            ]);
        });

        // Styling
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                // Center alignment for all cells
                cell.alignment = { vertical: 'middle', horizontal: 'center' };

                // Bold style for headers (Rows 1, 2, 3)
                if (rowNumber <= 3) {
                    cell.font = { bold: true };
                }
            });
        });

        // Set column widths for better readability
        worksheet.columns.forEach(column => {
            column.width = 15;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `student_data_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Excel File Downloaded Successfully");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Search & Filters */}
            <div className={`border-2 ${darkMode ? "bg-black border-white/10" : "bg-white border-gray-100"} rounded-3xl shadow-lg overflow-hidden`}>
                <section className={`p-4 sm:p-8 space-y-3 sm:space-y-8`}>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 border-2 border-gray-200 rounded-xl sm:rounded-2xl">
                            <div className="relative h-full">
                                <input
                                    type="text"
                                    placeholder="Search by name, email, enrollment..."
                                    value={searchQuery}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full pl-10 sm:pl-12 pr-4 py-1.5 sm:py-3.5 text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white" : "bg-white text-black placeholder-slate-400"} rounded-xl sm:rounded-[calc(1rem-2px)] outline-none transition-all font-bold`}
                                />
                                <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? "text-white" : "text-gray-900"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-6 sm:px-10 py-1.5 sm:py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all shadow-lg active:scale-95"
                        >
                            Search Student
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-6">
                        <div className="space-y-2 z-[60]">
                            <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-white" : "text-slate-900"} ml-2 font-black`}>Course</label>
                            <div className="border-2 border-gray-200 rounded-lg sm:rounded-xl relative shadow-sm">
                                <HybridInput
                                    value={filters.course}
                                    onChange={(val) => setFilters({ ...filters, course: val })}
                                    options={COURSE_OPTIONS}
                                    placeholder="All Courses"
                                    uppercase={true}
                                    placement="top"
                                    className={`w-full px-4 py-1.5 sm:py-4 ${darkMode ? "bg-black text-white" : "bg-white text-slate-900 underline-none"} rounded-lg sm:rounded-[calc(0.75rem-2px)] text-[9px] sm:text-[11px] uppercase tracking-wider sm:tracking-[0.2em] outline-none font-black`}
                                />
                            </div>
                        </div>
                        <div className="space-y-2 relative">
                            <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-white" : "text-slate-900"} ml-2 font-black`}>Semester</label>
                            <div className="border-2 border-gray-200 rounded-lg sm:rounded-xl relative shadow-sm">
                                <select
                                    value={filters.semester}
                                    onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                                    className={`w-full px-4 py-1.5 sm:py-[15px] ${darkMode ? "bg-black text-white" : "bg-white text-slate-900 border-none"} rounded-lg sm:rounded-[calc(0.75rem-2px)] text-[9px] sm:text-[11px] uppercase tracking-wider sm:tracking-[0.2em] outline-none font-black appearance-none cursor-pointer`}
                                >
                                    <option value="">All Semesters</option>
                                    {[...Array(10)].map((_, i) => (
                                        <option key={i + 1} value={String(i + 1)}>Semester {i + 1}</option>
                                    ))}
                                </select>
                                <svg className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? "text-blue-400" : "text-gray-900"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                        <div className="space-y-2 relative">
                            <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-white" : "text-slate-900"} ml-2 font-black`}>Section</label>
                            <div className="border-2 border-gray-200 rounded-lg sm:rounded-xl relative shadow-sm">
                                <input
                                    type="text"
                                    placeholder="All Sections"
                                    value={filters.section}
                                    onChange={(e) => setFilters({ ...filters, section: e.target.value.toUpperCase() })}
                                    className={`w-full px-4 py-1.5 sm:py-4 ${darkMode ? "bg-black text-white placeholder-white/30" : "bg-white text-slate-900 border-none"} rounded-lg sm:rounded-[calc(0.75rem-2px)] text-[9px] sm:text-[11px] uppercase tracking-wider sm:tracking-[0.2em] outline-none font-black`}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Results & Export */}
            {student.length > 0 && (
                <div className={`border-2 ${darkMode ? "bg-black border-white/10" : "bg-white border-gray-100"} rounded-3xl shadow-lg overflow-hidden mb-10`}>
                    <section className={`p-4 sm:p-8 space-y-4 sm:space-y-6`}>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-2.5 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.6)]"></div>
                                <h2 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"} tracking-tight`}>Export Preview ({student.length})</h2>
                            </div>
                            <button
                                onClick={downloadExcel}
                                className="px-8 py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download Excel
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Table Headers */}
                            <div className={`hidden md:flex items-center gap-4 px-8 py-4 ${darkMode ? "text-white/60" : "text-slate-500"} text-[10px] uppercase font-black tracking-[0.3em]`}>
                                <div className="w-64">User Profile</div>
                                <div className="flex-1">Academic Details</div>
                                <div className="w-48">Contact Email</div>
                            </div>

                            {/* Student Preview Rows */}
                            {student.slice(0, 10).map((u) => (
                                <div 
                                    key={u._id} 
                                    className={`relative p-[1.5px] rounded-2xl sm:rounded-3xl transition-all hover:scale-[1.01] shadow-xl bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 border border-white/5`}
                                >
                                    <div className={`${darkMode ? "bg-black" : "bg-white"} rounded-[calc(1.5rem-1.5px)] p-3 sm:p-5 flex flex-wrap md:flex-nowrap items-center gap-3 sm:gap-4 relative z-10`}>
                                        {/* Profile Column */}
                                        <div className="w-64 flex items-center gap-3 sm:gap-4 min-w-0">
                                            <div className="relative shrink-0">
                                                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-[2px] opacity-30"></div>
                                                {u.profilePicture ? (
                                                    <img 
                                                        src={u.profilePicture} 
                                                        alt={u.name}
                                                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover relative z-10 border-2 border-white/10"
                                                    />
                                                ) : (
                                                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full relative z-10 ${darkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"} border-2 border-blue-400/20 flex items-center justify-center font-black text-sm sm:text-lg text-blue-500`}>
                                                        {u.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`font-black text-sm sm:text-[15px] ${darkMode ? "text-white" : "text-slate-900"} truncate mb-0.5`}>{u.name}</p>
                                                <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${darkMode ? "text-purple-400" : "text-slate-500"} truncate`}>
                                                    {u.enrollmentNumber || "—"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Academic Column */}
                                        <div className="flex-1 flex flex-wrap items-center gap-2">
                                            <span className={`text-[9px] px-2 py-1 rounded-lg font-black bg-white/5 border ${darkMode ? "border-white/10 text-white/60" : "border-gray-200 text-slate-600"}`}>
                                                {u.course || "NA"}
                                            </span>
                                            <span className={`text-[9px] px-2 py-1 rounded-lg font-black bg-blue-500/10 border border-blue-500/20 text-blue-400`}>
                                                SEM {u.semester || "NA"}
                                            </span>
                                            <span className={`text-[9px] px-2 py-1 rounded-lg font-black bg-purple-500/10 border border-purple-500/20 text-purple-400`}>
                                                SEC {u.section || "NA"}
                                            </span>
                                        </div>

                                        {/* contact Column */}
                                        <div className="w-48 hidden md:block shrink-0">
                                            <p className={`text-[10px] font-black ${darkMode ? "text-white/60 bg-white/5 border-white/10" : "text-slate-900 bg-gray-50 border-gray-200"} px-4 py-2 rounded-xl border truncate`}>
                                                {u.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {student.length > 10 && (
                                <div className={`p-6 text-center rounded-3xl border-2 ${darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}>
                                    <p className={`text-xs ${darkMode ? "text-white" : "text-slate-900"} font-black uppercase tracking-[0.3em] italic`}>
                                        Viewing {Math.min(10, student.length)} of {student.length} results. Download for full dataset.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-white rounded-full animate-spin shadow-2xl"></div>
                    <p className={`${darkMode ? "text-white" : "text-slate-900"} font-black uppercase tracking-[0.4em] text-xs`}>Searching database...</p>
                </div>
            )}
        </div>
    );
}
