import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Plus, Trash2, Edit2, ExternalLink, Link as LinkIcon, Youtube, Github, Briefcase, FileText, Star, ChevronDown, ChevronUp } from "lucide-react";
import AddFeaturedModal from "./AddFeaturedModal";

export default function ProfileFeatured({ user, isPublicView, onUpdate }) {
  const { darkMode } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const featured = user?.featured || [];

  if (featured.length === 0 && isPublicView) return null;

  const handleSave = async (item) => {
    try {
      let newFeatured = [...featured];
      if (item._id) {
        newFeatured = newFeatured.map(f => f._id === item._id ? item : f);
      } else {
        newFeatured.push(item);
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ featured: newFeatured })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        onUpdate(updatedUser);
      }
    } catch (e) {
      console.error("Failed to update featured items", e);
    }
    setShowModal(false);
    setEditItem(null);
  };

  const handleDelete = async (id) => {
    try {
      const newFeatured = featured.filter(f => f._id !== id);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ featured: newFeatured })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        onUpdate(updatedUser);
      }
    } catch (e) {
      console.error("Failed to delete featured item", e);
    }
  };

  const getYoutubeId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
    return match ? match[1] : null;
  };

  const getIcon = (type) => {
    switch(type) {
      case 'youtube': return <Youtube size={24} className="text-red-500" />;
      case 'github': return <Github size={24} className={darkMode ? "text-white" : "text-black"} />;
      case 'portfolio': return <Briefcase size={24} className="text-blue-500" />;
      case 'post': return <FileText size={24} className="text-purple-500" />;
      default: return <LinkIcon size={24} className="text-teal-500" />;
    }
  };

  return (
    <div className="mt-6 p-[2px] rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg">
      <div className={`p-6 rounded-[calc(1rem-2px)] w-full h-full ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
        
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-xl font-black flex items-center gap-2 ${darkMode ? "text-white" : "text-black"}`}>
            <Star className="text-amber-500" size={24} fill="currentColor" />
            Featured
          </h2>
          <div className="flex items-center gap-2">
            {!isPublicView && (
              <div className="p-[1.5px] rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 hover:scale-105 active:scale-95 transition-all">
                <button
                  onClick={() => { setEditItem(null); setShowModal(true); }}
                  className={`p-1.5 rounded-[calc(0.75rem-1.5px)] transition-all ${
                    darkMode ? "bg-[#121213] text-white" : "bg-white text-black"
                  }`}
                >
                  <Plus size={18} />
                </button>
              </div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1.5 rounded-full transition-colors ${
                darkMode ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-black"
              }`}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {featured.map((item, index) => {
              const isYoutube = item.type === 'youtube';
              const yId = isYoutube ? getYoutubeId(item.url) : null;

              return (
                <div key={item._id || index} className="p-[1.5px] rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 group shadow-sm hover:scale-[1.02] transition-all duration-300 relative">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`block p-4 rounded-[calc(0.75rem-1.5px)] h-full ${darkMode ? "bg-[#121213]" : "bg-white"}`}
                  >
                    {/* Image / Icon Area */}
                    {isYoutube && yId ? (
                      <div className="w-full aspect-video rounded-lg overflow-hidden mb-3 relative p-[1px] bg-gradient-to-tr from-blue-500 to-purple-500">
                        <img src={`https://img.youtube.com/vi/${yId}/hqdefault.jpg`} className="w-full h-full object-cover rounded-[calc(0.5rem-1px)]" alt="Thumbnail" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center pl-1 shadow-lg">
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 p-[1.5px] bg-gradient-to-tr from-blue-600 to-purple-600`}>
                        <div className={`w-full h-full rounded-[calc(0.75rem-1.5px)] flex items-center justify-center ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                          {getIcon(item.type)}
                        </div>
                      </div>
                    )}

                    <h3 className={`font-black text-lg line-clamp-2 ${darkMode ? "text-white" : "text-black"}`}>
                      {item.title}
                    </h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${darkMode ? "text-white" : "text-black"}`}>
                      {item.type}
                    </p>
                  </a>

                  {/* Edit Controls */}
                  {!isPublicView && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditItem(item); setShowModal(true); }}
                        className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(item._id); }}
                        className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors shadow-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <AddFeaturedModal
            editItem={editItem}
            onClose={() => { setShowModal(false); setEditItem(null); }}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
