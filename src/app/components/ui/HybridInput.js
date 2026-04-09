"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function HybridInput({
    value,
    onChange,
    options = [],
    placeholder = "Select or type...",
    className = "",
    type = "text",
    uppercase = false,
    maxLength,
    min,
    max,
    disabled = false,
    placement = "bottom"
}) {
    const { darkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Filter options based on input
    const filteredOptions = options.filter(opt =>
        String(opt).toLowerCase().includes(String(value || "").toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        let val = e.target.value;
        if (uppercase && type === "text") val = val.toUpperCase();
        if (type === "number") {
             if (maxLength && val.length > maxLength) val = val.slice(0, maxLength);
        }
        onChange(val);
        setIsOpen(true);
    };

    const handleOptionClick = (opt) => {
        onChange(String(opt));
        setIsOpen(false);
    };

    return (
        <div className={`relative w-full ${disabled ? "opacity-60 cursor-not-allowed" : ""}`} ref={wrapperRef}>
            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    type={type}
                    value={value || ""}
                    onChange={handleInputChange}
                    onFocus={() => !disabled && setIsOpen(true)}
                    placeholder={placeholder}
                    className={`w-full pr-10 ${className} outline-none transition-all`}
                    min={min}
                    max={max}
                    disabled={disabled}
                />
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        if (disabled) return;
                        setIsOpen(!isOpen);
                        if (!isOpen) inputRef.current?.focus();
                    }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity p-1 ${darkMode ? 'text-white' : 'text-black'}`}
                >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <ul className={`absolute z-50 w-full ${placement === "top" ? "bottom-full mb-2" : "mt-2"} max-h-60 overflow-y-auto rounded-xl shadow-2xl border backdrop-blur-xl ${darkMode ? 'bg-[#121213]/95 border-slate-700/50' : 'bg-[#FAFAFA]/95 border-gray-200'} custom-scrollbar`}>
                    {filteredOptions.map((opt, idx) => (
                        <li
                            key={idx}
                            onClick={() => handleOptionClick(opt)}
                            className={`px-4 py-3 cursor-pointer text-sm font-medium transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
