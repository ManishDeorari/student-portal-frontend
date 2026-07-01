import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Trash2, Plus, Save, GraduationCap, Calendar, BookOpen, School, Award, Users, ChevronDown, ChevronRight, CheckCircle2, Circle, Info } from "lucide-react";
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
    const [expandedIndex, setExpandedIndex] = useState(null); // Default none expanded

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
                    isOngoing: edu.isOngoing || false,
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
                        grade: edu.grade || "",
                        isOngoing: edu.isOngoing || false,
                        isMandatory: false
                    });
                }
            });

            setEducations(transformed);
        }
    }, [currentEducation, isOpen]);

    if (!isOpen) return null;

    const handleChange = (index, field, value) => {
        let processedValue = value;

        // Input Locks
        if (field === "institution" || field === "campus") {
            processedValue = processedValue.replace(/[^a-zA-Z0-9\s\.\-,\']/g, '');
        } else if (field === "course" || field === "branch" || field === "fieldOfStudy" || field === "degree") {
            processedValue = processedValue.replace(/[^a-zA-Z0-9\s\.\-]/g, '');
        } else if (field === "semester") {
            processedValue = processedValue.replace(/[^1-8]/g, '').slice(0, 1);
        } else if (field === "grade") {
            processedValue = processedValue.replace(/[^0-9\.%]/g, '');
        }

        const updated = [...educations];
        updated[index][field] = processedValue;
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
                isOngoing: false,
                activities: "",
                description: "",
                isMandatory: false
            },
        ]);
        setExpandedIndex(educations.length); // Auto-expand newly added item
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
                if (!edu.isOngoing && (!edu.grade || edu.grade.trim() === "")) newErrors[`${idx}-grade`] = "Grade/Percentage is required";
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (loading) return;
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
                    isOngoing: edu.isOngoing || false,
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
            localStorage.setItem("user", JSON.stringify(updatedUser));
            onSave(updatedUser);
            toast.success("Education details updated!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating education");
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };

    return (
        <>
        <LoadingOverlay isVisible={loading} />
        <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-2 md:p-4 animate-fadeIn">
            <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-3xl">
                <div className={`${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} rounded-[calc(1rem-2.5px)] sm:rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden max-h-[95dvh] sm:max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" /> Edit Education
                    </h2>
                    
                    <div className="flex items-center">
<button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                        {loading ? "Saving..." : "Save All Changes"}
                    </button>
<button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-1 border-2 border-white rounded-xl transition ml-3"
                    >
                        <X className="w-5 h-5" />
                    </button>
</div>
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
