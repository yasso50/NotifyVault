import React from 'react';
import { NotificationItem } from '../types';

interface Props {
  notifications: NotificationItem[];
  isDark: boolean;
  language: 'en' | 'ar';
}

export const HeatmapView: React.FC<Props> = ({ notifications, isDark, language }) => {
  const isRtl = language === 'ar';
  const [selectedCell, setSelectedCell] = React.useState<{ day: string; hour: number; count: number } | null>(null);

  const daysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daysAr = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
  const days = isRtl ? daysAr : daysEn;

  // Build a 7x24 grid from notifications
  const grid = React.useMemo(() => {
    // 7 rows (0 = Monday, 6 = Sunday), 24 columns
    const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

    notifications.forEach((n) => {
      const date = new Date(n.timestamp);
      let dayIndex = date.getDay() - 1; // getDay() is 0 (Sunday) to 6 (Saturday)
      if (dayIndex === -1) dayIndex = 6; // Make Sunday index 6
      const hour = date.getHours();
      if (dayIndex >= 0 && dayIndex < 7 && hour >= 0 && hour < 24) {
        matrix[dayIndex][hour] += 1;
      }
    });

    return matrix;
  }, [notifications]);

  // Find max value to scale color
  const maxVal = React.useMemo(() => {
    let max = 1;
    grid.forEach((row) => {
      row.forEach((val) => {
        if (val > max) max = val;
      });
    });
    return max;
  }, [grid]);

  const getColorClass = (val: number) => {
    if (val === 0) {
      return isDark ? 'bg-zinc-850 border-zinc-800' : 'bg-zinc-100 border-zinc-200/60';
    }
    const ratio = val / maxVal;
    if (ratio < 0.2) return 'bg-indigo-200 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-900';
    if (ratio < 0.4) return 'bg-indigo-300 dark:bg-indigo-900 border-indigo-400 dark:border-indigo-800';
    if (ratio < 0.7) return 'bg-indigo-500 dark:bg-indigo-700 border-indigo-600 dark:border-indigo-600 text-white';
    return 'bg-indigo-600 dark:bg-indigo-500 border-indigo-700 dark:border-indigo-400 text-white';
  };

  return (
    <div id="heatmap_container" className="w-full">
      {/* Selected tooltip preview */}
      <div className="h-6 mb-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        {selectedCell ? (
          <span className="font-medium text-indigo-600 dark:text-indigo-400 animate-in fade-in">
            {selectedCell.day} @ {selectedCell.hour}:00 - {selectedCell.count} notification
            {selectedCell.count === 1 ? '' : 's'}
          </span>
        ) : (
          <span>Hover or tap cells to view activity density</span>
        )}
        <div className="flex items-center gap-1 text-[10px]">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-xs bg-zinc-200 dark:bg-zinc-800" />
          <div className="w-2.5 h-2.5 rounded-xs bg-indigo-300 dark:bg-indigo-900" />
          <div className="w-2.5 h-2.5 rounded-xs bg-indigo-500 dark:bg-indigo-700" />
          <div className="w-2.5 h-2.5 rounded-xs bg-indigo-600 dark:bg-indigo-500" />
          <span>More</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[440px]">
          {/* Hour labels */}
          <div className="flex items-center text-[9px] text-zinc-400 dark:text-zinc-500 mb-1 ml-10">
            {['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p'].map((h, i) => (
              <span key={h} className="w-[12.5%] text-left font-mono">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {days.map((dayName, dIdx) => (
            <div key={dayName} className="flex items-center gap-1.5 mb-1.5">
              <span className="w-8 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 text-right truncate">
                {dayName}
              </span>
              <div className="flex-1 grid grid-cols-24 gap-1">
                {grid[dIdx].map((val, hour) => (
                  <div
                    key={hour}
                    onMouseEnter={() => setSelectedCell({ day: dayName, hour, count: val })}
                    onClick={() => setSelectedCell({ day: dayName, hour, count: val })}
                    className={`h-4 rounded-xs border transition-all cursor-pointer hover:scale-125 hover:z-10 ${getColorClass(
                      val
                    )}`}
                    title={`${dayName} ${hour}:00 - ${val} notifications`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
