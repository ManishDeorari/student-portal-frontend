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
  Award,
  Calendar,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";
import ImageViewerModal from "../ImageViewerModal";

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const YEARS = Array.from(
  { length: 50 },
  (_, i) => new Date().getFullYear() - i
);

export default function EditAchievementsModal({
  isOpen,
  onClose,
  currentAchievements,
  onSave,
}) {
  const { darkMode } = useTheme();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedProofImage, setSelectedProofImage] = useState(null);

  useEffect(() => {
    if (currentAchievements && isOpen) {
      const transformed = currentAchievements.map((ach) => {
        // Parse "Month Year" from ach.date
        let mMonth = "";
        let mYear = "";
        if (ach.date) {
            const parts = ach.date.split(" ");
            if (parts.length === 2) {
                mMonth = parts[0];
                mYear = parts[1];
            } else {
                mYear = parts[0] || "";
            }
        }

        return {
          title: ach.title || "",
          description: ach.description || "",
          month: mMonth,
          year: mYear,
          link: ach.link || "",
          isLinkPublic: ach.isLinkPublic || false,
          proofImage: ach.proofImage || "",
          proofImageFile: null,
          isProofPublic: ach.isProofPublic || false,
          activeTab: ach.proofImage ? 'image' : 'link'
        };
      });
      setAchievements(transformed);
    }
  }, [currentAchievements, isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, field, value) => {
    let processedValue = value;

    if (field === "title") {
      processedValue = processedValue.replace(/[^a-zA-Z0-9\s\.\-]/g, '');
    }

    const updated = [...achievements];
    updated[index][field] = processedValue;
    setAchievements(updated);
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const handleFileChange = (index, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    const updated = [...achievements];
    updated[index].proofImageFile = file;
    updated[index].proofImage = URL.createObjectURL(file);
    setAchievements(updated);
  };

  const removeProofImage = (index) => {
    const updated = [...achievements];
    updated[index].proofImage = "";
    updated[index].proofImageFile = null;
    updated[index].isProofPublic = false;
    setAchievements(updated);
  };

  const addAchievement = () => {
    setAchievements([
      ...achievements,
      {
        title: "",
        description: "",
        month: "",
        year: "",
        link: "",
        isLinkPublic: false,
        proofImage: "",
        proofImageFile: null,
        isProofPublic: false,
        activeTab: 'link'
      },
    ]);
    setExpandedIndex(achievements.length);
  };

  const removeAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    achievements.forEach((ach, idx) => {
      if (!ach.title.trim()) newErrors[`${idx}-title`] = "Title is required";
      if (!ach.month || !ach.year) newErrors[`${idx}-date`] = "Month and Year are required";
      if (!ach.description.trim()) newErrors[`${idx}-description`] = "Description is required";
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
      const uploadedAchievements = await Promise.all(
        achievements.map(async (ach) => {
          let proofImageUrl = ach.proofImage;

          if (ach.proofImageFile) {
            const formData = new FormData();
            formData.append("file", ach.proofImageFile);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            formData.append("folder", "achievements_proof");

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
                toast.error(`Failed to upload proof image for ${ach.title}`);
              }
            } catch (err) {
              console.error("Cloudinary upload error:", err);
            }
          }

          return { ...ach, proofImage: proofImageUrl };
        }),
      );

      const finalData = uploadedAchievements.map((ach) => ({
        title: ach.title.trim(),
        description: ach.description.trim(),
        date: `${ach.month} ${ach.year}`.trim(),
        link: ach.link.trim(),
        isLinkPublic: ach.isLinkPublic,
        proofImage: ach.proofImage,
        isProofPublic: ach.isProofPublic,
      }));

      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ achievements: finalData }),
      });

      if (!res.ok) throw new Error("Failed to update achievements");

      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onSave(updatedUser);
      toast.success("Achievements updated successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error updating achievements");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const achWithProof = achievements.filter(
    (a) => (a.proofImage && a.proofImage.trim().length > 0) || (a.link && a.link.trim().length > 0)
  ).length;
  const achPointsEarning = Math.min(achWithProof, 3) * 15;

  return (
    <>
      <LoadingOverlay isVisible={loading} />
      <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-2 md:p-4 text-gray-900">
        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(99,102,241,0.4)] w-full max-w-3xl">
          <div
            className={`rounded-[calc(1rem-2.5px)] sm:rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden animate-fadeIn max-h-[95dvh] sm:max-h-[90vh] flex flex-col transition-colors duration-500 ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"}`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Award className="w-5 h-5" /> Edit Achievements
              </h2>
              
              <div className="flex items-center">
<button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Save Entries
                  </>
                )}
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
        </div>
      </div>

      {selectedProofImage && (
        <ImageViewerModal
          imageUrl={selectedProofImage.url}
          downloadName={`${selectedProofImage.title} - Proof`}
          onClose={() => setSelectedProofImage(null)}
        />
      )}
    </>
  );
}
