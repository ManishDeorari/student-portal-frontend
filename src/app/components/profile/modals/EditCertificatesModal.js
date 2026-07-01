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
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedProofImage, setSelectedProofImage] = useState(null);

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
          description: cert.description || "",
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
    let processedValue = value;

    if (field === "name" || field === "issuer") {
      processedValue = processedValue.replace(/[^a-zA-Z0-9\s\.\-]/g, '');
    } else if (field === "credentialId") {
      processedValue = processedValue.replace(/[^a-zA-Z0-9\-]/g, '');
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
        issueMonth: "",
        issueYear: "",
        duration: "",
        credentialUrl: "",
        proofImage: "",
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
        description: cert.description,
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
              
              <div className="flex items-center">
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
          downloadName={`${selectedProofImage.title} - Proof.jpg`}
          onClose={() => setSelectedProofImage(null)}
          isRestricted={false}
        />
      )}
    </>
  );
}
