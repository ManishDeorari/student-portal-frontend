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
  Link as LinkIcon,
  ExternalLink
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";
import ImageViewerModal from "../ImageViewerModal";
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
  const [selectedProofImage, setSelectedProofImage] = useState(null);

  const toggleCollapse = (index) =>
    setCollapsedCards((prev) => ({ ...prev, [index]: !prev[index] }));

  useEffect(() => {
    if (currentCertificates && isOpen) {
      const transformed = currentCertificates.map((cert) => {
        let cMonth = "",
          cYear = "";
        if (cert.issueDate) {
          const parts = cert.issueDate.split(" ");
          if (parts.length === 2) {
            cMonth = parts[0];
            cYear = parts[1];
          }
        }
        return {
          name: cert.name || "",
          issuer: cert.issuer || "",
          issueMonth: cMonth || "",
          issueYear: cYear || "",
          duration: cert.duration || "",
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
        duration: "",
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
        duration: cert.duration,
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
                    <p>Add up to 5 Certificates with a valid Proof Image to earn 2 points each (Maximum 10 points total).</p>
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
                              <input
                                type="text"
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                                value={cert.name}
                                onChange={(e) => handleChange(index, "name", e.target.value)}
                                placeholder="e.g. AWS Certified Solutions Architect"
                              />
                            </div>
                            {errors[`${index}-name`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1.5 ml-1">{errors[`${index}-name`]}</p>}
                          </div>

                          <div className="sm:col-span-2 space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-issuer`] ? 'text-red-500' : (darkMode ? 'text-blue-400' : 'text-blue-600')}`}>
                              Issuing Organization <span className="text-red-500 font-bold">*</span>
                            </label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-issuer`] ? 'from-red-500 to-red-600' : ''}`}>
                              <input
                                type="text"
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                                value={cert.issuer}
                                onChange={(e) => handleChange(index, "issuer", e.target.value)}
                                placeholder="e.g. Amazon Web Services"
                              />
                            </div>
                            {errors[`${index}-issuer`] && <p className="text-red-500 text-[10px] font-bold uppercase mt-1.5 ml-1">{errors[`${index}-issuer`]}</p>}
                          </div>

                          {/* Issue Date */}
                          <div className="sm:col-span-2 space-y-1.5 mt-4">
                            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${errors[`${index}-issueDate`] ? "text-red-500" : darkMode ? "text-blue-400" : "text-blue-600"}`}>
                              Issue Date <span className="text-red-500 font-bold">*</span>
                            </label>
                            <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${index}-issueDate`] ? "from-red-500 to-red-600" : ""}`}>
                              <div className={`grid grid-cols-2 gap-2 p-1 rounded-[calc(0.75rem-2px)] ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                                <select
                                  className={`w-full p-2 rounded-lg text-sm outline-none ${darkMode ? "bg-[#121213] text-white border-none" : "bg-white text-gray-900 border-none"}`}
                                  value={cert.issueMonth || ""}
                                  onChange={(e) => handleChange(index, "issueMonth", e.target.value)}
                                >
                                  <option value="">Month</option>
                                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select
                                  className={`w-full p-2 rounded-lg text-sm outline-none ${darkMode ? "bg-[#121213] text-white border-none" : "bg-white text-gray-900 border-none"}`}
                                  value={cert.issueYear || ""}
                                  onChange={(e) => handleChange(index, "issueYear", e.target.value)}
                                >
                                  <option value="">Year</option>
                                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                                </select>
                              </div>
                            </div>
                            {errors[`${index}-issueDate`] && <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1.5">{errors[`${index}-issueDate`]}</p>}
                          </div>

                          {/* Duration */}
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                              Duration <span className={`text-[10px] font-medium normal-case ${darkMode ? "text-slate-300" : "text-gray-600"}`}>(Optional — for courses)</span>
                            </label>
                            <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                              <input
                                type="text"
                                placeholder="e.g. 3 Months, 40 Hours"
                                value={cert.duration || ""}
                                onChange={(e) => handleChange(index, "duration", e.target.value)}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                              />
                            </div>
                          </div>

                          {/* Credential URL */}
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                              Credential URL <span className={`text-[10px] font-medium normal-case ${darkMode ? "text-slate-300" : "text-gray-600"}`}>(Optional — verify certificate online)</span>
                            </label>
                            <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm">
                              <input
                                type="url"
                                placeholder="https://www.credly.com/badges/..."
                                value={cert.credentialUrl || ""}
                                onChange={(e) => handleChange(index, "credentialUrl", e.target.value)}
                                className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] text-sm outline-none transition ${darkMode ? "bg-[#121213] text-white placeholder-slate-500" : "bg-white text-gray-900 placeholder-gray-400"}`}
                              />
                            </div>
                          </div>

                          {/* Proof Image Section */}
                          <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm mt-4 sm:col-span-2`}>
                            <div className={`p-4 rounded-[calc(0.75rem-2px)] flex flex-col gap-4 ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                              <div className="space-y-2">
                                <label
                                  className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                                >
                                  Proof Image (Certificate Image / Screenshot)
                                </label>
                                <div className="flex flex-col gap-2">
                                  {cert.proofImage && !cert.proofImageFile && (
                                    <div className="flex flex-wrap items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedProofImage(cert.proofImage)}
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
                                  {cert.proofImageFile && (
                                    <span className="text-xs font-bold text-green-500">
                                      {cert.proofImageFile.name} (Ready to upload)
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
            <div className={`p-4 md:p-6 border-t flex justify-end gap-3 flex-shrink-0 transition-all ${darkMode ? "bg-slate-800 border-white/5" : "bg-gray-50 border-gray-200"}`}>
              <button
                onClick={onClose}
                className={`px-6 py-2.5 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm ${darkMode ? "border-white text-white hover:bg-white/10" : "border-black text-black hover:bg-gray-100"}`}
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

      {selectedProofImage && (
        <ImageViewerModal
          imageUrl={selectedProofImage}
          onClose={() => setSelectedProofImage(null)}
          isRestricted={false}
        />
      )}
    </>
  );
}
