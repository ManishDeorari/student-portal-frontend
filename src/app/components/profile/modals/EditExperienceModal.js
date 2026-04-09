import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Trash2, Plus, Save, Briefcase, Calendar, MapPin } from "lucide-react";
import { Country, State, City } from "country-state-city";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

// Common suggestions for Job Titles and Companies
const JOB_TITLE_SUGGESTIONS = [
    "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Product Manager", "Project Manager", "Data Scientist", "UI/UX Designer",
    "Sales Manager", "Marketing Executive", "Business Analyst", "Human Resources",
    "Operations Manager", "Assistant Scrum Master", "Scrum Master", "Junior Intern"
];

const COMPANY_SUGGESTIONS = [
    "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix",
    "TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "OpenChift",
    "Adobe", "Salesforce", "IBM", "Oracle"
];

export default function EditExperienceModal({ isOpen, onClose, currentExperience, onSave }) {
    const { darkMode } = useTheme();
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (currentExperience && isOpen) {
            // Transform stored data into form state
            const transformed = currentExperience.map(exp => {
                const [sMonth, sYear] = (exp.startDate || "").split(" ");
                const isCurrent = exp.endDate === "Present";
                const [eMonth, eYear] = !isCurrent ? (exp.endDate || "").split(" ") : ["", ""];

                // Parse location for dropdowns
                let country = "", state = "", city = "";
                if (exp.location) {
                    const parts = exp.location.split(", ").map(p => p.trim());
                    if (parts.length === 3) {
                        const allCountries = Country.getAllCountries();
                        const foundCountry = allCountries.find(c => c.name === parts[2]);
                        if (foundCountry) {
                            country = foundCountry.isoCode;
                            const foundState = State.getStatesOfCountry(country).find(s => s.name === parts[1]);
                            if (foundState) {
                                state = foundState.isoCode;
                                const foundCity = City.getCitiesOfState(country, state).find(c => c.name === parts[0]);
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
                    skills: Array.isArray(exp.skills) ? exp.skills.join(", ") : (exp.skills || "")
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
                skills: ""
            },
        ]);
    };

    const removeExperience = (index) => {
        setExperiences(experiences.filter((_, i) => i !== index));
    };

    const validate = () => {
        const newErrors = {};
        experiences.forEach((exp, idx) => {
            if (!exp.title) newErrors[`${idx}-title`] = "Title is required";
            if (!exp.company) newErrors[`${idx}-company`] = "Company is required";
            if (!exp.startMonth || !exp.startYear) newErrors[`${idx}-startDate`] = "Start date required";
            if (!exp.isCurrent && (!exp.endMonth || !exp.endYear)) newErrors[`${idx}-endDate`] = "End date required";
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            const finalData = experiences.map(exp => {
                // Construct date strings
                const startDate = `${exp.startMonth} ${exp.startYear}`;
                const endDate = exp.isCurrent ? "Present" : `${exp.endMonth} ${exp.endYear}`;

                // Construct location string
                let location = "";
                if (exp.selectedCountry && exp.selectedState && exp.selectedCity) {
                    const cName = Country.getCountryByCode(exp.selectedCountry)?.name;
                    const sName = State.getStateByCodeAndCountry(exp.selectedState, exp.selectedCountry)?.name;
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
                    skills: typeof exp.skills === 'string' ? exp.skills.split(",").map(s => s.trim()).filter(s => s !== "") : []
                };
            });

            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ experience: finalData }),
            });

            if (!res.ok) throw new Error("Failed to update experience");

            const updatedUser = await res.json();
            onSave(updatedUser);
            toast.success("Experience updated successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating experience");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <LoadingOverlay isVisible={loading} />
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-2 md:p-4 text-gray-900">
            <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-3xl">
                <div className={`rounded-[calc(1rem-2.5px)] sm:rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden animate-fadeIn max-h-[95dvh] sm:max-h-[90vh] flex flex-col transition-colors duration-500 ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Briefcase className="w-5 h-5" /> Edit Experience
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-[#FAFAFA]/20 p-1 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className={`p-4 md:p-6 space-y-8 overflow-y-auto custom-scrollbar flex-grow transition-colors ${darkMode ? 'bg-[#121213]' : 'bg-gray-50/30'}`}>
                    {/* Datalists for Suggestions */}
                    <datalist id="job-titles">
                        {JOB_TITLE_SUGGESTIONS.map(t => <option key={t} value={t} />)}
                    </datalist>
                    <datalist id="companies">
                        {COMPANY_SUGGESTIONS.map(c => <option key={c} value={c} />)}
                    </datalist>

                    {experiences.map((exp, index) => (
                        <div key={index} className={`p-6 border rounded-2xl relative shadow-sm hover:shadow-md transition-all ${darkMode ? 'bg-slate-800 border-white/10' : 'bg-[#FAFAFA] border-gray-200'}`}>
                            <button
                                onClick={() => removeExperience(index)}
                                className={`absolute top-4 right-4 p-2 rounded-full transition ${darkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                                title="Remove item"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>

                            <div className="space-y-6">
                                {/* Row 1: Title and Employment Type */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-title`] ? 'text-red-500' : darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-title`] ? 'from-red-500 to-red-600' : ''}`}>
                                            <input
                                                type="text"
                                                list="job-titles"
                                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                                value={exp.title || ""}
                                                onChange={(e) => handleChange(index, "title", e.target.value)}
                                                placeholder="Ex: Retail Sales Manager"
                                            />
                                        </div>
                                        {errors[`${index}-title`] && <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1.5">{errors[`${index}-title`]}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Employment type</label>
                                        <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                                            <select
                                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                                value={exp.employmentType || ""}
                                                onChange={(e) => handleChange(index, "employmentType", e.target.value)}
                                            >
                                                <option value="">Please select</option>
                                                {EMPLOYMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Company */}
                                <div className="space-y-1.5">
                                    <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-company`] ? 'text-red-500' : darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                        Company or organization <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-company`] ? 'from-red-500 to-red-600' : ''}`}>
                                        <input
                                            type="text"
                                            list="companies"
                                            className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                            value={exp.company || ""}
                                            onChange={(e) => handleChange(index, "company", e.target.value)}
                                            placeholder="Ex: Microsoft"
                                        />
                                    </div>
                                    {errors[`${index}-company`] && <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1.5">{errors[`${index}-company`]}</p>}
                                </div>

                                {/* Checkbox: Currently working */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`current-${index}`}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        checked={exp.isCurrent}
                                        onChange={(e) => handleChange(index, "isCurrent", e.target.checked)}
                                    />
                                    <label htmlFor={`current-${index}`} className={`text-sm font-medium cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        I am currently working in this role
                                    </label>
                                </div>

                                {/* Row 3: Start Date */}
                                <div className="space-y-2">
                                    <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-startDate`] ? 'text-red-500' : darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                        Start date <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-startDate`] ? 'from-red-500 to-red-600' : ''}`}>
                                        <div className={`grid grid-cols-2 gap-2 p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                                            <select
                                                className={`w-full p-2 rounded-lg text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                                value={exp.startMonth || ""}
                                                onChange={(e) => handleChange(index, "startMonth", e.target.value)}
                                            >
                                                <option value="">Month</option>
                                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <select
                                                className={`w-full p-2 rounded-lg text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                                value={exp.startYear || ""}
                                                onChange={(e) => handleChange(index, "startYear", e.target.value)}
                                            >
                                                <option value="">Year</option>
                                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {errors[`${index}-startDate`] && <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1.5">{errors[`${index}-startDate`]}</p>}
                                </div>

                                {/* Row 4: End Date */}
                                {!exp.isCurrent && (
                                    <div className="space-y-2">
                                        <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-endDate`] ? 'text-red-500' : darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                            End date <span className="text-red-500">*</span>
                                        </label>
                                        <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-endDate`] ? 'from-red-500 to-red-600' : ''}`}>
                                            <div className={`grid grid-cols-2 gap-2 p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                                                <select
                                                    className={`w-full p-2 rounded-lg text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                                    value={exp.endMonth || ""}
                                                    onChange={(e) => handleChange(index, "endMonth", e.target.value)}
                                                >
                                                    <option value="">Month</option>
                                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                                <select
                                                    className={`w-full p-2 rounded-lg text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                                    value={exp.endYear || ""}
                                                    onChange={(e) => handleChange(index, "endYear", e.target.value)}
                                                >
                                                    <option value="">Year</option>
                                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        {errors[`${index}-endDate`] && <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1.5">{errors[`${index}-endDate`]}</p>}
                                    </div>
                                )}

                                {/* Row 5: Location Dropdowns */}
                                <div className="space-y-2">
                                    <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                        Location <MapPin className="w-3.5 h-3.5" />
                                    </label>
                                    <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-sm">
                                        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-[calc(1rem-2px)] ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                                            <select
                                                value={exp.selectedCountry}
                                                onChange={(e) => {
                                                    handleChange(index, "selectedCountry", e.target.value);
                                                    handleChange(index, "selectedState", "");
                                                    handleChange(index, "selectedCity", "");
                                                }}
                                                className={`w-full p-2 rounded-lg text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                            >
                                                <option value="">Select Country</option>
                                                {Country.getAllCountries().map((c) => (
                                                    <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                                ))}
                                            </select>

                                            <select
                                                value={exp.selectedState}
                                                disabled={!exp.selectedCountry}
                                                onChange={(e) => {
                                                    handleChange(index, "selectedState", e.target.value);
                                                    handleChange(index, "selectedCity", "");
                                                }}
                                                className={`w-full p-2 rounded-lg text-sm outline-none transition disabled:opacity-50 ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                            >
                                                <option value="">Select State</option>
                                                {exp.selectedCountry && State.getStatesOfCountry(exp.selectedCountry).map((s) => (
                                                    <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                                                ))}
                                            </select>

                                            <select
                                                value={exp.selectedCity}
                                                disabled={!exp.selectedState}
                                                onChange={(e) => handleChange(index, "selectedCity", e.target.value)}
                                                className={`w-full p-2 rounded-lg text-sm outline-none transition disabled:opacity-50 ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                            >
                                                <option value="">Select City</option>
                                                {exp.selectedState && City.getCitiesOfState(exp.selectedCountry, exp.selectedState).map((city) => (
                                                    <option key={city.name} value={city.name}>{city.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 6: Location Type */}
                                <div className="space-y-1.5 md:w-1/2">
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Location type</label>
                                    <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                                        <select
                                            className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                            value={exp.locationType || ""}
                                            onChange={(e) => handleChange(index, "locationType", e.target.value)}
                                        >
                                            <option value="">Please select</option>
                                            {LOCATION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Row 7: Description */}
                                <div className="space-y-1.5">
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Description</label>
                                    <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-sm">
                                        <textarea
                                            className={`w-full p-4 rounded-[calc(1rem-2px)] h-32 outline-none transition custom-scrollbar ${darkMode ? 'bg-[#121213] text-white placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-400'}`}
                                            value={exp.description || ""}
                                            onChange={(e) => handleChange(index, "description", e.target.value)}
                                            placeholder="Describe your achievements..."
                                        />
                                    </div>
                                </div>

                                {/* Row 8: Skills */}
                                <div className="space-y-1.5">
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Skills (Optional)</label>
                                    <div className="p-[2px] bg-gradient-to-tr from-blue-600/50 to-purple-600/50 rounded-xl shadow-sm focus-within:from-blue-600 focus-within:to-purple-600 transition-all">
                                        <input
                                            type="text"
                                            className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? 'bg-[#121213] text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                            value={exp.skills || ""}
                                            onChange={(e) => handleChange(index, "skills", e.target.value)}
                                            placeholder="Agile, React, Management (comma separated)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addExperience}
                        className={`w-full py-6 border-2 border-dashed rounded-2xl transition flex items-center justify-center gap-2 group font-bold tracking-wide ${darkMode ? 'border-white/10 text-blue-400 hover:border-blue-500 hover:bg-blue-900/10' : 'border-gray-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50'}`}
                    >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition" /> CLICK TO ADD NEW EXPERIENCE
                    </button>
                </div>

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
