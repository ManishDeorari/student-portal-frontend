import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X,
  Trash2,
  Plus,
  Save,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Award,
  Link as LinkIcon
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";
import HybridInput from "../../ui/HybridInput";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEARS = Array.from(
  { length: 50 },
  (_, i) => new Date().getFullYear() - i
);

export default function EditCertificatesModal({
  isOpen,
  onClose,
  currentCertificates,
  onSave,
}) {
  const { darkMode } = useTheme();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [collapsedCards, setCollapsedCards] = useState({});

  const toggleCollapse = (index) =>
    setCollapsedCards((prev) => ({ ...prev, [index]: !prev[index] }));

  useEffect(() => {
    if (currentCertificates && isOpen) {
      const transformed = currentCertificates.map((cert) => {
        const [cMonth, cYear] = (cert.issueDate || "").split(" ");
        return {
          ...cert,
          issueMonth: cMonth || "",
          issueYear: cYear || "",
          proofImage: cert.proofImage || "",
          proofImageFile: null,
          credentialUrl: cert.credentialUrl || ""
        };
      });
      setCertificates(transformed);
    }
  }, [currentCertificates, isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, field, value) => {
    const updated = [...certificates];
    updated[index][field] = value;
    setCertificates(updated);

    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const addCertificate = () => {
    setCertificates([
      ...certificates,
      {
        name: "",
        issuer: "",
        issueMonth: "",
        issueYear: "",
        credentialUrl: "",
        proofImage: "",
        proofImageFile: null,
      },
    ]);
  };

  const removeCertificate = (index) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      handleChange(index, "proofImageFile", file);
      handleChange(index, "proofImage", URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {};
    certificates.forEach((cert, idx) => {
      if (!cert.name) newErrors[`${idx}-name`] = "Certificate Name is required";
      if (!cert.issuer) newErrors[`${idx}-issuer`] = "Issuer is required";
      if (!cert.issueMonth || !cert.issueYear)
        newErrors[`${idx}-issueDate`] = "Issue date is required";
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
      const uploadedCertificates = await Promise.all(
        certificates.map(async (cert) => {
          let proofImageUrl = cert.proofImage;

          if (cert.proofImageFile) {
            const formData = new FormData();
            formData.append("file", cert.proofImageFile);
            formData.append(
              "upload_preset",
              process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
            );
            formData.append("folder", "certificates");

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
                toast.error(`Failed to upload proof image for ${cert.name}`);
              }
            } catch (err) {
              console.error("Cloudinary upload error:", err);
            }
          }

          return { ...cert, proofImage: proofImageUrl };
        }),
      );

      const finalData = uploadedCertificates.map((cert) => ({
        name: cert.name,
        issuer: cert.issuer,
        issueDate: `${cert.issueMonth} ${cert.issueYear}`,
        credentialUrl: cert.credentialUrl,
        proofImage: cert.proofImage,
      }));

      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ certificates: finalData }),
        },
      );

      if (!res.ok) throw new Error("Failed to update certificates");

      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onSave(updatedUser);
      toast.success("Certificates updated successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error updating certificates");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

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
                <ShieldCheck className="w-5 h-5" /> Edit Certificates
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
                  <div className="text-sm leading-relaxed">
                    <p className="font-bold mb-0.5">Earn Points!</p>
                    <p>Add a valid Proof Image for your Certificates to earn Activity Points once approved by an administrator!</p>
                  </div>
                </div>
              </div>

              {certificates.map((cert, index) => (
                <div
                  key={index}
                  className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_10px_30px_rgba(37,99,235,0.2)] transition-all duration-300"
                >
                  <div
                    className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} rounded-[calc(2.5rem-2.5px)] overflow-hidden shadow-2xl`}
                  >
                    {/* Header Section */}
                    <div
                      onClick={() => toggleCollapse(index)}
                      className={`p-5 flex items-center justify-between cursor-pointer select-none border-b border-dashed ${darkMode ? "border-white/10" : "border-gray-200"} ${!collapsedCards[index] ? (darkMode ? "bg-blue-600/10" : "bg-blue-50/50") : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-blue-500 transition-transform duration-300">
                          {!collapsedCards[index] ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                        <h3
                          className={`font-black uppercase tracking-tight text-sm ${!collapsedCards[index] ? "text-blue-500" : darkMode ? "text-slate-300" : "text-gray-700"}`}
                        >
                          {cert.name || "New Certificate"}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCertificate(index);
                        }}
                        className={`p-2 rounded-xl transition-all ${darkMode ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}
                        title="Remove Certificate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Form Section */}
                    {!collapsedCards[index] && (
                      <div className="p-5 sm:p-8 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-name`] ? 'text-red-500' : (darkMode ? 'text-blue-400' : 'text-blue-600')}`}>
                              Certificate Name <span className="text-red-500 font-bold">*</span>
                            </label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-name`] ? 'from-red-500 to-red-600' : ''}`}>
                              <div className={`flex items-center p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                                <ShieldCheck className={`w-5 h-5 ml-2 ${darkMode ? "text-slate-400" : "text-gray-400"}`} />
                                <input
                                  type="text"
                                  className={`w-full p-2 text-sm outline-none bg-transparent ${darkMode ? "text-white placeholder-slate-500" : "text-black placeholder-gray-400"}`}
                                  value={cert.name}
                                  onChange={(e) => handleChange(index, "name", e.target.value)}
                                  placeholder="e.g. AWS Certified Solutions Architect"
                                />
                              </div>
                            </div>
                            {errors[`${index}-name`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1.5 ml-1">{errors[`${index}-name`]}</p>}
                          </div>

                          <div className="sm:col-span-2 space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-issuer`] ? 'text-red-500' : (darkMode ? 'text-blue-400' : 'text-blue-600')}`}>
                              Issuing Organization <span className="text-red-500 font-bold">*</span>
                            </label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-issuer`] ? 'from-red-500 to-red-600' : ''}`}>
                              <div className={`flex items-center p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                                <Award className={`w-5 h-5 ml-2 ${darkMode ? "text-slate-400" : "text-gray-400"}`} />
                                <input
                                  type="text"
                                  className={`w-full p-2 text-sm outline-none bg-transparent ${darkMode ? "text-white placeholder-slate-500" : "text-black placeholder-gray-400"}`}
                                  value={cert.issuer}
                                  onChange={(e) => handleChange(index, "issuer", e.target.value)}
                                  placeholder="e.g. Amazon Web Services"
                                />
                              </div>
                            </div>
                            {errors[`${index}-issuer`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1.5 ml-1">{errors[`${index}-issuer`]}</p>}
                          </div>

                          {/* Date */}
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-issueDate`] ? 'text-red-500' : (darkMode ? 'text-blue-400' : 'text-blue-600')}`}>
                              Issue Date *
                            </label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-issueDate`] ? 'from-red-500 to-red-600' : ''}`}>
                              <div className={`grid grid-cols-2 gap-2 p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                                <select
                                  value={cert.issueMonth}
                                  onChange={(e) =>
                                    handleChange(
                                      index,
                                      "issueMonth",
                                      e.target.value,
                                    )
                                  }
                                  className={`w-full p-2 rounded-lg text-sm outline-none bg-transparent ${darkMode ? "text-white border-none" : "text-gray-900 border-none"}`}
                                >
                                  <option value="" disabled>
                                    Month
                                  </option>
                                  {MONTHS.map((m) => (
                                    <option key={m} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={cert.issueYear}
                                  onChange={(e) =>
                                    handleChange(
                                      index,
                                      "issueYear",
                                      e.target.value,
                                    )
                                  }
                                  className={`w-full p-2 rounded-lg text-sm outline-none bg-transparent ${darkMode ? "text-white border-none" : "text-gray-900 border-none"}`}
                                >
                                  <option value="" disabled>
                                    Year
                                  </option>
                                  {YEARS.map((y) => (
                                    <option key={y} value={y}>
                                      {y}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {errors[`${index}-issueDate`] && (
                              <p className="text-red-500 text-[10px] font-bold uppercase mt-1.5 ml-1">
                                {errors[`${index}-issueDate`]}
                              </p>
                            )}
                          </div>

                          <div className="sm:col-span-2 space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-credentialUrl`] ? 'text-red-500' : (darkMode ? 'text-blue-400' : 'text-blue-600')}`}>
                              Credential URL <span className="text-red-500 font-bold">*</span>
                            </label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-credentialUrl`] ? 'from-red-500 to-red-600' : ''}`}>
                              <div className={`flex items-center p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                                <LinkIcon className={`w-5 h-5 ml-2 ${darkMode ? "text-slate-400" : "text-gray-400"}`} />
                                <input
                                  type="text"
                                  className={`w-full p-2 text-sm outline-none bg-transparent ${darkMode ? "text-white placeholder-slate-500" : "text-black placeholder-gray-400"}`}
                                  value={cert.credentialUrl}
                                  onChange={(e) => handleChange(index, "credentialUrl", e.target.value)}
                                  placeholder="e.g. https://www.credly.com/badges/..."
                                />
                              </div>
                            </div>
                            {errors[`${index}-credentialUrl`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1.5 ml-1">{errors[`${index}-credentialUrl`]}</p>}
                          </div>

                          {/* Proof Image Section */}
                          <div className={`sm:col-span-2 mt-4 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                            <div className={`p-4 rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                              <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                                Proof Image (Certificate Image / Screenshot)
                              </label>
                              
                              {cert.proofImage ? (
                                <div className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 max-w-sm">
                                  <img src={cert.proofImage} alt="Proof Preview" className="w-full h-auto object-cover max-h-48" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <label className="cursor-pointer px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-bold shadow-lg hover:scale-105 transition-transform">
                                      Change Image
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(index, e)}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>
                                </div>
                              ) : (
                                <label className={`cursor-pointer w-full max-w-sm flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors ${darkMode ? "border-white/20 hover:border-blue-500 hover:bg-blue-500/10" : "border-gray-300 hover:border-blue-500 hover:bg-blue-50/50"}`}>
                                  <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                  <span className={`text-sm font-medium ${darkMode ? "text-white" : "text-black"}`}>Click to upload proof</span>
                                  <span className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>PNG, JPG, up to 2MB</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(index, e)}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addCertificate}
                className={`w-full py-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:border-solid hover:scale-[1.01] ${darkMode ? "border-blue-500/30 hover:border-blue-500 bg-blue-500/5 text-blue-400" : "border-blue-200 hover:border-blue-500 bg-blue-50 text-blue-600"}`}
              >
                <div className={`p-2 rounded-full ${darkMode ? "bg-blue-500/20" : "bg-blue-100"}`}>
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-bold">Add Certificate</span>
              </button>
            </div>

            {/* Footer */}
            <div className={`p-4 md:p-6 border-t flex justify-end gap-3 flex-shrink-0 ${darkMode ? "bg-[#121213] border-white/10" : "bg-gray-50 border-gray-200"}`}>
              <button
                onClick={onClose}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${darkMode ? "bg-[#1A1A1B] text-slate-300 hover:bg-slate-800 border border-white/10" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Certificates
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
