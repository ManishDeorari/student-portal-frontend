import React, { useState } from "react";
import { Pencil, PlusCircle, ChevronUp, ChevronDown } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const SectionCard = ({ title, children, onEdit, isPublicView, hasData }) => {
  const { darkMode } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`relative p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-[0_20px_60px_rgba(37,99,235,0.25)] transition-all`}>
      <div className={`p-4 sm:p-6 rounded-[calc(1rem-1.5px)] h-full transition-colors duration-500 ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'}`}>
        
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-black transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>

          <div className="flex items-center gap-3">
            {!isPublicView && onEdit && (
              hasData ? (
                <div className="p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-md">
                  <button 
                    className={`p-1.5 rounded-[calc(9999px-2px)] flex items-center justify-center cursor-pointer transition-colors ${darkMode ? 'bg-[#121213] text-blue-400 hover:bg-slate-800' : 'bg-white text-blue-600 hover:bg-gray-50'}`}
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    title="Edit Section"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-md">
                  <button
                    className={`p-1.5 rounded-[calc(9999px-2px)] flex items-center justify-center cursor-pointer transition-colors ${darkMode ? 'bg-[#121213] text-white hover:bg-slate-800' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    title="Add Info"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </button>
                </div>
              )
            )}
            
            {/* Collapse Toggle */}
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden -mx-4 px-4 -mb-4 pb-4"
            >
              <div className={`text-sm space-y-1 transition-colors pt-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div >
  );
};

export default SectionCard;
