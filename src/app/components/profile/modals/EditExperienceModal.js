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

// Common suggestions for Job Titles and Companies
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
      // Transform stored data into form state
      const transformed = currentExperience.map((exp) => {
        const [sMonth, sYear] = (exp.startDate || "").split(" ");
        const isCurrent = exp.endDate === "Present";
        const [eMonth, eYear] = !isCurrent
          ? (exp.endDate || "").split(" ")
          : ["", ""];

        // Parse location for dropdowns
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
          isInternship: exp.isInternship || false,
          proofImage: exp.proofImage || "",
          proofImageFile: null, // For new uploads
        };
      });
      setExperiences(transformed);
    }
  }, [currentExperience, isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);

    // Clear errors
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
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
        isInternship: false,
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
      if (!exp.title) newErrors[`${idx}-title`] = "Title is required";
      if (!exp.company) newErrors[`${idx}-company`] = "Company is required";
      if (!exp.employmentType) newErrors[`${idx}-employmentType`] = "Employment type is required";
      if (!exp.startMonth || !exp.startYear)
        newErrors[`${idx}-startDate`] = "Start date required";
      if (!exp.isCurrent && (!exp.endMonth || !exp.endYear))
        newErrors[`${idx}-endDate`] = "End date required";
      if (!exp.description || exp.description.trim().length === 0)
        newErrors[`${idx}-description`] = "Description is required";
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
      // Upload proof images to Cloudinary first
      const uploadedExperiences = await Promise.all(
        experiences.map(async (exp) => {
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
        // Construct date strings
        const startDate = `${exp.startMonth} ${exp.startYear}`;
        const endDate = exp.isCurrent
          ? "Present"
          : `${exp.endMonth} ${exp.endYear}`;

        // Construct location string
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
          isInternship: exp.isInternship,
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

  // Live points counter for hint banner
  const expWithProof = experiences.filter(e => e.proofImage && e.proofImage.trim().length > 0).length;
  const expPointsEarning = Math.min(expWithProof, 3) * 10;

  return (
    <>
      <LoadingOverlay isVisible={loading} />
      <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-2 md:p-4 text-gray-900">
        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-3xl">
          <div
            className={`rounded-[calc(1rem-2.5px)] sm:rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden animate-fadeIn max-h-[95dvh] sm:max-h-[90vh] flex flex-col transition-colors duration-500 ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"}`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5" /> Edit Experience
              </h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-[#FAFAFA]/20 p-1 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className={`p-4 md:p-6 space-y-8 overflow-y-auto custom-scrollbar flex-grow transition-colors ${darkMode ? "bg-[#121213]" : "bg-gray-50/30"}`}
            >
              {/* Guide Text */}
              <div className="p-[2px] bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500 rounded-xl mb-6">
                <div className={`p-4 rounded-[calc(0.75rem-2px)] flex items-start gap-3 ${darkMode ? 'bg-[#121213] text-purple-300' : 'bg-purple-50 text-purple-800'}`}>
                  <Award className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm leading-relaxed space-y-1">
                    <p className="font-black uppercase tracking-wide">Earn Points for Experience!</p>
                    <p>Add up to <span className="font-black">3 entries with a valid Proof Image</span> to earn <span className="font-black">10 points each</span> (maximum <span className="font-black">30 points</span> total).</p>
                    <div className={`mt-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest rounded-lg px-3 py-1.5 w-max ${darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                      <span>
                        {expWithProof >= 3
                          ? `✅ ${expPointsEarning}/30 pts — Maximum reached!`
                          : `${expWithProof}/3 entries with proof — Currently earning ${expPointsEarning}/30 pts`}
                      </span>
                    </div>
                    <p className={`text-[10px] font-medium mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      Faculty &amp; Admin can always see the proof image • Toggle visibility per entry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Datalists for Suggestions */}
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

              {experiences.map((exp, index) => (
                <div
                  key={index}
                  className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_10px_30px_rgba(37,99,235,0.2)] transition-all duration-300"
                >
                  <div
                    className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-[calc(2.5rem-2.5px)] overflow-hidden shadow-2xl`}
                  >
                    {/* Header Section */}
                    <div
                      onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                      className={`p-5 flex items-center justify-between cursor-pointer select-none border-b border-dashed ${darkMode ? "border-white/10" : "border-gray-200"} ${expandedIndex === index ? (darkMode ? "bg-blue-600/10" : "bg-blue-50/50") : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-blue-500 transition-transform duration-300">
                          {expandedIndex === index ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                        <h3
                          className={`font-black uppercase tracking-tight text-sm ${expandedIndex === index ? "text-blue-500" : darkMode ? "text-slate-300" : "text-gray-700"}`}
                        >
                          {exp.employmentType || "New Experience"}
                        </h3>
                        {isExpComplete(exp) ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle
                            className={`w-4 h-4 ${darkMode ? "text-slate-600" : "text-gray-300"}`}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeExperience(index);
                          }}
                          className="text-red-400 hover:text-red-600 p-2 hover:bg-red-500/10 rounded-full transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div
                      className={`transition-all duration-300 overflow-hidden ${expandedIndex === index ? "max-h-[1500px] opacity-100 p-6" : "max-h-0 opacity-0 overflow-hidden"}`}
                    >
                      <div className="space-y-6">
                        {/* Row 1: Title and Employment Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-title`] ? "text-red-500" : darkMode ? "text-blue-400" : "text-blue-600"}`}>
                              Title <span className="text-red-500 font-bold">*</span>
                            </label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-title`] ? "from-red-500 to-red-600" : ""}`}>
                              <input
                                type="text"
                                list="job-titles"
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                                value={exp.title || ""}
                                onChange={(e) => handleChange(index, "title", e.target.value)}
                                placeholder="Ex: Software Engineer"
                              />
                            </div>
                            {errors[`${index}-title`] && <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1.5">{errors[`${index}-title`]}</p>}
                          </div>

                          <div className="space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-employmentType`] ? "text-red-500" : darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                              Employment type <span className="text-red-500 font-bold">*</span>
                            </label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-employmentType`] ? "from-red-500 to-red-600" : ""}`}>
                              <select
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white" : "bg-white text-gray-900"}`}
                                value={exp.employmentType || ""}
                                onChange={(e) => handleChange(index, "employmentType", e.target.value)}
                              >
                                <option value="">Please select</option>
                                {EMPLOYMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                              </select>
                            </div>
                            {errors[`${index}-employmentType`] && <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1.5">{errors[`${index}-employmentType`]}</p>}
                          </div>
                        </div>

                        {/* Row 2: Company */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-company`] ? "text-red-500" : darkMode ? "text-purple-400" : "text-purple-600"}`}>
                            Company or organization <span className="text-red-500 font-bold">*</span>
                          </label>
                          <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-company`] ? "from-red-500 to-red-600" : ""}`}>
                            <input
                              type="text"
                              list="companies"
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                              value={exp.company || ""}
                              onChange={(e) => handleChange(index, "company", e.target.value)}
                              placeholder="Ex: Microsoft"
                            />
                          </div>
                          {errors[`${index}-company`] && <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1.5">{errors[`${index}-company`]}</p>}
                        </div>

                        {/* Checkbox: Currently working and Internship */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`current-${index}`}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                              checked={exp.isCurrent}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "isCurrent",
                                  e.target.checked,
                                )
                              }
                            />
                            <label
                              htmlFor={`current-${index}`}
                              className={`text-sm font-medium cursor-pointer ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                            >
                              I am currently working in this role
                            </label>
                          </div>
                        </div>

                        {/* Row 3: Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-startDate`] ? "text-red-500" : darkMode ? "text-blue-400" : "text-blue-600"}`}>
                              Start date <span className="text-red-500 font-bold">*</span>
                            </label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-startDate`] ? "from-red-500 to-red-600" : ""}`}>
                              <div className={`grid grid-cols-2 gap-2 p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                                <select
                                  className={`w-full p-2 rounded-lg text-sm outline-none ${darkMode ? "bg-[#121213] text-white border-none" : "bg-white text-gray-900 border-none"}`}
                                  value={exp.startMonth || ""}
                                  onChange={(e) => handleChange(index, "startMonth", e.target.value)}
                                >
                                  <option value="">Month</option>
                                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select
                                  className={`w-full p-2 rounded-lg text-sm outline-none ${darkMode ? "bg-[#121213] text-white border-none" : "bg-white text-gray-900 border-none"}`}
                                  value={exp.startYear || ""}
                                  onChange={(e) => handleChange(index, "startYear", e.target.value)}
                                >
                                  <option value="">Year</option>
                                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                                </select>
                              </div>
                            </div>
                            {errors[`${index}-startDate`] && <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1.5">{errors[`${index}-startDate`]}</p>}
                          </div>

                          {!exp.isCurrent && (
                            <div className="space-y-2">
                              <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-endDate`] ? "text-red-500" : darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                                End date <span className="text-red-500 font-bold">*</span>
                              </label>
                              <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-endDate`] ? "from-red-500 to-red-600" : ""}`}>
                                <div className={`grid grid-cols-2 gap-2 p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                                  <select
                                    className={`w-full p-2 rounded-lg text-sm outline-none ${darkMode ? "bg-[#121213] text-white border-none" : "bg-white text-gray-900 border-none"}`}
                                    value={exp.endMonth || ""}
                                    onChange={(e) => handleChange(index, "endMonth", e.target.value)}
                                  >
                                    <option value="">Month</option>
                                    {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                                  </select>
                                  <select
                                    className={`w-full p-2 rounded-lg text-sm outline-none ${darkMode ? "bg-[#121213] text-white border-none" : "bg-white text-gray-900 border-none"}`}
                                    value={exp.endYear || ""}
                                    onChange={(e) => handleChange(index, "endYear", e.target.value)}
                                  >
                                    <option value="">Year</option>
                                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                                  </select>
                                </div>
                              </div>
                              {errors[`${index}-endDate`] && <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1.5">{errors[`${index}-endDate`]}</p>}
                            </div>
                          )}
                        </div>

                        {/* Row 4: Location Dropdowns */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? "text-red-400" : "text-red-600"}`}>
                            Location <MapPin className="w-3.5 h-3.5" />
                          </label>
                          <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                              <select
                                value={exp.selectedCountry}
                                onChange={(e) => {
                                  handleChange(index, "selectedCountry", e.target.value);
                                  handleChange(index, "selectedState", "");
                                  handleChange(index, "selectedCity", "");
                                }}
                                className={`w-full p-2 rounded-lg text-sm outline-none ${darkMode ? "bg-[#121213] text-white border-none" : "bg-white text-gray-900 border-none"}`}
                              >
                                <option value="">Select Country</option>
                                <option value="IN">India</option>
                                <option disabled>──────────</option>
                                {Country.getAllCountries().filter((c) => c.isoCode !== "IN").map((c) => (
                                  <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                ))}
                              </select>
                              <select
                                value={exp.selectedState}
                                onChange={(e) => {
                                  handleChange(index, "selectedState", e.target.value);
                                  handleChange(index, "selectedCity", "");
                                }}
                                disabled={!exp.selectedCountry}
                                className={`w-full p-2 rounded-lg text-sm outline-none disabled:opacity-50 ${darkMode ? "bg-[#121213] text-white border-none" : "bg-white text-gray-900 border-none"}`}
                              >
                                <option value="">Select State</option>
                                {exp.selectedCountry && State.getStatesOfCountry(exp.selectedCountry).map((s) => (
                                  <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                                ))}
                              </select>
                              <select
                                value={exp.selectedCity}
                                onChange={(e) => handleChange(index, "selectedCity", e.target.value)}
                                disabled={!exp.selectedState}
                                className={`w-full p-2 rounded-lg text-sm outline-none disabled:opacity-50 ${darkMode ? "bg-[#121213] text-white border-none" : "bg-white text-gray-900 border-none"}`}
                              >
                                <option value="">Select City</option>
                                {exp.selectedState && City.getCitiesOfState(exp.selectedCountry, exp.selectedState).map((c) => (
                                  <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Row 5: Description */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <label className={`flex items-center gap-1.5 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                              Description / Responsibilities
                            </label>
                            <span className={`${(exp.description?.length || 0) > 900 ? "text-red-500" : (darkMode ? "text-slate-500" : "text-gray-400")}`}>
                              {exp.description?.length || 0}/1000
                            </span>
                          </div>
                          <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-sm">
                            <textarea
                              placeholder="Describe your role, achievements, and responsibilities..."
                              value={exp.description || ""}
                              onChange={(e) => handleChange(index, "description", e.target.value.slice(0, 1000))}
                              rows={4}
                              className={`w-full p-4 rounded-[calc(1rem-2px)] h-32 outline-none transition custom-scrollbar resize-none ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                            />
                          </div>
                          {errors[`${index}-description`] && <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1">{errors[`${index}-description`]}</p>}
                        </div>

                        {/* Row 6: Skills Used */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                            Skills Used
                          </label>
                          <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                            <input
                              type="text"
                              placeholder="e.g. React, Node.js, Project Management (Comma separated)"
                              value={exp.skills || ""}
                              onChange={(e) => handleChange(index, "skills", e.target.value)}
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                            />
                          </div>
                        </div>

                        {/* Row 8: Proof Image */}
                        <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm mt-4`}>
                          <div className={`p-4 rounded-[calc(0.75rem-2px)] flex flex-col gap-4 ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                            <div className="space-y-2">
                              <label
                                className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                              >
                                Proof Image (Offer Letter / Certificate)
                              </label>
                              <div className="flex flex-col gap-2">
                                {exp.proofImage && !exp.proofImageFile && (
                                  <div className="flex flex-wrap items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedProofImage({ url: exp.proofImage, title: exp.company || exp.title })}
                                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${darkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"}`}
                                    >
                                      <ExternalLink size={14} />
                                      View Current Proof Image
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleChange(index, "proofImage", "")}
                                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${darkMode ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}
                                    >
                                      <Trash2 size={14} />
                                      Remove
                                    </button>
                                  </div>
                                )}
                                {exp.proofImageFile && (
                                  <span className="text-xs font-bold text-green-500">
                                    {exp.proofImageFile.name} (Ready to upload)
                                  </span>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleChange(
                                      index,
                                      "proofImageFile",
                                      e.target.files[0],
                                    )
                                  }
                                  className={`text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition outline-none cursor-pointer ${darkMode ? "text-white" : "text-black"}`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  setExperiences([
                    ...experiences,
                    {
                      title: "",
                      company: "",
                      employmentType: "",
                      location: "",
                      locationType: "",
                      startDate: "",
                      endDate: "",
                      startMonth: "",
                      startYear: "",
                      isCurrent: false,
                      endMonth: "",
                      endYear: "",
                      description: "",
                      skills: "",
                      selectedCountry: "",
                      selectedState: "",
                      selectedCity: "",
                      isInternship: false,
                      proofImage: "",
                      proofImageFile: null,
                    },
                  ]);
                }}
                className={`w-full py-6 border-2 border-dashed rounded-2xl transition flex items-center justify-center gap-2 group font-bold tracking-wide ${darkMode ? "border-white/10 text-blue-400 hover:border-blue-500 hover:bg-blue-900/10" : "border-gray-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50"}`}
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition" />{" "}
                CLICK TO ADD NEW EXPERIENCE
              </button>
            </div>

            <div
              className={`p-4 flex justify-end gap-3 border-t flex-shrink-0 transition-all ${darkMode ? "bg-slate-800 border-white/5" : "bg-gray-50 border-gray-200"}`}
            >
              <button
                onClick={onClose}
                className={`px-6 py-2.5 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm ${darkMode ? "border-white text-white hover:bg-white/10" : "border-black text-black hover:bg-gray-100"}`}
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
              background: ${darkMode ? "#334155" : "#d1d5db"};
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: ${darkMode ? "#475569" : "#9ca3af"};
            }
          `}</style>
        </div>
      </div>

      {selectedProofImage && (
        <ImageViewerModal
          imageUrl={selectedProofImage.url}
          downloadName={`${selectedProofImage.title} - Proof.jpg`}
          onClose={() => setSelectedProofImage(null)}
          isRestricted={false}
        />
      )}
    </>
  );
}
