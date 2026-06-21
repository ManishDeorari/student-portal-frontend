import React, { useMemo, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Flame, ChevronUp, ChevronDown, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileActivityHeatmap({ profile }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const { darkMode } = useTheme();
    const heatmapData = profile?.activityHeatmap || {};

    // Generate last 365 days aligned to a Sunday-Saturday grid
    const { columns, totalActivity, currentStreak } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let total = 0;
        let streak = 0;
        let isCurrentStreakActive = true;

        const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
        const totalDaysToRender = (52 * 7) + (dayOfWeek + 1);

        const allDays = [];

        for (let i = totalDaysToRender - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            const count = heatmapData[dateString] || 0;
            
            if (i < 365) {
                total += count;
                if (count > 0) {
                    streak++;
                } else {
                    if (i > 0 || (i === 0 && count === 0)) { 
                        isCurrentStreakActive = false;
                    }
                    if (!isCurrentStreakActive) streak = 0;
                }
            }

            allDays.push({
                date: dateString,
                count,
                level: count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4
            });
        }

        const resultCols = [];
        for (let i = 0; i < allDays.length; i += 7) {
            resultCols.push(allDays.slice(i, i + 7));
        }
        
        return { 
            columns: resultCols, 
            totalActivity: total, 
            currentStreak: streak 
        };
    }, [heatmapData]);

    const getColorClass = (level) => {
        if (level === 0) return darkMode ? 'bg-slate-800/50' : 'bg-gray-100';
        if (level === 1) return 'bg-green-300 dark:bg-green-900/60';
        if (level === 2) return 'bg-green-400 dark:bg-green-700/80';
        if (level === 3) return 'bg-green-500 dark:bg-green-500';
        return 'bg-green-600 dark:bg-green-400';
    };

    if (!profile || (profile.role !== 'student' && profile.role !== 'alumni')) return null;

    return (
        <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_10px_30px_rgba(37,99,235,0.2)] group w-full mb-6 transition-all duration-300 hover:scale-[1.02] hover:z-20 relative">
            <div className={`p-6 rounded-[calc(2.5rem-2.5px)] flex flex-col gap-4 transition duration-300 ${darkMode ? 'bg-[#121213] hover:bg-slate-900' : 'bg-[#FAFAFA] hover:bg-white'}`}>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${darkMode ? 'bg-orange-900/30 shadow-none' : 'bg-orange-50 shadow-sm'}`}>
                            <Flame className={`w-6 h-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                        </div>
                        <div>
                            <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Activity Map</h3>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>1 Square = 1 Day</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                        >
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                        <div className="flex flex-col items-end">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Activity</span>
                            <span className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{totalActivity}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Current Streak</span>
                            <span className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{currentStreak} days</span>
                        </div>
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
                            <div className="flex flex-col gap-2 overflow-x-auto pt-4 pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                                <div className="flex gap-2">
                                    <div className="flex flex-col gap-1 pr-2 justify-between py-[2px] text-[9px] font-black uppercase tracking-widest text-gray-400">
                                        <span>Mon</span>
                                        <span>Wed</span>
                                        <span>Fri</span>
                                    </div>

                                    <div className="flex gap-1">
                                        {columns.map((col, colIndex) => (
                                            <div key={colIndex} className="flex flex-col gap-1">
                                                {col.map((day, rowIndex) => (
                                                    <div
                                                        key={day.date}
                                                        className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 hover:scale-125 hover:ring-2 hover:ring-offset-1 dark:hover:ring-offset-[#121213] hover:ring-green-400 cursor-pointer ${getColorClass(day.level)}`}
                                                        title={`${day.count} activities on ${day.date}`}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className={`flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-widest mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <div className="flex items-center gap-1 mr-4 text-gray-400">
                                        <Info className="w-3 h-3" />
                                        <span className="normal-case tracking-normal">Tracking logins, posts, events & profile updates</span>
                                    </div>
                                    <span>Less Activity</span>
                                    <div className={`w-3 h-3 rounded-sm ${getColorClass(0)}`}></div>
                                    <div className={`w-3 h-3 rounded-sm ${getColorClass(1)}`}></div>
                                    <div className={`w-3 h-3 rounded-sm ${getColorClass(2)}`}></div>
                                    <div className={`w-3 h-3 rounded-sm ${getColorClass(3)}`}></div>
                                    <div className={`w-3 h-3 rounded-sm ${getColorClass(4)}`}></div>
                                    <span>More Activity</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
