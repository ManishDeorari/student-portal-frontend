import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Trash2, Plus, Save, GraduationCap, Calendar, BookOpen, School, Award, Users, ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import HybridInput from "../../ui/HybridInput";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const currentYearForDropdown = new Date().getFullYear();
const YEARS = Array.from({ length: currentYearForDropdown + 5 - 2000 + 1 }, (_, i) => currentYearForDropdown + 5 - i);

const DEGREE_SUGGESTIONS = [
    "High School (Secondary - Class 10)", 
    "Intermediate (Higher Secondary - Class 12)", 
    "Undergraduate (Bachelor's Degree)", 
    "Postgraduate (Master's Degree)", 
    "Diploma", 
    "Doctor of Philosophy (Ph.D)"
];

const COURSE_SUGGESTIONS = [
    "B.Tech", "M.Tech", "MBA", "BCA", "MCA", "B.Sc", "M.Sc", "B.A", "M.A"
];
const BRANCH_SUGGESTIONS = [
    "Computer Science", "Information Technology", "Mechanical Engineering",
    "Civil Engineering", "Electronics and Communication", "Electrical Engineering",
    "Business Administration", "Finance", "Marketing", "HR", "Physics", "Maths"
];

const STUDY_SUGGESTIONS = [
    "Computer Science", "Information Technology", "Mechanical Engineering",
    "Civil Engineering", "Electronics and Communication", "Business Administration",
    "Physics", "Mathematics", "Biology", "Psychology"
];

const INSTITUTION_SUGGESTIONS = [
    "Graphic Era Deemed to be University",
    "Graphic Era Hill University",
    "Indian Institute of Technology (IIT)",
    "National Institute of Technology (NIT)",
    "BITS Pilani",
    "Delhi University",
    "Amity University"
];

const GEHU_CAMPUSES = ["Dehradun", "Bhimtal", "Haldwani"];

const MANDATORY_DEGREES = [
    "High School (Secondary - Class 10)",
    "Intermediate (Higher Secondary - Class 12)",
    "Undergraduate (Bachelor's Degree)",
    "Postgraduate (Master's Degree)"
];

