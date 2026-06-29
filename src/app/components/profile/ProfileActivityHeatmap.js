import React, { useMemo, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Flame, ChevronUp, ChevronDown, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileActivityHeatmap({ profile }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [tooltip, setTooltip] = useState(null);
    const { darkMode } = useTheme();
    const heatmapData = profile?.activityHeatmap || {};

    const now = new Date();
    const todayDateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Generate grid aligned to Full Calendar Months
    const { columns, monthLabels, totalActivity, currentStreak } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let total = 0;
        let streak = 0;
        let isCurrentStreakActive = true;

        // Ensure we render exactly 6 full calendar months, avoiding broken half-months
        const targetMonths = 6;
        const startDate = new Date(today.getFullYear(), today.getMonth() - (targetMonths - 1), 1);
        
        // Push startDate back to the previous Sunday to ensure grid alignment
        const startDayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - startDayOfWeek);

        // Calculate exact number of days to render safely (avoids DST offset bugs)
        let totalDaysToRender = 0;
        let tempDate = new Date(startDate);
        while (tempDate <= today) {
            totalDaysToRender++;
            tempDate.setDate(tempDate.getDate() + 1);
        }

        const allDays = [];

        for (let i = totalDaysToRender - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const count = heatmapData[dateString] || 0;
            
            // Stats logic
            total += count;
            if (count > 0) {
                streak++;
            } else {
                if (i > 0 || (i === 0 && count === 0)) { 
                    isCurrentStreakActive = false;
                }
                if (!isCurrentStreakActive) streak = 0;
            }

            allDays.push({
                date: dateString,
                dateObj: date,
                count,
                level: count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4
            });
        }

        const resultCols = [];
        const mLabels = [];
        let currentMonth = -1;

        for (let i = 0; i < allDays.length; i += 7) {
            const colDays = allDays.slice(i, i + 7);
            let isNewMonth = false;

            if (colDays[0]) {
                const month = colDays[0].dateObj.getMonth();
                
                if (resultCols.length === 0) {
                    // Do NOT add a label for the very first column if it's just the leftover days of the previous month.
                    // This prevents "December" from showing up when we are rendering Jan-Jun.
                    currentMonth = month;
                } else if (month !== currentMonth) {
                    isNewMonth = true;
                    currentMonth = month;
                    
                    mLabels.push({
                        label: colDays[0].dateObj.toLocaleString('default', { month: 'long' }),
                        colIndex: resultCols.length
                    });
                }
            }

            resultCols.push({
                days: colDays,
                isNewMonth
            });
        }
        
        return { 
            columns: resultCols, 
            monthLabels: mLabels,
            totalActivity: total, 
            currentStreak: streak 
        };
    }, [heatmapData]);

    const getColorClass = (level) => {
        if (level === 0) return darkMode ? 'bg-slate-700' : 'bg-gray-300';
        if (level === 1) return 'bg-green-300 dark:bg-green-900/60';
        if (level === 2) return 'bg-green-400 dark:bg-green-700/80';
        if (level === 3) return 'bg-green-500 dark:bg-green-500';
        return 'bg-green-600 dark:bg-green-400';
    };

    if (!profile || (profile.role !== 'student' && profile.role !== 'alumni')) return null;

    return (
        <>
            <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_10px_30px_rgba(37,99,235,0.2)] group w-full mb-6 transition-all duration-300 hover:scale-[1.02] hover:z-20 relative">
                <div className={`p-6 rounded-[calc(2.5rem-2.5px)] flex flex-col gap-4 transition duration-300 ${darkMode ? 'bg-[#121213] hover:bg-slate-900' : 'bg-[#FAFAFA] hover:bg-white'}`}>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center justify-between w-full sm:w-auto">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${darkMode ? 'bg-orange-900/30 shadow-none' : 'bg-orange-50 shadow-sm'}`}>
                                    <Flame className={`w-6 h-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Activity Map</h3>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-white' : 'text-black'}`}>1 Square = 1 Day</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className={`sm:hidden p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                            >
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm w-full sm:w-auto justify-between sm:justify-end">
                            <div className="flex flex-col items-end">
                                <span className={`text-[10px] font-black uppercase tracking-widest text-orange-500`}>Total Activity (6 Months)</span>
                                <span className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{totalActivity}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Current Streak</span>
                                <span className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{currentStreak} days</span>
                            </div>
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className={`hidden sm:block p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
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
                                <div className="flex flex-col gap-3 overflow-x-auto pt-6 pb-4 px-1 sm:px-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                                    
                                    <div className="flex gap-2.5 pr-6 sm:mx-auto w-max relative">
                                        {/* Y-Axis Labels (Days of Week) */}
                                        <div className={`flex flex-col gap-1.5 pr-3 text-[11px] font-black uppercase tracking-widest mt-[24px] ${darkMode ? 'text-white' : 'text-black'}`}>
                                            <span className="h-[18px] flex items-center">Sun</span>
                                            <span className="h-[18px] flex items-center">Mon</span>
                                            <span className="h-[18px] flex items-center">Tue</span>
                                            <span className="h-[18px] flex items-center">Wed</span>
                                            <span className="h-[18px] flex items-center">Thu</span>
                                            <span className="h-[18px] flex items-center">Fri</span>
                                            <span className="h-[18px] flex items-center">Sat</span>
                                        </div>

                                        {/* Grid Area */}
                                        <div className="flex gap-1.5 relative w-full">
                                            {columns.map((col, colIndex) => {
                                                const mLabel = monthLabels.find(m => m.colIndex === colIndex);
                                                
                                                return (
                                                    <div 
                                                        key={colIndex} 
                                                        className={`flex flex-col gap-1.5 ${col.isNewMonth ? `border-l-[3px] border-orange-500 pl-1.5` : ''}`}
                                                    >
                                                        {/* Pixel-perfect X-Axis Labels aligned perfectly to the column start */}
                                                        <div className="h-[18px] mb-1.5 relative w-full">
                                                            {mLabel && (
                                                                <span className={`absolute left-0 bottom-0 text-[11px] font-black tracking-widest whitespace-nowrap ${darkMode ? 'text-white' : 'text-black'}`}>
                                                                    {mLabel.label}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {col.days.map((day, rowIndex) => {
                                                            const isToday = day.date === todayDateString;
                                                            return (
                                                                <div
                                                                    key={day.date}
                                                                    onMouseEnter={(e) => {
                                                                        const rect = e.target.getBoundingClientRect();
                                                                        setTooltip({
                                                                            text: `${isToday ? 'TODAY: ' : ''}${day.count} activities on ${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                                                                            x: rect.left + rect.width / 2,
                                                                            y: rect.top - 8
                                                                        });
                                                                    }}
                                                                    onMouseLeave={() => setTooltip(null)}
                                                                    onClick={(e) => {
                                                                        const rect = e.target.getBoundingClientRect();
                                                                        setTooltip({
                                                                            text: `${isToday ? 'TODAY: ' : ''}${day.count} activities on ${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                                                                            x: rect.left + rect.width / 2,
                                                                            y: rect.top - 8
                                                                        });
                                                                        setTimeout(() => setTooltip(null), 3000);
                                                                    }}
                                                                    className={`w-[18px] h-[18px] rounded-[4px] transition-all duration-200 cursor-pointer ${getColorClass(day.level)} ${isToday ? 'ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-[#121213] scale-110 z-20 hover:scale-125' : 'hover:scale-125 hover:ring-2 hover:ring-offset-2 dark:hover:ring-offset-[#121213] hover:ring-green-400 hover:z-50'}`}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    {/* Legend */}
                                    <div className={`flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 sm:gap-2.5 text-[11px] font-bold uppercase tracking-widest mt-4 mx-auto w-full max-w-2xl ${darkMode ? 'text-white' : 'text-black'}`}>
                                        <div className={`flex items-center gap-1.5 w-full sm:w-auto sm:mr-auto mb-2 sm:mb-0 justify-center sm:justify-start ${darkMode ? 'text-white' : 'text-black'}`}>
                                            <Info className="w-3.5 h-3.5 shrink-0" />
                                            <span className="normal-case tracking-normal text-center sm:text-left">Tracking logins, posts, events & profile updates</span>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-2">
                                            <div className="flex items-center gap-2 mr-0 sm:mr-6">
                                                <div className="w-[14px] h-[14px] rounded-sm ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-[#121213]"></div>
                                                <span className="text-orange-500">Today</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5">
                                                <span>Less</span>
                                                <div className={`w-[14px] h-[14px] rounded-sm ${getColorClass(0)}`}></div>
                                                <div className={`w-[14px] h-[14px] rounded-sm ${getColorClass(1)}`}></div>
                                                <div className={`w-[14px] h-[14px] rounded-sm ${getColorClass(2)}`}></div>
                                                <div className={`w-[14px] h-[14px] rounded-sm ${getColorClass(3)}`}></div>
                                                <div className={`w-[14px] h-[14px] rounded-sm ${getColorClass(4)}`}></div>
                                                <span>More</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>

            {/* Custom Tooltip Portal */}
            <AnimatePresence>
                {tooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="fixed z-[99999] pointer-events-none transform -translate-x-1/2 -translate-y-full p-[1.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg shadow-2xl"
                        style={{ left: tooltip.x, top: tooltip.y }}
                    >
                        <div className={`px-3 py-1.5 text-xs font-bold rounded-[calc(0.5rem-1.5px)] whitespace-nowrap ${darkMode ? 'bg-[#121213] text-white' : 'bg-white text-black'}`}>
                            {tooltip.text}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}