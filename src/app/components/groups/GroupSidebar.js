"use client";
import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { FaPlus, FaSearch } from "react-icons/fa";
import GroupAvatar from "./GroupAvatar";

export default function GroupSidebar({ 
    groups, 
    onSelectGroup, 
    selectedGroup, 
    onSearch, 
    onCreateGroup, 
    isAdmin,
    onViewImage 
}) {
    const { darkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        onSearch(term);
    };

    return (
        <div className="w-full relative p-[2px] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 h-full">
            {/* Gradient Border Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />

            <div className={`h-full flex flex-col rounded-[14px] relative overflow-hidden ${darkMode ? "bg-gray-900/95 text-white" : "bg-[#FAFAFA]/95 text-gray-900"
                }`}>
                <div className="px-4 py-3">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className={`text-xl font-black tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>Groups</h2>
                        {isAdmin && (
                            <button 
                                onClick={onCreateGroup}
                                className="p-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-110 transition-transform shadow-lg"
                                title="Create Group"
                            >
                                <FaPlus size={14} />
                            </button>
                        )}
                    </div>
                    <div className="p-[1.5px] rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/5">
                        <div className={`relative px-3 rounded-[11px] border transition-all ${darkMode ? "bg-gray-800 border-transparent focus-within:border-blue-500" : "bg-[#FAFAFA] border-transparent focus-within:border-blue-500"}`}>
                            <div className="flex items-center gap-2">
                                <FaSearch className="text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search groups..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className={`w-full bg-transparent py-2 font-bold text-sm placeholder-gray-400 focus:outline-none ${darkMode ? "text-white" : "text-black"}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gradient Divider */}
                <div className="h-[1.5px] w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-sm opacity-60" />

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {groups.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10 font-bold text-sm uppercase tracking-widest opacity-60">
                            No groups found.
                        </div>
                    ) : (
                        groups.map((group) => (
                            <div
                                key={group._id}
                                onClick={() => onSelectGroup(group)}
                                className={`p-1 flex items-center gap-3 rounded-2xl cursor-pointer transition-all ${selectedGroup?._id === group._id
                                    ? "opacity-100"
                                    : "opacity-80 hover:opacity-100"
                                    }`}
                            >
                                <div 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewImage(group.profileImage || "/default-group.jpg");
                                }}
                                className="relative border-2 rounded-full p-[1px] bg-gradient-to-tr from-blue-400 to-pink-400 shadow-sm w-12 h-12 flex items-center justify-center bg-[#FAFAFA] hover:scale-110 transition-transform cursor-zoom-in"
                            >
                                    <GroupAvatar
                                        group={group}
                                        size={44}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="p-[1px] rounded-xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/10 transition-all hover:scale-[1.02]">
                                        <div className={`p-3 rounded-[11px] flex items-center justify-between ${selectedGroup?._id === group._id 
                                            ? (darkMode ? "bg-gray-800" : "bg-[#FAFAFA]") 
                                            : (darkMode ? "bg-gray-900/90 hover:bg-gray-800/90" : "bg-[#FAFAFA]/90 hover:bg-gray-50/90")}`}>
                                            <h3 className={`font-black truncate text-xs tracking-tighter ${darkMode ? "text-white" : "text-gray-900"}`}>{group.name}</h3>
                                            {selectedGroup?._id === group._id && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
