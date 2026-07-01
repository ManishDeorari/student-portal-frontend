import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Trash2, Plus, Save, GraduationCap, Calendar, BookOpen, School, Award, Users, ChevronDown, ChevronRight, CheckCircle2, Circle, Info } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
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
  "CS", "AI", "IT", "ME", "CE", "ECE", "EE", 
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
  "Graphic Era Hill University",
  "Graphic Era Deemed to be University",
  "IIT Roorkee",
  "NIT Uttarakhand",
  "UPES Dehradun",
  "DIT University",
  "Uttaranchal University",
  "GB Pant University of Agriculture and Technology",
  "Kumaun University",
  "Doon University"
];

const SCHOOL_SUGGESTIONS = [
  "The Doon School, Dehradun",
  "Welham Girls' School, Dehradun",
  "Welham Boys' School, Dehradun",
  "Woodstock School, Mussoorie",
  "St. Joseph's Academy, Dehradun",
  "St. George's College, Mussoorie",
  "Sherwood College, Nainital",
  "Convent of Jesus and Mary, Dehradun",
  "Ever Green Sr. Sec. School"
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
  const [expandedIndex, setExpandedIndex] = useState(null);

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
          fieldOfStudy: edu.fieldOfStudy || "",
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
          isFixed: true
        };
      });

      (currentEducation || []).forEach(edu => {
        if (!MANDATORY_DEGREES.includes(edu.level || edu.degree)) {
          const [sMonth, sYear] = (edu.startDate || "").split(" ");
          const [eMonth, eYear] = (edu.endDate || "").split(" ");
          transformed.push({
            ...edu,
            course: edu.course || "",
            branch: edu.branch || "",
            fieldOfStudy: edu.fieldOfStudy || "",
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
    
    // Clear campus if institution is changed away from GEHU
    if (field === "institution" && processedValue !== "Graphic Era Hill University") {
      updated[index].campus = "";
    }
    
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
    setExpandedIndex(educations.length);
  };

  const removeEducation = (index) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    educations.forEach((edu, idx) => {
      const isSchool = edu.degree === "High School (Secondary - Class 10)" || edu.degree === "Intermediate (Higher Secondary - Class 12)";
      const hasData = edu.institution || edu.course || edu.startMonth || edu.startYear || edu.endMonth || edu.endYear || edu.grade || edu.activities || edu.description;
      
      if (hasData || edu.isMandatory) {
        if (!edu.institution) newErrors[`${idx}-institution`] = isSchool ? "Name of School is required" : "Institution is required";
        
        if (edu.institution === "Graphic Era Hill University" && !edu.campus) {
          newErrors[`${idx}-campus`] = "Campus is required for GEHU";
        }
        
        if (!isSchool && !edu.course) {
          newErrors[`${idx}-course`] = "Course is required";
        }

        if (!edu.startMonth || !edu.startYear) newErrors[`${idx}-startDate`] = "Start date is required";
        if (!edu.endMonth || !edu.endYear) newErrors[`${idx}-endDate`] = "End date is required";
        
        // Grade is mandatory ONLY if not ongoing
        if (!edu.isOngoing && (!edu.grade || edu.grade.trim() === "")) {
          newErrors[`${idx}-grade`] = "Grade/Percentage is required";
        }
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
        edu.institution || edu.course || edu.startMonth || edu.startYear || edu.endMonth || edu.endYear || edu.grade || edu.activities || edu.description || edu.isMandatory
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
          location: "",
          startDate,
          endDate,
          isOngoing: edu.isOngoing || false,
          grade: edu.isOngoing ? "" : edu.grade, // Clear grade if currently studying
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
      toast.success("Education updated successfully!");
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
      <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-4xl max-h-[95dvh] sm:max-h-[90vh]">
          <div className={`${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <GraduationCap className="w-5 h-5" /> Edit Education
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-1 border-2 border-white rounded-xl transition ml-3"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {educations.map((edu, idx) => {
                const isSchool = edu.degree === "High School (Secondary - Class 10)" || edu.degree === "Intermediate (Higher Secondary - Class 12)";
                
                return (
                <div key={idx} className="p-[2px] rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 mb-4 transition-all">
                  <div className={`p-4 rounded-[calc(1rem-2px)] h-full ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setExpandedIndex(expandedIndex === idx ? -1 : idx)}
                    >
                      <div className="flex items-center gap-3">
                        {isEduComplete(edu) ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                            {edu.degree || "New Education"}
                          </h3>
                          {edu.institution && <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{edu.institution}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!edu.isFixed && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeEducation(idx); }}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {expandedIndex === idx ? <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} /> : <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} />}
                      </div>
                    </div>

                    {expandedIndex === idx && (
                      <div className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-white/10 flex flex-col">

                        <div>
                          <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Degree / Level <span className="text-red-500">*</span></label>
                          <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                            <select
                              value={edu.degree}
                              onChange={(e) => handleChange(idx, "degree", e.target.value)}
                              disabled={edu.isFixed}
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition disabled:opacity-50 ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                            >
                              <option value="">Select Degree</option>
                              {DEGREE_SUGGESTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                              {isSchool ? "Name of School" : "Institution"} <span className="text-red-500">*</span>
                          </label>
                          <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-institution`] ? 'from-red-500 to-red-600' : ''}`}>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => handleChange(idx, "institution", e.target.value)}
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              placeholder={isSchool ? "Name of school" : "Name of college/university"}
                              list={`inst-suggestions-${idx}`}
                            />
                            <datalist id={`inst-suggestions-${idx}`}>
                                {isSchool ? SCHOOL_SUGGESTIONS.map(s => <option key={s} value={s} />) : INSTITUTION_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                            </datalist>
                          </div>
                          {errors[`${idx}-institution`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-institution`]}</p>}
                        </div>

                        {edu.institution === "Graphic Era Hill University" && (
                          <div className="animate-fadeIn">
                            <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                Campus <span className="text-red-500">*</span>
                            </label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-campus`] ? 'from-red-500 to-red-600' : ''}`}>
                              <select
                                value={edu.campus}
                                onChange={(e) => handleChange(idx, "campus", e.target.value)}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              >
                                <option value="">Select Campus</option>
                                {GEHU_CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            {errors[`${idx}-campus`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-campus`]}</p>}
                          </div>
                        )}

                        {!isSchool && (
                          <>
                            <div>
                              <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                  Course <span className="text-red-500">*</span>
                              </label>
                              <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-course`] ? 'from-red-500 to-red-600' : ''}`}>
                                <input
                                  type="text"
                                  value={edu.course}
                                  onChange={(e) => handleChange(idx, "course", e.target.value)}
                                  className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                  placeholder="e.g. BCA, MCA, B.Tech"
                                  list={`course-suggestions-${idx}`}
                                />
                                <datalist id={`course-suggestions-${idx}`}>
                                    {COURSE_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                                </datalist>
                              </div>
                              {errors[`${idx}-course`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-course`]}</p>}
                            </div>
                            
                            <div>
                              <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Branch</label>
                              <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                                <input
                                  type="text"
                                  value={edu.branch}
                                  onChange={(e) => handleChange(idx, "branch", e.target.value)}
                                  className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                  placeholder="e.g. AI, CS"
                                  list={`branch-suggestions-${idx}`}
                                />
                                <datalist id={`branch-suggestions-${idx}`}>
                                    {BRANCH_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                                </datalist>
                              </div>
                            </div>
                            
                            <div>
                              <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Field of Study</label>
                              <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                                <input
                                  type="text"
                                  value={edu.fieldOfStudy}
                                  onChange={(e) => handleChange(idx, "fieldOfStudy", e.target.value)}
                                  className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                  placeholder="e.g. Artificial Intelligence"
                                  list={`study-suggestions-${idx}`}
                                />
                                <datalist id={`study-suggestions-${idx}`}>
                                    {STUDY_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                                </datalist>
                              </div>
                            </div>
                          </>
                        )}

                        <div>
                          <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>Start Date <span className="text-red-500">*</span></label>
                          <div className="flex gap-2">
                            <div className={`w-1/2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-startDate`] ? 'from-red-500 to-red-600' : ''}`}>
                              <select
                                value={edu.startMonth}
                                onChange={(e) => handleChange(idx, "startMonth", e.target.value)}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              >
                                <option value="">Month</option>
                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                            </div>
                            <div className={`w-1/2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-startDate`] ? 'from-red-500 to-red-600' : ''}`}>
                              <select
                                value={edu.startYear}
                                onChange={(e) => handleChange(idx, "startYear", e.target.value)}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              >
                                <option value="">Year</option>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className={`block text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                                {edu.isOngoing ? "Expected End Date" : "End Date"} <span className="text-red-500">*</span>
                            </label>
                            {!isSchool && (
                                <label className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer ${darkMode ? 'text-white' : 'text-black'}`}>
                                <input type="checkbox" checked={edu.isOngoing} onChange={(e) => {
                                    handleChange(idx, "isOngoing", e.target.checked);
                                    if(e.target.checked) handleChange(idx, "grade", "");
                                }} className="rounded" />
                                Currently studying
                                </label>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <div className={`w-1/2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-endDate`] ? 'from-red-500 to-red-600' : ''}`}>
                              <select
                                value={edu.endMonth}
                                onChange={(e) => handleChange(idx, "endMonth", e.target.value)}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              >
                                <option value="">Month</option>
                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                            </div>
                            <div className={`w-1/2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-endDate`] ? 'from-red-500 to-red-600' : ''}`}>
                              <select
                                value={edu.endYear}
                                onChange={(e) => handleChange(idx, "endYear", e.target.value)}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              >
                                <option value="">Year</option>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-fuchsia-400' : 'text-fuchsia-600'}`}>
                              Grade/Percentage {!edu.isOngoing && <span className="text-red-500">*</span>}
                          </label>
                          <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-grade`] ? 'from-red-500 to-red-600' : ''}`}>
                            <input
                              type="text"
                              value={edu.grade}
                              onChange={(e) => handleChange(idx, "grade", e.target.value)}
                              disabled={edu.isOngoing}
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition disabled:opacity-50 ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              placeholder="e.g. 8.5 CGPA or 90%"
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Description / Activities</label>
                          <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                            <textarea
                              value={edu.description}
                              onChange={(e) => handleChange(idx, "description", e.target.value)}
                              rows={3}
                              className={`w-full p-3 rounded-[calc(0.75rem-2px)] outline-none transition resize-none ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              placeholder="Societies, clubs, or academic achievements..."
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}

              <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm w-full transition-all hover:scale-[1.01]">
                <button
                  onClick={addEducation}
                  className={`w-full py-4 rounded-[calc(0.75rem-2px)] flex items-center justify-center gap-2 font-bold ${darkMode ? 'bg-[#121213] text-white hover:bg-[#1a1a1b]' : 'bg-white text-black hover:bg-gray-50'}`}
                >
                  <Plus className="w-5 h-5" /> Add Another Education
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className={`p-4 flex justify-end gap-3 flex-shrink-0 ${darkMode ? 'bg-slate-800/50 border-t border-white/5' : 'bg-gray-50 border-t'}`}>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
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
                            background: ${darkMode ? '#333' : '#d1d5db'};
                            border-radius: 10px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: ${darkMode ? '#555' : '#9ca3af'};
                        }
                    `}</style>
        </div>
      </div>
    </>
  );
}