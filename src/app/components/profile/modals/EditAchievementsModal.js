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
    const updated = [...achievements];
    updated[index][field] = value;
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
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className={`p-4 md:p-6 space-y-8 overflow-y-auto custom-scrollbar flex-grow transition-colors ${darkMode ? "bg-[#121213]" : "bg-gray-50/30"}`}
            >
              {/* Guide Text */}
              <div className="p-[2px] bg-gradient-to-tr from-blue-600 via-violet-500 to-purple-600 rounded-xl mb-6">
                <div className={`p-4 rounded-[calc(0.75rem-2px)] flex items-start gap-3 ${darkMode ? "bg-[#121213] text-blue-300" : "bg-blue-50 text-blue-800"}`}>
                  <Award className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm leading-relaxed space-y-1">
                    <p className="font-black uppercase tracking-wide">Earn Points for Achievements!</p>
                    <p>Add up to <span className="font-black">3 achievements with a valid Link OR Proof Image</span> to earn <span className="font-black">15 points each</span> (maximum <span className="font-black">45 points</span> total).</p>
                    <div className={`mt-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest rounded-lg px-3 py-1.5 w-max ${darkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
                      <span>
                        {achWithProof >= 3
                          ? `✅ ${achPointsEarning}/45 pts — Maximum reached!`
                          : `${achWithProof}/3 entries with proof — Currently earning ${achPointsEarning}/45 pts`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {achievements.map((ach, index) => (
                <div
                  key={index}
                  className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_10px_30px_rgba(99,102,241,0.2)] transition-all duration-300"
                >
                  <div
                    className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-[calc(2.5rem-2.5px)] overflow-hidden shadow-2xl`}
                  >
                    {/* Card Header */}
                    <div
                      onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                      className={`p-5 flex items-center justify-between cursor-pointer select-none border-b border-dashed transition-colors ${darkMode ? "border-white/10" : "border-gray-200"} ${expandedIndex === index ? (darkMode ? "bg-blue-600/10" : "bg-blue-50/50") : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-blue-500 transition-transform">
                          {expandedIndex === index ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h3
                            className={`font-black uppercase tracking-tight text-sm ${expandedIndex === index ? "text-blue-500" : darkMode ? "text-slate-300" : "text-gray-700"}`}
                          >
                            {ach.title || `New Achievement ${index + 1}`}
                          </h3>
                          {(ach.proofImage || ach.link) && (
                            <span className="text-[10px] text-green-500 font-black uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Proof Added — Earning 15 pts
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAchievement(index);
                        }}
                        className={`p-2 rounded-xl transition-all ${darkMode ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}
                        title="Remove Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Card Form */}
                    {expandedIndex === index && (
                      <div className="p-5 sm:p-8 space-y-6">
                        {/* Title - Full Row */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-title`] ? "text-red-500" : darkMode ? "text-blue-400" : "text-blue-600"}`}>
                            Achievement Title <span className="text-red-500">*</span>
                          </label>
                          <div className={`p-[2px] bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl ${errors[`${index}-title`] ? "from-red-500 to-red-600" : ""}`}>
                            <input
                              type="text"
                              value={ach.title}
                              onChange={(e) => handleChange(index, "title", e.target.value)}
                              placeholder="e.g. 1st Place - National Hackathon"
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                            />
                          </div>
                          {errors[`${index}-title`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors[`${index}-title`]}</p>}
                        </div>

                        {/* Date - Full Row with Dropdowns */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-date`] ? "text-red-500" : darkMode ? "text-teal-400" : "text-teal-600"}`}>
                            <Calendar className="w-3.5 h-3.5" /> Date (Month & Year) <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-4">
                            <div className={`flex-1 p-[2px] bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-xl ${errors[`${index}-date`] ? "from-red-500 to-red-600" : ""}`}>
                              <select
                                value={ach.month}
                                onChange={(e) => handleChange(index, "month", e.target.value)}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition cursor-pointer appearance-none ${darkMode ? "bg-[#121213] text-white" : "bg-white text-gray-900"}`}
                              >
                                <option value="" disabled>Month</option>
                                {MONTHS.map((m) => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </select>
                            </div>
                            <div className={`flex-1 p-[2px] bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-xl ${errors[`${index}-date`] ? "from-red-500 to-red-600" : ""}`}>
                              <select
                                value={ach.year}
                                onChange={(e) => handleChange(index, "year", e.target.value)}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition cursor-pointer appearance-none ${darkMode ? "bg-[#121213] text-white" : "bg-white text-gray-900"}`}
                              >
                                <option value="" disabled>Year</option>
                                {YEARS.map((y) => (
                                  <option key={y} value={y}>{y}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          {errors[`${index}-date`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors[`${index}-date`]}</p>}
                        </div>

                        {/* Description - Full Row */}
                        <div className="space-y-1.5">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-description`] ? "text-red-500" : darkMode ? "text-purple-400" : "text-purple-600"}`}>
                            Description <span className="text-red-500">*</span>
                          </label>
                          <div className={`p-[2px] bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl ${errors[`${index}-description`] ? "from-red-500 to-red-600" : ""}`}>
                            <textarea
                              rows={3}
                              value={ach.description}
                              onChange={(e) => handleChange(index, "description", e.target.value)}
                              placeholder="Describe what you achieved, why it's important, etc..."
                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition resize-none ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                            />
                          </div>
                          {errors[`${index}-description`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors[`${index}-description`]}</p>}
                        </div>

                        {/* Proof Tabs */}
                        <div className="space-y-4 pt-4 border-t border-dashed border-gray-200 dark:border-white/10">
                          <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? "text-orange-400" : "text-orange-600"}`}>
                            Provide Proof (Optional)
                          </label>
                          <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => handleChange(index, "activeTab", "link")}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${ach.activeTab === "link" ? "bg-orange-500 text-white" : darkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                                <LinkIcon className="w-3.5 h-3.5 inline mr-1" /> Add Link
                            </button>
                            <button
                                type="button"
                                onClick={() => handleChange(index, "activeTab", "image")}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${ach.activeTab === "image" ? "bg-orange-500 text-white" : darkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                                <ImageIcon className="w-3.5 h-3.5 inline mr-1" /> Upload Image
                            </button>
                          </div>

                          {ach.activeTab === "link" && (
                            <div className="space-y-1.5 animate-fadeIn">
                              <div className="p-[2px] bg-gradient-to-tr from-orange-400 to-red-500 rounded-xl">
                                <input
                                  type="url"
                                  value={ach.link}
                                  onChange={(e) => handleChange(index, "link", e.target.value)}
                                  placeholder="https://..."
                                  className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                                />
                              </div>
                              <div className={`mt-2 p-[2px] rounded-xl bg-gradient-to-tr ${ach.isLinkPublic ? 'from-green-500 to-emerald-500' : 'from-slate-500 to-gray-600'}`}>
                                <label className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-[calc(0.75rem-2px)] cursor-pointer ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                                  <div className="flex items-center gap-2">
                                    {ach.isLinkPublic ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                                    <div>
                                      <p className={`text-xs font-black uppercase tracking-widest ${ach.isLinkPublic ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-slate-400' : 'text-gray-500')}`}>
                                        {ach.isLinkPublic ? "Link is Public" : "Link is Private"}
                                      </p>
                                    </div>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={ach.isLinkPublic}
                                    onChange={(e) => handleChange(index, "isLinkPublic", e.target.checked)}
                                    className="w-4 h-4 accent-green-600"
                                  />
                                </label>
                              </div>
                            </div>
                          )}

                          {ach.activeTab === "image" && (
                            <div className="space-y-1.5 animate-fadeIn">
                              {!ach.proofImage ? (
                                <label className={`mt-2 w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${darkMode ? "border-slate-700 hover:border-orange-500 bg-slate-800/50" : "border-gray-300 hover:border-orange-500 bg-gray-50"}`}>
                                  <div className={`p-3 rounded-full ${darkMode ? "bg-slate-800" : "bg-white"} shadow-sm`}>
                                    <Upload className={`w-6 h-6 ${darkMode ? "text-orange-400" : "text-orange-500"}`} />
                                  </div>
                                  <div className="text-center">
                                    <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-700"}`}>Click to upload proof</p>
                                    <p className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>JPG, PNG up to 5MB</p>
                                  </div>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(index, e.target.files[0])}
                                  />
                                </label>
                              ) : (
                                <div className="mt-2 space-y-3">
                                  <div className={`relative rounded-xl overflow-hidden border p-1 ${darkMode ? "border-slate-700 bg-slate-800/50" : "border-gray-200 bg-gray-50"}`}>
                                    <img
                                      src={ach.proofImage}
                                      alt="Proof Preview"
                                      className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => setSelectedProofImage({ url: ach.proofImage, title: ach.title })}
                                    />
                                    <button
                                      onClick={() => removeProofImage(index)}
                                      className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-lg backdrop-blur-md transition-all"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className={`p-[2px] rounded-xl bg-gradient-to-tr ${ach.isProofPublic ? 'from-green-500 to-emerald-500' : 'from-slate-500 to-gray-600'}`}>
                                    <label className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-[calc(0.75rem-2px)] cursor-pointer ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                                      <div className="flex items-center gap-2">
                                        {ach.isProofPublic ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                                        <div>
                                          <p className={`text-xs font-black uppercase tracking-widest ${ach.isProofPublic ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-slate-400' : 'text-gray-500')}`}>
                                            {ach.isProofPublic ? "Image is Public" : "Image is Private"}
                                          </p>
                                        </div>
                                      </div>
                                      <input
                                        type="checkbox"
                                        checked={ach.isProofPublic}
                                        onChange={(e) => handleChange(index, "isProofPublic", e.target.checked)}
                                        className="w-4 h-4 accent-green-600"
                                      />
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addAchievement}
                className={`w-full py-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:border-solid hover:scale-[1.01] ${darkMode ? "border-blue-500/30 hover:border-blue-500 bg-blue-500/5 text-blue-400" : "border-blue-200 hover:border-blue-500 bg-blue-50 text-blue-600"}`}
              >
                <div className={`p-2 rounded-full ${darkMode ? "bg-blue-500/20" : "bg-blue-100"}`}>
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-bold">Add Achievement</span>
              </button>
            </div>

            {/* Footer */}
            <div className={`p-4 md:p-6 border-t flex justify-end gap-3 flex-shrink-0 transition-colors ${darkMode ? "bg-slate-800 border-white/5" : "bg-gray-50 border-gray-200"}`}>
              <button
                onClick={onClose}
                className={`px-6 py-2.5 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${darkMode ? "border-white text-white hover:bg-white/10" : "border-black text-black hover:bg-gray-100"}`}
              >
                Cancel
              </button>
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
