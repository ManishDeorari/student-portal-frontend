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
    let processedValue = value;

    if (field === "title" || field === "company") {
      processedValue = processedValue.replace(/[^a-zA-Z0-9\s\.\-]/g, '');
    }

    const updated = [...experiences];
    updated[index][field] = processedValue;
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
