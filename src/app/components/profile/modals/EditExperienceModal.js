import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X,
  Trash2,
  Plus,
  Save,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Briefcase,
  Calendar,
  MapPin,
  ExternalLink,
  Award,
  Info
} from "lucide-react";
import { Country, State, City } from "country-state-city";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";
import ImageViewerModal from "../ImageViewerModal";

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Self-employed",
  "Freelance",
  "Internship",
  "Trainee",
];

const LOCATION_TYPES = ["On-site", "Remote", "Hybrid"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = Array.from(
  { length: 50 },
  (_, i) => new Date().getFullYear() - i,
);

const JOB_TITLE_SUGGESTIONS = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Product Manager",
  "Project Manager",
  "Data Scientist",
  "UI/UX Designer",
  "Sales Manager",
  "Marketing Executive",
  "Business Analyst",
  "Human Resources",
  "Operations Manager",
  "Assistant Scrum Master",
  "Scrum Master",
  "Junior Intern",
];

const COMPANY_SUGGESTIONS = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "TCS",
  "Infosys",
  "Wipro",
  "Accenture",
  "Cognizant",
  "OpenChift",
  "Adobe",
  "Salesforce",
  "IBM",
  "Oracle",
];

export default function EditExperienceModal({
  isOpen,
  onClose,
  currentExperience,
  onSave,
}) {
  const { darkMode } = useTheme();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedProofImage, setSelectedProofImage] = useState(null);

  const isExpComplete = (exp) =>
    exp.title &&
    exp.company &&
    exp.startMonth &&
    exp.startYear &&
    (exp.isCurrent || (exp.endMonth && exp.endYear)) &&
    exp.description;

  useEffect(() => {
    if (currentExperience && isOpen) {
      const transformed = currentExperience.map((exp) => {
        const [sMonth, sYear] = (exp.startDate || "").split(" ");
        const isCurrent = exp.endDate === "Present";
        const [eMonth, eYear] = !isCurrent
          ? (exp.endDate || "").split(" ")
          : ["", ""];

        let country = "",
          state = "",
          city = "";
        if (exp.location) {
          const parts = exp.location.split(", ").map((p) => p.trim());
          if (parts.length === 3) {
            const allCountries = Country.getAllCountries();
            const foundCountry = allCountries.find((c) => c.name === parts[2]);
            if (foundCountry) {
              country = foundCountry.isoCode;
              const foundState = State.getStatesOfCountry(country).find(
                (s) => s.name === parts[1],
              );
              if (foundState) {
                state = foundState.isoCode;
                const foundCity = City.getCitiesOfState(country, state).find(
                  (c) => c.name === parts[0],
                );
                if (foundCity) city = foundCity.name;
              }
            }
          }
        }

        return {
          ...exp,
          startMonth: sMonth || "",
          startYear: sYear || "",
          isCurrent,
          endMonth: eMonth || "",
          endYear: eYear || "",
          selectedCountry: country,
          selectedState: state,
          selectedCity: city,
          skills: Array.isArray(exp.skills)
            ? exp.skills.join(", ")
            : exp.skills || "",
          proofImage: exp.proofImage || "",
          proofImageFile: null,
        };
      });
      setExperiences(transformed.length ? transformed : [{
        title: "", company: "", employmentType: "", locationType: "", selectedCountry: "", selectedState: "", selectedCity: "",
        startMonth: "", startYear: "", isCurrent: false, endMonth: "", endYear: "", description: "", skills: "", proofImage: "", proofImageFile: null
      }]);
    } else {
      setExperiences([]);
    }
  }, [currentExperience, isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, field, value) => {
    let processedValue = value;

    if (field === "title" || field === "company") {
      processedValue = processedValue.replace(/[^a-zA-Z0-9\s\.\-]/g, '');
    }

    const updated = [...experiences];
    updated[index][field] = processedValue;
    setExperiences(updated);

    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        return;
      }
      const updated = [...experiences];
      updated[index].proofImageFile = file;
      updated[index].proofImage = URL.createObjectURL(file); // preview
      setExperiences(updated);
    }
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        title: "",
        company: "",
        employmentType: "",
        locationType: "",
        selectedCountry: "",
        selectedState: "",
        selectedCity: "",
        startMonth: "",
        startYear: "",
        isCurrent: false,
        endMonth: "",
        endYear: "",
        description: "",
        skills: "",
        proofImage: "",
        proofImageFile: null,
      },
    ]);
    setExpandedIndex(experiences.length);
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    experiences.forEach((exp, idx) => {
      const hasData = exp.title || exp.company || exp.startMonth || exp.startYear || exp.description;
      if (hasData) {
        if (!exp.title) newErrors[`${idx}-title`] = "Title is required";
        if (!exp.company) newErrors[`${idx}-company`] = "Company is required";
        if (!exp.employmentType) newErrors[`${idx}-employmentType`] = "Employment type is required";
        if (!exp.locationType) newErrors[`${idx}-locationType`] = "Location type is required";
        if (!exp.startMonth || !exp.startYear)
          newErrors[`${idx}-startDate`] = "Start date required";
        if (!exp.isCurrent && (!exp.endMonth || !exp.endYear))
          newErrors[`${idx}-endDate`] = "End date required";
        if (!exp.description || exp.description.trim().length === 0)
          newErrors[`${idx}-description`] = "Description is required";
        if (!exp.selectedCountry || !exp.selectedState || !exp.selectedCity)
          newErrors[`${idx}-location`] = "Complete location is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (loading) return;
    if (!validate()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const validExperiences = experiences.filter(exp =>
        exp.title || exp.company || exp.startMonth || exp.startYear || exp.description
      );

      const uploadedExperiences = await Promise.all(
        validExperiences.map(async (exp) => {
          let proofImageUrl = exp.proofImage;
          if (exp.proofImageFile) {
            const formData = new FormData();
            formData.append("file", exp.proofImageFile);
            formData.append(
              "upload_preset",
              process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
            );
            formData.append("folder", "internships_and_experience");

            try {
              const uploadRes = await fetch(
                process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL,
                {
                  method: "POST",
                  body: formData,
                },
              );
              if (uploadRes.ok) {
                const data = await uploadRes.json();
                proofImageUrl = data.secure_url;
              } else {
                toast.error(`Failed to upload proof image for ${exp.title}`);
              }
            } catch (err) {
              console.error("Cloudinary upload error:", err);
            }
          }

          return { ...exp, proofImage: proofImageUrl };
        }),
      );

      const finalData = uploadedExperiences.map((exp) => {
        const startDate = `${exp.startMonth} ${exp.startYear}`;
        const endDate = exp.isCurrent
          ? "Present"
          : `${exp.endMonth} ${exp.endYear}`;

        let location = "";
        if (exp.selectedCountry && exp.selectedState && exp.selectedCity) {
          const cName = Country.getCountryByCode(exp.selectedCountry)?.name;
          const sName = State.getStateByCodeAndCountry(
            exp.selectedState,
            exp.selectedCountry,
          )?.name;
          location = `${exp.selectedCity}, ${sName}, ${cName}`;
        }

        return {
          title: exp.title,
          company: exp.company,
          employmentType: exp.employmentType,
          location: location,
          locationType: exp.locationType,
          startDate,
          endDate,
          description: exp.description,
          skills: Array.isArray(exp.skills)
            ? exp.skills.filter((s) => s !== "")
            : typeof exp.skills === "string"
              ? exp.skills
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s !== "")
              : [],
          proofImage: exp.proofImage,
        };
      });

      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ experience: finalData }),
        },
      );

      if (!res.ok) throw new Error("Failed to update experience");

      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onSave(updatedUser);
      toast.success("Experience updated successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error updating experience");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const expWithProof = experiences.filter(e => e.proofImage && e.proofImage.trim().length > 0 && !e.proofImage.startsWith("blob")).length;
  const expPointsEarning = Math.min(expWithProof, 3) * 10;

  return (
    <>
      <LoadingOverlay isVisible={loading} />
      <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-4xl max-h-[95dvh] sm:max-h-[90vh]">
          <div className={`${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5" /> Edit Experience
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
              
              {/* Guide Text */}
              <div className="p-[2px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 rounded-xl mb-6">
                  <div className={`p-4 rounded-[calc(0.75rem-2px)] flex items-start gap-3 ${darkMode ? 'bg-[#121213] text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
                      <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="text-sm leading-relaxed">
                          <p className="font-bold mb-0.5">Automated Points System Active!</p>
                          <p>Add proof images for your experiences to earn profile points! (Max 3 proofs, 10 pts each). Current points: <span className="font-bold text-blue-600 dark:text-blue-400">{expPointsEarning} / 30</span></p>
                      </div>
                  </div>
              </div>

            <datalist id="job-titles">
              {JOB_TITLE_SUGGESTIONS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            <datalist id="companies">
              {COMPANY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
              {experiences.map((exp, idx) => (
                <div key={idx} className="p-[2px] rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 mb-4 transition-all">
                  <div className={`p-4 rounded-[calc(1rem-2px)] h-full ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setExpandedIndex(expandedIndex === idx ? -1 : idx)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpComplete(exp) ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <h3 className={`font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                            {exp.title || "New Experience"}
                          </h3>
                          {exp.company && <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{exp.company}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); removeExperience(idx); }}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedIndex === idx ? <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} /> : <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} />}
                      </div>
                    </div>

                    {expandedIndex === idx && (
                      <div className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-white/10">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Title <span className="text-red-500">*</span></label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-title`] ? 'from-red-500 to-red-600' : ''}`}>
                              <input
                                type="text"
                                list="job-titles"
                                value={exp.title}
                                onChange={(e) => handleChange(idx, "title", e.target.value)}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                placeholder="Ex: Software Engineer"
                              />
                            </div>
                            {errors[`${idx}-title`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-title`]}</p>}
                          </div>

                          <div>
                            <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Company Name <span className="text-red-500">*</span></label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-company`] ? 'from-red-500 to-red-600' : ''}`}>
                              <input
                                type="text"
                                list="companies"
                                value={exp.company}
                                onChange={(e) => handleChange(idx, "company", e.target.value)}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                placeholder="Ex: Microsoft"
                              />
                            </div>
                            {errors[`${idx}-company`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-company`]}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Employment Type <span className="text-red-500">*</span></label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-employmentType`] ? 'from-red-500 to-red-600' : ''}`}>
                              <select
                                value={exp.employmentType}
                                onChange={(e) => handleChange(idx, "employmentType", e.target.value)}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              >
                                <option value="">Please select</option>
                                {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            {errors[`${idx}-employmentType`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-employmentType`]}</p>}
                          </div>

                          <div>
                            <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Location Type <span className="text-red-500">*</span></label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-locationType`] ? 'from-red-500 to-red-600' : ''}`}>
                              <select
                                value={exp.locationType}
                                onChange={(e) => handleChange(idx, "locationType", e.target.value)}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              >
                                <option value="">Type</option>
                                {LOCATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            {errors[`${idx}-locationType`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-locationType`]}</p>}
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>Location <span className="text-red-500">*</span></label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm sm:col-span-1 ${errors[`${idx}-location`] ? 'from-red-500 to-red-600' : ''}`}>
                              <select
                                value={exp.selectedCountry}
                                onChange={(e) => {
                                  const updated = [...experiences];
                                  updated[idx].selectedCountry = e.target.value;
                                  updated[idx].selectedState = "";
                                  updated[idx].selectedCity = "";
                                  setExperiences(updated);
                                }}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              >
                                <option value="">Country</option>
                                {Country.getAllCountries().map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                              </select>
                            </div>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm sm:col-span-1 ${errors[`${idx}-location`] ? 'from-red-500 to-red-600' : ''}`}>
                              <select
                                value={exp.selectedState}
                                onChange={(e) => {
                                  const updated = [...experiences];
                                  updated[idx].selectedState = e.target.value;
                                  updated[idx].selectedCity = "";
                                  setExperiences(updated);
                                }}
                                disabled={!exp.selectedCountry}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition disabled:opacity-50 ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              >
                                <option value="">State</option>
                                {exp.selectedCountry && State.getStatesOfCountry(exp.selectedCountry).map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                              </select>
                            </div>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm sm:col-span-1 ${errors[`${idx}-location`] ? 'from-red-500 to-red-600' : ''}`}>
                              <select
                                value={exp.selectedCity}
                                onChange={(e) => handleChange(idx, "selectedCity", e.target.value)}
                                disabled={!exp.selectedState}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition disabled:opacity-50 ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              >
                                <option value="">City</option>
                                {exp.selectedState && City.getCitiesOfState(exp.selectedCountry, exp.selectedState).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                              </select>
                            </div>
                          </div>
                          {errors[`${idx}-location`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-location`]}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>Start Date <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                              <div className={`w-1/2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-startDate`] ? 'from-red-500 to-red-600' : ''}`}>
                                <select
                                  value={exp.startMonth}
                                  onChange={(e) => handleChange(idx, "startMonth", e.target.value)}
                                  className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                >
                                  <option value="">Month</option>
                                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                              </div>
                              <div className={`w-1/2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-startDate`] ? 'from-red-500 to-red-600' : ''}`}>
                                <select
                                  value={exp.startYear}
                                  onChange={(e) => handleChange(idx, "startYear", e.target.value)}
                                  className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                >
                                  <option value="">Year</option>
                                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                              </div>
                            </div>
                            {errors[`${idx}-startDate`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-startDate`]}</p>}
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className={`block text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>End Date {!exp.isCurrent && <span className="text-red-500">*</span>}</label>
                              <label className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer ${darkMode ? 'text-white' : 'text-black'}`}>
                                <input type="checkbox" checked={exp.isCurrent} onChange={(e) => handleChange(idx, "isCurrent", e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                I currently work here
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <div className={`w-1/2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-endDate`] ? 'from-red-500 to-red-600' : ''}`}>
                                <select
                                  value={exp.endMonth}
                                  onChange={(e) => handleChange(idx, "endMonth", e.target.value)}
                                  disabled={exp.isCurrent}
                                  className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition disabled:opacity-50 ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                >
                                  <option value="">Month</option>
                                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                              </div>
                              <div className={`w-1/2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-endDate`] ? 'from-red-500 to-red-600' : ''}`}>
                                <select
                                  value={exp.endYear}
                                  onChange={(e) => handleChange(idx, "endYear", e.target.value)}
                                  disabled={exp.isCurrent}
                                  className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition disabled:opacity-50 ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                                >
                                  <option value="">Year</option>
                                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                              </div>
                            </div>
                            {errors[`${idx}-endDate`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-endDate`]}</p>}
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Description <span className="text-red-500">*</span></label>
                          <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-description`] ? 'from-red-500 to-red-600' : ''}`}>
                            <textarea
                              value={exp.description}
                              onChange={(e) => handleChange(idx, "description", e.target.value)}
                              rows={4}
                              className={`w-full p-3 rounded-[calc(0.75rem-2px)] outline-none transition resize-none ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              placeholder="Describe your responsibilities and achievements..."
                            />
                          </div>
                          {errors[`${idx}-description`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-description`]}</p>}
                        </div>

                        <div>
                          <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-fuchsia-400' : 'text-fuchsia-600'}`}>Skills (comma separated)</label>
                          <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                            <input
                              type="text"
                              value={exp.skills}
                              onChange={(e) => handleChange(idx, "skills", e.target.value)}
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}
                              placeholder="Ex: React, Node.js, Project Management"
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Proof of Experience (Optional)</label>
                          <div className={`flex items-center gap-4 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                            <div className={`flex items-center gap-4 p-3 rounded-[calc(0.75rem-2px)] w-full ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                              {exp.proofImage ? (
                                <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[10px] shrink-0 shadow-sm">
                                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white">
                                    <img src={exp.proofImage} alt="Proof preview" className="w-full h-full object-cover" />
                                  </div>
                                </div>
                              ) : (
                                <div className={`w-16 h-16 rounded-[10px] flex items-center justify-center shrink-0 border border-gray-300 dark:border-white/20 ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                  <Award className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  id={`proof-${idx}`}
                                  className="hidden"
                                  onChange={(e) => handleFileChange(idx, e)}
                                />
                                <div className="flex items-center gap-2">
                                  <label htmlFor={`proof-${idx}`} className={`cursor-pointer inline-block px-4 py-2 rounded-lg text-sm font-bold transition border border-gray-300 dark:border-white/20 ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}>
                                    {exp.proofImage ? "Change Image" : "Upload Certificate/Offer Letter"}
                                  </label>
                                  {exp.proofImage && (
                                    <button
                                      onClick={() => {
                                        const updated = [...experiences];
                                        updated[idx].proofImage = "";
                                        updated[idx].proofImageFile = null;
                                        setExperiences(updated);
                                      }}
                                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                      title="Remove Image"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Max 5MB (JPG, PNG)</p>
                              </div>
                              {exp.proofImage && (
                                <button
                                  onClick={() => setSelectedProofImage(exp.proofImage)}
                                  className="text-blue-500 hover:text-blue-600"
                                >
                                  <ExternalLink className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm w-full transition-all hover:scale-[1.01]">
                <button
                  onClick={addExperience}
                  className={`w-full py-4 rounded-[calc(0.75rem-2px)] flex items-center justify-center gap-2 font-bold ${darkMode ? 'bg-[#121213] text-white hover:bg-[#1a1a1b]' : 'bg-white text-black hover:bg-gray-50'}`}
                >
                  <Plus className="w-5 h-5" /> Add Another Experience
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
                  background: linear-gradient(to bottom, #2563eb, #9333ea);
                  border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: linear-gradient(to bottom, #1d4ed8, #7e22ce);
              }
          `}</style>
        </div>
      </div>

      {selectedProofImage && (
        <ImageViewerModal
          isOpen={!!selectedProofImage}
          onClose={() => setSelectedProofImage(null)}
          imageUrl={selectedProofImage}
          title="Experience Proof"
        />
      )}
    </>
  );
}