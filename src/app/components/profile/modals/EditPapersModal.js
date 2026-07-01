import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X, Trash2, Plus, Save, ChevronDown, ChevronRight,
  BookOpen, Calendar, Link as LinkIcon, Building2, Eye, EyeOff, Tag
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

export default function EditPapersModal({ isOpen, onClose, currentPapers, onSave }) {
  const { darkMode } = useTheme();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    if (currentPapers && isOpen) {
      const transformed = currentPapers.map((p) => {
        const parseDate = (dateStr) => {
          if (!dateStr) return { month: "", year: "" };
          const parts = dateStr.split(" ");
          return parts.length === 2
            ? { month: parts[0], year: parts[1] }
            : { month: "", year: "" };
        };
        const pub = parseDate(p.publishDate);
        return {
          title: p.title || "",
          type: p.type || "",
          publisher: p.publisher || "",
          description: p.description || "",
          publishMonth: pub.month,
          publishYear: pub.year,
          link: p.link || "",
          isLinkPublic: p.isLinkPublic || false,
        };
      });
      setPapers(transformed);
    }
  }, [currentPapers, isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, field, value) => {
    let processedValue = value;

    if (field === "title" || field === "publisher") {
      processedValue = processedValue.replace(/[^a-zA-Z0-9\s\.\-]/g, '');
    }

    const updated = [...papers];
    updated[index][field] = processedValue;
    setPapers(updated);
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const addPaper = () => {
    setPapers([...papers, {
      title: "", type: "", publisher: "", description: "",
      publishMonth: "", publishYear: "",
      link: "", isLinkPublic: false,
    }]);
    setExpandedIndex(papers.length);
  };

  const removePaper = (index) => {
    setPapers(papers.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    papers.forEach((p, idx) => {
      if (!p.title.trim()) newErrors[`${idx}-title`] = "Title is required";
      if (!p.type.trim()) newErrors[`${idx}-type`] = "Type is required";
      if (!p.publisher.trim()) newErrors[`${idx}-publisher`] = "Publisher/Venue is required";
      if (!p.description.trim()) newErrors[`${idx}-description`] = "Description is required";
      if (!p.publishMonth || !p.publishYear) newErrors[`${idx}-publishDate`] = "Publish date is required";
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
      const finalData = papers.map((p) => ({
        title: p.title.trim(),
        type: p.type.trim(),
        publisher: p.publisher.trim(),
        description: p.description.trim(),
        publishDate: `${p.publishMonth} ${p.publishYear}`,
        link: p.link.trim(),
        isLinkPublic: p.isLinkPublic,
      }));

      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ researchPapers: finalData }),
      });

      if (!res.ok) throw new Error("Failed to update research papers");

      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onSave(updatedUser);
      toast.success("Research & Patents updated successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error updating papers");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  // Count how many current papers have valid links (for hints)
  const papersWithLinks = papers.filter(p => p.link && p.link.trim().length > 0).length;
  const pointsEarning = Math.min(papersWithLinks, 3) * 20;

  return (
    <>
      <LoadingOverlay isVisible={loading} />
      <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-2 md:p-4">
        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(99,102,241,0.4)] w-full max-w-3xl">
          <div className={`rounded-[calc(1rem-2.5px)] sm:rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden animate-fadeIn max-h-[95dvh] sm:max-h-[90vh] flex flex-col ${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"}`}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Edit Publications & Patents
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
                  <><Save className="w-5 h-5" /> Save Entries</>
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
    </>
  );
}
