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
  ShieldCheck,
  Calendar,
  Award,
  Link as LinkIcon,
  ExternalLink,
  Info,
  Globe,
  Lock
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";
import ImageViewerModal from "../ImageViewerModal";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEARS = Array.from(
  { length: new Date().getFullYear() - 1950 + 1 },
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
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedProofImage, setSelectedProofImage] = useState(null);

  const isCertComplete = (cert) =>
    cert.name && cert.issuer && cert.issueMonth && cert.issueYear;

  useEffect(() => {
    if (isOpen) {
      setExpandedIndex(null);
    }
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
          description: cert.description || "",
          duration: cert.duration || "",
          issueMonth: cMonth || "",
          issueYear: cYear || "",
          credentialUrl: cert.credentialUrl || "",
          proofImage: cert.proofImage || "",
          isPrivate: cert.isPrivate || false,
          proofImageFile: null,
        };
      });
      setCertificates(transformed.length ? transformed : [{
          name: "", issuer: "", description: "", duration: "", issueMonth: "", issueYear: "", credentialUrl: "", proofImage: "", isPrivate: false, proofImageFile: null
      }]);
    } else {
        setCertificates([]);
    }
  }, [currentCertificates, isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, field, value) => {
    let processedValue = value;
    if (field === "name" || field === "issuer") {
      processedValue = processedValue.replace(/[^a-zA-Z0-9\s\.\-]/g, '');
    }

    const updated = [...certificates];
    updated[index][field] = processedValue;
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
        description: "",
        duration: "",
        issueMonth: "",
        issueYear: "",
        credentialUrl: "",
        proofImage: "",
        isPrivate: false,
        proofImageFile: null,
      },
    ]);
    setExpandedIndex(certificates.length);
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
      const updated = [...certificates];
      updated[index].proofImageFile = file;
      updated[index].proofImage = URL.createObjectURL(file);
      setCertificates(updated);
    }
  };

  const validate = () => {
    const newErrors = {};
    certificates.forEach((cert, idx) => {
      const hasData = cert.name || cert.issuer || cert.issueMonth || cert.issueYear || cert.description;
      if (hasData) {
        if (!cert.name) newErrors[`${idx}-name`] = "Certificate Name is required";
        if (!cert.issuer) newErrors[`${idx}-issuer`] = "Issuer is required";
        if (!cert.issueMonth || !cert.issueYear)
            newErrors[`${idx}-issueDate`] = "Issue date is required";
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
      const validCertificates = certificates.filter(cert => cert.name || cert.issuer || cert.issueMonth || cert.issueYear);

      const uploadedCertificates = await Promise.all(
        validCertificates.map(async (cert) => {
          let proofImageUrl = cert.proofImage;

          if (cert.proofImageFile) {
            const formData = new FormData();
            formData.append("file", cert.proofImageFile);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
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
                proofImageUrl = data.public_id ? `${data.public_id}.${data.format}` : data.secure_url;
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
        description: cert.description,
        credentialUrl: cert.credentialUrl,
        proofImage: cert.proofImage,
        isPrivate: cert.isPrivate,
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

  const expWithProof = certificates.filter(e => e.proofImage && e.proofImage.trim().length > 0 && !e.proofImage.startsWith("blob")).length;
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
                    <ShieldCheck className="w-5 h-5" /> Edit Certificates
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
                          <p>Add proof images for your certificates to earn profile points! (Max 3 proofs, 10 pts each). Current points: <span className="font-bold text-blue-600 dark:text-blue-400">{expPointsEarning} / 30</span></p>
                      </div>
                  </div>
              </div>

              {certificates.map((cert, idx) => (
                <div key={idx} className="p-[2px] rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 mb-4 transition-all">
                  <div className={`p-4 rounded-[calc(1rem-2px)] h-full ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                    <div 
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setExpandedIndex(expandedIndex === idx ? -1 : idx)}
                    >
                        <div className="flex items-center gap-3">
                            {isCertComplete(cert) ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                            <div>
                                <h3 className={`font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                                    {cert.name || "New Certificate"}
                                </h3>
                                {cert.issuer && <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{cert.issuer}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); removeCertificate(idx); }}
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
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Certificate Name <span className="text-red-500">*</span></label>
                                    <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-name`] ? 'from-red-500 to-red-600' : ''}`}>
                                      <input
                                          type="text"
                                          value={cert.name}
                                          onChange={(e) => handleChange(idx, "name", e.target.value)}
                                          className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                          placeholder="Ex: AWS Certified Solutions Architect"
                                      />
                                    </div>
                                    {errors[`${idx}-name`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-name`]}</p>}
                                </div>
                                
                                <div>
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Issuing Organization <span className="text-red-500">*</span></label>
                                    <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-issuer`] ? 'from-red-500 to-red-600' : ''}`}>
                                      <input
                                          type="text"
                                          value={cert.issuer}
                                          onChange={(e) => handleChange(idx, "issuer", e.target.value)}
                                          className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                          placeholder="Ex: Amazon Web Services"
                                      />
                                    </div>
                                    {errors[`${idx}-issuer`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-issuer`]}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>Issue Date <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <div className={`w-1/2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-issueDate`] ? 'from-red-500 to-red-600' : ''}`}>
                                          <select
                                              value={cert.issueMonth}
                                              onChange={(e) => handleChange(idx, "issueMonth", e.target.value)}
                                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                          >
                                              <option value="">Month</option>
                                              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                          </select>
                                        </div>
                                        <div className={`w-1/2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm ${errors[`${idx}-issueDate`] ? 'from-red-500 to-red-600' : ''}`}>
                                          <select
                                              value={cert.issueYear}
                                              onChange={(e) => handleChange(idx, "issueYear", e.target.value)}
                                              className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                          >
                                              <option value="">Year</option>
                                              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                          </select>
                                        </div>
                                    </div>
                                    {errors[`${idx}-issueDate`] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[`${idx}-issueDate`]}</p>}
                                </div>

                                <div>
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>Duration (Optional)</label>
                                    <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                                      <input
                                          type="text"
                                          value={cert.duration}
                                          onChange={(e) => handleChange(idx, "duration", e.target.value)}
                                          className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                          placeholder="Ex: 3 Weeks"
                                      />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Credential URL</label>
                                <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                                  <input
                                      type="text"
                                      value={cert.credentialUrl}
                                      onChange={(e) => handleChange(idx, "credentialUrl", e.target.value)}
                                      className={`w-full p-2.5 rounded-[calc(0.75rem-2px)] outline-none transition ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                      placeholder="Ex: https://credentials.com/123"
                                  />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Description (Optional)</label>
                                <div className={`p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                                  <textarea
                                      value={cert.description}
                                      onChange={(e) => handleChange(idx, "description", e.target.value)}
                                      rows={2}
                                      className={`w-full p-3 rounded-[calc(0.75rem-2px)] outline-none transition resize-none ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-gray-900'}`}
                                      placeholder="What skills did you learn..."
                                  />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Proof of Certificate</label>
                                <div className={`flex flex-col gap-2 p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-sm`}>
                                    <div className={`flex items-center gap-4 p-3 rounded-[calc(0.75rem-2px)] w-full ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                                      {cert.proofImage ? (
                                          <div className="p-[2px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[10px] shrink-0 shadow-sm">
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white">
                                                <img src={cert.proofImage} alt="Proof preview" className="w-full h-full object-cover" />
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
                                              id={`cert-proof-${idx}`}
                                              className="hidden"
                                              onChange={(e) => handleImageChange(idx, e)}
                                          />
                                          <div className="flex items-center gap-2">
                                              <label htmlFor={`cert-proof-${idx}`} className={`cursor-pointer inline-block px-4 py-2 rounded-lg text-sm font-bold transition border border-gray-300 dark:border-white/20 ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}>
                                                  {cert.proofImage ? "Change Image" : "Upload Certificate Image"}
                                              </label>
                                              {cert.proofImage && (
                                                  <button 
                                                      onClick={() => {
                                                          const updated = [...certificates];
                                                          updated[idx].proofImage = "";
                                                          updated[idx].proofImageFile = null;
                                                          setCertificates(updated);
                                                      }}
                                                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                                      title="Remove Image"
                                                  >
                                                      <Trash2 className="w-4 h-4" />
                                                  </button>
                                              )}
                                          </div>
                                          <p className="text-xs text-gray-500 mt-1">Max 2MB (JPG, PNG)</p>
                                      </div>
                                      {cert.proofImage && (
                                          <button 
                                              onClick={() => setSelectedProofImage(cert.proofImage)}
                                              className="text-blue-500 hover:text-blue-600"
                                          >
                                              <ExternalLink className="w-5 h-5" />
                                          </button>
                                      )}
                                    </div>
                                    <div className={`pt-2 px-4 pb-3 rounded-b-[calc(0.75rem-2px)] ${darkMode ? 'bg-[#121213]' : 'bg-white'}`}>
                                        <div className={`p-1.5 rounded-[calc(0.75rem-2px)] flex gap-1 ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); handleChange(idx, "isPrivate", false); }}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                                                    !cert.isPrivate 
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' 
                                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/10'
                                                }`}
                                            >
                                                <Globe className="w-4 h-4" /> Public
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); handleChange(idx, "isPrivate", true); }}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                                                    cert.isPrivate 
                                                        ? 'bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-md' 
                                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/10'
                                                }`}
                                            >
                                                <Lock className="w-4 h-4" /> Private
                                            </button>
                                        </div>
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
                    onClick={addCertificate}
                    className={`w-full py-4 rounded-[calc(0.75rem-2px)] flex items-center justify-center gap-2 font-bold ${darkMode ? 'bg-[#121213] text-white hover:bg-[#1a1a1b]' : 'bg-white text-black hover:bg-gray-50'}`}
                >
                    <Plus className="w-5 h-5" /> Add Another Certificate
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
              title="Certificate Proof"
          />
      )}
    </>
  );
}