export default function EditEducationModal({ isOpen, onClose, currentEducation, onSave }) {
    const { darkMode } = useTheme();
    const [educations, setEducations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [expandedIndex, setExpandedIndex] = useState(0); // Default first one expanded

    const isEduComplete = (edu) => {
        return edu.institution && edu.degree && edu.startMonth && edu.startYear && edu.endMonth && edu.endYear;
    };

    useEffect(() => {
        if (isOpen) {
            const existingMap = (currentEducation || []).reduce((acc, edu) => {
                const key = edu.level || edu.degree;
                acc[key] = edu;
                return acc;
            }, {});

            const transformed = MANDATORY_DEGREES.map((levelName, idx) => {
                const edu = existingMap[levelName] || {};
                const [sMonth, sYear] = (edu.startDate || "").split(" ");
                const [eMonth, eYear] = (edu.endDate || "").split(" ");

                return {
                    ...edu,
                    level: levelName,
                    degree: edu.degree || levelName, 
                    course: edu.course || "",
                    branch: edu.branch || "",
                    startMonth: sMonth || "",
                    startYear: sYear || "",
                    endMonth: eMonth || "",
                    endYear: eYear || "",
                    institution: edu.institution || "",
                    campus: edu.campus || "",
                    grade: edu.grade || "",
                    activities: edu.activities || "",
                    description: edu.description || "",
                    isMandatory: true,
                    isFixed: true // All 4 mandatory levels (HS, Int, UG, PG) are fixed
                };
            });

            // Add non-mandatory educations
            (currentEducation || []).forEach(edu => {
                if (!MANDATORY_DEGREES.includes(edu.level || edu.degree)) {
                    const [sMonth, sYear] = (edu.startDate || "").split(" ");
                    const [eMonth, eYear] = (edu.endDate || "").split(" ");
                    transformed.push({
                        ...edu,
                        course: edu.course || "",
                        branch: edu.branch || "",
                        startMonth: sMonth || "",
                        startYear: sYear || "",
                        endMonth: eMonth || "",
                        endYear: eYear || "",
                        isMandatory: false
                    });
                }
            });

            setEducations(transformed);
        }
    }, [currentEducation, isOpen]);

    if (!isOpen) return null;

    const handleChange = (index, field, value) => {
        const updated = [...educations];
        updated[index][field] = value;
        setEducations(updated);

        if (errors[`${index}-${field}`]) {
            const newErrors = { ...errors };
            delete newErrors[`${index}-${field}`];
            setErrors(newErrors);
        }
    };

    const addEducation = () => {
        setEducations([
            ...educations,
            {
                degree: "",
                course: "",
                branch: "",
                fieldOfStudy: "",
                institution: "",
                campus: "",
                startMonth: "",
                startYear: "",
                endMonth: "",
                endYear: "",
                grade: "",
                activities: "",
                description: "",
                isMandatory: false
            },
        ]);
    };

    const removeEducation = (index) => {
        setEducations(educations.filter((_, i) => i !== index));
    };

    const validate = () => {
        const newErrors = {};
        educations.forEach((edu, idx) => {
            const hasData = edu.institution || edu.course || edu.startMonth || edu.startYear || edu.endMonth || edu.endYear || edu.grade || edu.activities || edu.description;
            if (hasData || !edu.isMandatory) {
                if (!edu.institution) newErrors[`${idx}-institution`] = `${edu.degree?.includes("High School") || edu.degree?.includes("Intermediate") ? "School" : "College"} name is required`;
                if (!edu.degree) newErrors[`${idx}-degree`] = "Degree is required";
                if (edu.degree && !edu.degree.includes("High School") && !edu.degree.includes("Intermediate") && !edu.course) {
                    newErrors[`${idx}-course`] = "Course is required";
                }
                if (!edu.startMonth || !edu.startYear) newErrors[`${idx}-startDate`] = "Start date required";
                if (!edu.endMonth || !edu.endYear) newErrors[`${idx}-endDate`] = "End date required";
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.error("Please fill in all required fields for the provided educations.");
            return;
        }

        setLoading(true);
        try {
            const validEducations = educations.filter(edu => 
                edu.institution || edu.course || edu.startMonth || edu.startYear || edu.endMonth || edu.endYear || edu.grade || edu.activities || edu.description || !edu.isMandatory
            );

            const finalData = validEducations.map(edu => {
                const startDate = `${edu.startMonth} ${edu.startYear}`;
                const endDate = `${edu.endMonth} ${edu.endYear}`;

                return {
                    level: edu.level,
                    degree: edu.degree,
                    course: edu.course,
                    branch: edu.branch,
                    fieldOfStudy: edu.fieldOfStudy,
                    institution: edu.institution,
                    campus: edu.institution === "Graphic Era Hill University" ? edu.campus : "",
                    location: "", // Explicitly clearing location
                    startDate,
                    endDate,
                    grade: edu.grade,
                    activities: edu.activities,
                    description: edu.description
                };
            });

            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ education: finalData }),
            });

            if (!res.ok) throw new Error("Failed to update education");

            const updatedUser = await res.json();
            onSave(updatedUser);
            toast.success("Education details updated!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating education");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <LoadingOverlay isVisible={loading} />
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-2 md:p-4 animate-fadeIn">
            <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-3xl">
                <div className={`${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} rounded-[calc(1rem-2.5px)] sm:rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden max-h-[95dvh] sm:max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" /> Edit Education
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-[#FAFAFA]/20 p-1 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className={`p-4 md:p-6 space-y-8 overflow-y-auto custom-scrollbar flex-grow ${darkMode ? 'bg-[#121213]' : 'bg-gray-50/30'}`}>
                    <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>* Indicates required</p>

                    <datalist id="degree-list-final">
                        {DEGREE_SUGGESTIONS.map(d => <option key={d} value={d} />)}
                    </datalist>
                    <datalist id="school-list-final">
                        {INSTITUTION_SUGGESTIONS.map(i => <option key={i} value={i} />)}
                    </datalist>
                    <datalist id="study-list">
                        {STUDY_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                    </datalist>

                    {educations.map((edu, index) => (
                        <div key={index} className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_10px_30px_rgba(37,99,235,0.2)] transition-all duration-300">
                            <div className={`${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} rounded-[calc(2.5rem-2.5px)] overflow-hidden shadow-2xl`}>
                                {/* Header Section */}
                                <div
                                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                    className={`p-5 flex items-center justify-between cursor-pointer select-none border-b border-dashed ${darkMode ? 'border-white/10' : 'border-gray-200'} ${expandedIndex === index ? (darkMode ? 'bg-blue-600/10' : 'bg-blue-50/50') : ''}`}
                                >
                                <div className="flex items-center gap-3">
                                    <div className="text-blue-500 transition-transform duration-300">
                                        {expandedIndex === index ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                    </div>
                                    <h3 className={`font-black uppercase tracking-tight text-sm ${expandedIndex === index ? 'text-blue-500' : (darkMode ? 'text-slate-300' : 'text-gray-700')}`}>
                                        {edu.degree || "New Education Level"}
                                    </h3>
                                    {isEduComplete(edu) ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : edu.isMandatory ? (
                                        <Circle className={`w-4 h-4 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                                    ) : null}
                                </div>
                                <div className="flex items-center gap-2">
                                    {edu.isFixed && expandedIndex !== index && (
                                        <span className="text-[10px] text-blue-500 font-bold uppercase mr-2">Mandatory</span>
                                    )}
                                    {edu.isMandatory && !edu.isFixed && expandedIndex !== index && (
                                        <span className="text-[10px] text-purple-500 font-bold uppercase mr-2">Required</span>
                                    )}
                                    {!edu.isMandatory && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeEducation(index);
                                            }}
                                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-500/10 rounded-full transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className={`transition-all duration-300 overflow-hidden ${expandedIndex === index ? 'max-h-[1500px] opacity-100 p-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <div className="space-y-6">
                                    {/* School */}
                                    <div className="space-y-1.5">
                                        <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-institution`] ? 'text-red-500' : (darkMode ? 'text-blue-400' : 'text-blue-600')}`}>
                                            {edu.degree?.includes("High School") || edu.degree?.includes("Intermediate") ? "School" : "College"} <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-institution`] ? 'from-red-500 to-red-600' : ''}`}>
                                            <input
                                                type="text"
                                                list="school-list-final"
                                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-slate-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                                value={edu.institution || ""}
                                                onChange={(e) => handleChange(index, "institution", e.target.value)}
                                                placeholder={edu.degree?.includes("High School") || edu.degree?.includes("Intermediate") ? "Ex: St. Mary's School" : "Ex: Graphic Era Hill University"}
                                            />
                                        </div>
                                        {errors[`${index}-institution`] && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors[`${index}-institution`]}</p>}
                                    </div>

                                    {/* Campus logic for GEHU */}
                                    {edu.institution === "Graphic Era Hill University" && (
                                        <div className="space-y-1.5 animate-fadeIn">
                                            <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Campus</label>
                                            <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                                                <select
                                                    className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                                    value={edu.campus || ""}
                                                    onChange={(e) => handleChange(index, "campus", e.target.value)}
                                                >
                                                    <option value="">Select Campus</option>
                                                    {GEHU_CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-degree`] ? 'text-red-500' : (darkMode ? 'text-indigo-400' : 'text-indigo-600')}`}>
                                                Degree/Level <span className="text-red-500 font-bold">*</span>
                                            </label>
                                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-degree`] ? 'from-red-500 to-red-600' : ''}`}>
                                                <select
                                                    value={edu.degree || ""}
                                                    onChange={(e) => !edu.isFixed && handleChange(index, "degree", e.target.value)}
                                                    disabled={edu.isFixed}
                                                    className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition disabled:opacity-70 ${darkMode ? (edu.isFixed ? 'bg-[#121213] text-slate-500' : 'bg-[#121213] text-white') : (edu.isFixed ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-900')}`}
                                                >
                                                    <option value="">Select Level</option>
                                                    {DEGREE_SUGGESTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                            {edu.isFixed && <p className="text-[10px] text-blue-500 font-bold uppercase mt-1.5 ml-1">Mandatory Level (Fixed)</p>}
                                            {errors[`${index}-degree`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1.5 ml-1">{errors[`${index}-degree`]}</p>}
                                        </div>

                                        {!edu.degree?.includes("High School") && !edu.degree?.includes("Intermediate") && (
                                            <>
                                                <div className="space-y-1.5">
                                                    <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-course`] ? 'text-red-500' : (darkMode ? 'text-blue-400' : 'text-blue-600')}`}>
                                                        Course <span className="text-red-500 font-bold">*</span>
                                                    </label>
                                                    <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-course`] ? 'from-red-500 to-red-600' : ''}`}>
                                                        <HybridInput
                                                            value={edu.course || ""}
                                                            onChange={(val) => handleChange(index, "course", val)}
                                                            options={COURSE_SUGGESTIONS}
                                                            placeholder="Ex: B.Tech, MCA, etc."
                                                            uppercase={true}
                                                            className={`p-2.5 rounded-[calc(0.75rem-2px)] text-sm transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                                        />
                                                    </div>
                                                    {errors[`${index}-course`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1.5 ml-1">{errors[`${index}-course`]}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                                        Branch
                                                    </label>
                                                    <div className="p-[2px] bg-gradient-to-tr from-blue-600/50 to-purple-600/50 rounded-xl shadow-sm focus-within:from-blue-600 focus-within:to-purple-600 transition-all">
                                                        <HybridInput
                                                            value={edu.branch || ""}
                                                            onChange={(val) => handleChange(index, "branch", val)}
                                                            options={BRANCH_SUGGESTIONS}
                                                            placeholder="Ex: CS, IT, ME, etc."
                                                            uppercase={true}
                                                            className={`p-2.5 rounded-[calc(0.75rem-2px)] text-sm transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        <div className="space-y-1.5">
                                            <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Field of study</label>
                                            <div className="p-[2px] bg-gradient-to-tr from-blue-600/50 to-purple-600/50 rounded-xl shadow-sm focus-within:from-blue-600 focus-within:to-purple-600 transition-all">
                                                <input
                                                    type="text"
                                                    list="study-list"
                                                    className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-slate-500' : 'bg-white text-gray-900'}`}
                                                    value={edu.fieldOfStudy || ""}
                                                    onChange={(e) => handleChange(index, "fieldOfStudy", e.target.value)}
                                                    placeholder="Ex: Computer Science"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-startDate`] ? 'text-red-500' : (darkMode ? 'text-blue-400' : 'text-blue-600')}`}>
                                                Start date <span className="text-red-500 font-bold">*</span>
                                            </label>
                                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-startDate`] ? 'from-red-500 to-red-600' : ''}`}>
                                                <div className={`grid grid-cols-2 gap-2 p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                                                    <select
                                                        className={`w-full p-2 rounded-lg text-sm outline-none ${darkMode ? 'bg-[#121213] text-white border-none' : 'bg-white text-gray-900 border-none'}`}
                                                        value={edu.startMonth || ""}
                                                        onChange={(e) => handleChange(index, "startMonth", e.target.value)}
                                                    >
                                                        <option value="">Month</option>
                                                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                    <select
                                                        className={`w-full p-2 rounded-lg text-sm outline-none ${darkMode ? 'bg-[#121213] text-white border-none' : 'bg-white text-gray-900 border-none'}`}
                                                        value={edu.startYear || ""}
                                                        onChange={(e) => handleChange(index, "startYear", e.target.value)}
                                                    >
                                                        <option value="">Year</option>
                                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-endDate`] ? 'text-red-500' : (darkMode ? 'text-indigo-400' : 'text-indigo-600')}`}>
                                                End date (or expected) <span className="text-red-500 font-bold">*</span>
                                            </label>
                                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-endDate`] ? 'from-red-500 to-red-600' : ''}`}>
                                                <div className={`grid grid-cols-2 gap-2 p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                                                    <select
                                                        className={`w-full p-2 rounded-lg text-sm outline-none ${darkMode ? 'bg-[#121213] text-white border-none' : 'bg-white text-gray-900 border-none'}`}
                                                        value={edu.endMonth || ""}
                                                        onChange={(e) => handleChange(index, "endMonth", e.target.value)}
                                                    >
                                                        <option value="">Month</option>
                                                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                    <select
                                                        className={`w-full p-2 rounded-lg text-sm outline-none ${darkMode ? 'bg-[#121213] text-white border-none' : 'bg-white text-gray-900 border-none'}`}
                                                        value={edu.endYear || ""}
                                                        onChange={(e) => handleChange(index, "endYear", e.target.value)}
                                                    >
                                                        <option value="">Year</option>
                                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grade */}
                                    <div className="space-y-1.5 md:w-1/2">
                                        <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                            <Award className="w-3.5 h-3.5" />
                                            {edu.degree?.includes("High School") || edu.degree?.includes("Intermediate") ? "Percentage" : "CGPA / Grade"}
                                        </label>
                                        <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                                            <input
                                                type="text"
                                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-slate-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                                value={edu.grade || ""}
                                                onChange={(e) => handleChange(index, "grade", e.target.value)}
                                                placeholder={edu.degree?.includes("High School") || edu.degree?.includes("Intermediate") ? "Ex: 95%" : "Ex: 9.0 CGPA"}
                                            />
                                        </div>
                                    </div>

                                    {/* Activities */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <label className={`flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                <Users className="w-3.5 h-3.5" /> Activities and societies
                                            </label>
                                            <span className={`${(edu.activities?.length || 0) > 450 ? 'text-red-500' : (darkMode ? 'text-slate-500' : 'text-gray-400')}`}>
                                                {edu.activities?.length || 0}/500
                                            </span>
                                        </div>
                                        <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-sm">
                                            <textarea
                                                className={`w-full p-4 rounded-[calc(1rem-2px)] h-24 outline-none transition custom-scrollbar ${darkMode ? 'bg-[#121213] text-white placeholder-slate-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                                value={edu.activities || ""}
                                                onChange={(e) => handleChange(index, "activities", e.target.value.slice(0, 500))}
                                                placeholder="Ex: Alpha Phi Omega, Marching Band, Volleyball"
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <label className={`flex items-center gap-1.5 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                <BookOpen className="w-3.5 h-3.5" /> Description
                                            </label>
                                            <span className={`${(edu.description?.length || 0) > 900 ? 'text-red-500' : (darkMode ? 'text-slate-500' : 'text-gray-400')}`}>
                                                {edu.description?.length || 0}/1000
                                            </span>
                                        </div>
                                        <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-sm">
                                            <textarea
                                                className={`w-full p-4 rounded-[calc(1rem-2px)] h-32 outline-none transition custom-scrollbar ${darkMode ? 'bg-[#121213] text-white placeholder-slate-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                                value={edu.description || ""}
                                                onChange={(e) => handleChange(index, "description", e.target.value.slice(0, 1000))}
                                                placeholder="Describe your studies, awards, or projects..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    ))}

                    <button
                        onClick={addEducation}
                        className={`w-full py-8 border-2 border-dashed rounded-2xl transition flex items-center justify-center gap-2 group font-bold tracking-wide ${darkMode ? 'border-slate-700 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5' : 'border-gray-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50'}`}
                    >
                        <Plus className="w-6 h-6 group-hover:scale-110 transition" /> CLICK TO ADD NEW EDUCATION
                    </button>
                </div>

                {/* Footer */}
                <div className={`p-4 flex justify-end gap-3 border-t flex-shrink-0 transition-all ${darkMode ? 'bg-slate-800 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                    <button 
                        onClick={onClose} 
                        className={`px-6 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm ${
                            darkMode 
                                ? "border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/5" 
                                : "border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                        {loading ? "Saving..." : "Save All Changes"}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${darkMode ? '#334155' : '#d1d5db'};
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${darkMode ? '#475569' : '#9ca3af'};
                }
            `}</style>
            </div>
        </div>
        </>
    );
}
