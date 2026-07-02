import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X, Trash2, Plus, Save, ChevronDown, ChevronRight,
  Award, Calendar, Link as LinkIcon, Eye, EyeOff, Image as ImageIcon, Upload, Info, Globe, Lock
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";
import ImageViewerModal from "../ImageViewerModal";

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];
const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

export default function EditAchievementsModal({ isOpen, onClose, currentAchievements, onSave }) {
  const { darkMode } = useTheme();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedProofImage, setSelectedProofImage] = useState(null);

  useEffect(() => {
    if (currentAchievements && isOpen) {
      const transformed = currentAchievements.map((ach) => {
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
        setAchievements(transformed.length ? transformed : [{
        title: "", description: "", month: "", year: "",
        link: "", isLinkPublic: false, proofImage: "", proofImageFile: null, isProofPublic: false, activeTab: 'link'
      }]);
      setExpandedIndex(null);
    } else {
        setAchievements([]);
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

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
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
        title: "", description: "", month: "", year: "",
        link: "", isLinkPublic: false, proofImage: "", proofImageFile: null, isProofPublic: false, activeTab: 'link'
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
      const hasData = ach.title || ach.description || ach.month || ach.year;
      if (hasData) {
        if (!ach.title.trim()) newErrors[`${idx}-title`] = "Title is required";
        if (!ach.month || !ach.year) newErrors[`${idx}-date`] = "Month and Year are required";
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
      const validAchievements = achievements.filter(ach => ach.title || ach.description || ach.month || ach.year);

      const uploadedAchievements = await Promise.all(
        validAchievements.map(async (ach) => {
          let proofImageUrl = ach.proofImage;
          if (ach.proofImageFile) {
            const formData = new FormData();
            formData.append("file", ach.proofImageFile);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            formData.append("folder", "achievements");

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
        })
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const achWithProof = achievements.filter(
    (a) => (a.proofImage && a.proofImage.trim().length > 0 && !a.proofImage.startsWith("blob")) || (a.link && a.link.trim().length > 0)
  ).length;
  const achPointsEarning = Math.min(achWithProof, 3) * 15;

  return (
    <>
      <LoadingOverlay isVisible={loading} />
      <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(99,102,241,0.4)] w-full max-w-4xl max-h-[95dvh] sm:max-h-[90vh]">
          <div className={`rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden animate-fadeIn flex flex-col transition-colors duration-500 max-h-[90vh] ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white shrink-0">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Award className="w-5 h-5" /> Edit Achievements
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
                          <p>Add proof images or links for your achievements to earn profile points! (Max 3 proofs, 15 pts each). Current points: <span className="font-bold text-blue-600 dark:text-blue-400">{achPointsEarning} / 45</span></p>
                      </div>
                  </div>
              </div>

              {achievements.map((ach, idx) => (
                <div key={idx} className={`p-[2px] rounded-xl shadow-sm transition-all duration-300 bg-gradient-to-tr from-blue-600 to-purple-600 ${expandedIndex === idx ? 'scale-[1.01]' : 'hover:scale-[1.01]'}`}>
                  <div className={`p-4 rounded-[calc(1rem-2px)] h-full ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                    <div 
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setExpandedIndex(expandedIndex === idx ? -1 : idx)}
                    >
                        <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-blue-500" />
                            <div>
                                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {ach.title || "New Achievement"}
                                </h3>
                                {ach.year && <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{ach.month} {ach.year}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); removeAchievement(idx); }}
                                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            {expandedIndex === idx ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                    </div>

                    {expandedIndex === idx && (
                        <div className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-white/10">
                            
                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Title <span className="text-red-500">*</span></label>
                                <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-title`] ? 'from-red-500 to-red-600' : ''}`}>
                                    <input
                                        type="text"
                                        value={ach.title}
                                        onChange={(e) => handleChange(idx, "title", e.target.value)}
                                        className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        placeholder="Ex: 1st Place Hackathon, Best Employee Award"
                                    />
                                </div>
                                {errors[`${idx}-title`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-title`]}</p>}
                            </div>

                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>Date <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <div className={`w-1/2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-date`] ? 'from-red-500 to-red-600' : ''}`}>
                                        <select
                                            value={ach.month}
                                            onChange={(e) => handleChange(idx, "month", e.target.value)}
                                            className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        >
                                            <option value="">Month</option>
                                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className={`w-1/2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-date`] ? 'from-red-500 to-red-600' : ''}`}>
                                        <select
                                            value={ach.year}
                                            onChange={(e) => handleChange(idx, "year", e.target.value)}
                                            className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        >
                                            <option value="">Year</option>
                                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {errors[`${idx}-date`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-date`]}</p>}
                            </div>

                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Description <span className="text-red-500">*</span></label>
                                <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                                    <textarea
                                        value={ach.description}
                                        onChange={(e) => handleChange(idx, "description", e.target.value)}
                                        rows={3}
                                        className={`w-full p-3 rounded-[calc(0.75rem-2px)] outline-none transition resize-none ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                        placeholder="Describe your achievement..."
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className={`block text-xs font-black uppercase tracking-widest ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Proof <span className="text-pink-500 font-bold lowercase tracking-normal bg-pink-500/10 px-1.5 py-0.5 rounded ml-1">(Needed for points)</span></label>
                                    <div className={`flex rounded-lg overflow-hidden p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 shadow-sm`}>
                                        <div className={`flex w-full rounded-[calc(0.5rem-2px)] overflow-hidden ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                                            <button
                                                onClick={() => handleChange(idx, 'activeTab', 'link')}
                                                className={`flex-1 px-3 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 transition ${ach.activeTab === 'link' ? (darkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900') : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
                                            >
                                                <LinkIcon className="w-3.5 h-3.5" /> URL Link
                                            </button>
                                            <button
                                                onClick={() => handleChange(idx, 'activeTab', 'image')}
                                                className={`flex-1 px-3 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 transition ${ach.activeTab === 'image' ? (darkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900') : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
                                            >
                                                <ImageIcon className="w-3.5 h-3.5" /> Image Proof
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {ach.activeTab === 'link' ? (
                                    <div className="flex flex-col gap-2">
                                        <div className={`relative p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                                            <LinkIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                                            <input
                                                type="text"
                                                value={ach.link}
                                                onChange={(e) => handleChange(idx, "link", e.target.value)}
                                                className={`w-full p-2.5 pl-10 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm mt-1`}>
                                            <div className={`p-1.5 rounded-[calc(0.75rem-2px)] flex gap-1 ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); handleChange(idx, "isLinkPublic", true); }}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                                                        ach.isLinkPublic 
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' 
                                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/5'
                                                    }`}
                                                >
                                                    <Globe className="w-4 h-4" /> Public
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); handleChange(idx, "isLinkPublic", false); }}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                                                        !ach.isLinkPublic 
                                                            ? 'bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-md' 
                                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/5'
                                                    }`}
                                                >
                                                    <Lock className="w-4 h-4" /> Private
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                                            <div className={`flex items-center gap-4 p-3 rounded-[calc(0.75rem-2px)] ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                                {ach.proofImage ? (
                                                    <div className="relative w-16 h-16 rounded-[10px] overflow-hidden border border-gray-300 dark:border-white/20">
                                                        <img src={ach.proofImage} alt="Proof preview" className="w-full h-full object-cover" />
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
                                                        id={`ach-proof-${idx}`}
                                                        className="hidden"
                                                        onChange={(e) => handleFileChange(idx, e)}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <label htmlFor={`ach-proof-${idx}`} className={`cursor-pointer inline-block px-4 py-2 rounded-lg text-sm font-bold transition border border-gray-300 dark:border-white/20 ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}>
                                                            {ach.proofImage ? "Change Image" : "Upload Proof Image"}
                                                        </label>
                                                        {ach.proofImage && (
                                                            <button 
                                                                onClick={() => removeProofImage(idx)}
                                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                                                title="Remove Image"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Max 5MB (JPG, PNG)</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm mt-1`}>
                                            <div className={`p-1.5 rounded-[calc(0.75rem-2px)] flex gap-1 ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); handleChange(idx, "isProofPublic", true); }}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                                                        ach.isProofPublic 
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' 
                                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/5'
                                                    }`}
                                                >
                                                    <Globe className="w-4 h-4" /> Public
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); handleChange(idx, "isProofPublic", false); }}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                                                        !ach.isProofPublic 
                                                            ? 'bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-md' 
                                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/5'
                                                    }`}
                                                >
                                                    <Lock className="w-4 h-4" /> Private
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm w-full transition-all hover:scale-[1.01]">
                  <button
                      onClick={addAchievement}
                      className={`w-full py-4 rounded-[calc(0.75rem-2px)] flex items-center justify-center gap-2 font-bold ${darkMode ? 'bg-[#121213] text-white hover:bg-[#1a1a1b]' : 'bg-white text-black hover:bg-gray-50'}`}
                  >
                      <Plus className="w-5 h-5" /> Add Another Achievement
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
              title="Achievement Proof"
          />
      )}
    </>
  );
}


