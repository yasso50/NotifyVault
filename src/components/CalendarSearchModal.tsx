import React from 'react';
import { FilterOptions, NotificationItem } from '../types';
import { translations } from '../utils/i18n';
import {
  Calendar as CalendarIcon,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApply: (newFilters: FilterOptions) => void;
  notifications: NotificationItem[];
  isDark: boolean;
  language: 'en' | 'ar';
}

export const CalendarSearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  filters,
  onApply,
  notifications,
  isDark,
  language,
}) => {
  const t = translations[language];

  // Helper to format Date to YYYY-MM-DD
  const formatDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const todayKey = formatDateKey(today);

  // Local state for the picker
  const [selectedDate, setSelectedDate] = React.useState<string>(
    filters.customDate || todayKey
  );
  const [selectedHour, setSelectedHour] = React.useState<number | null>(
    filters.customHour !== undefined ? filters.customHour : null
  );
  const [timeMode, setTimeMode] = React.useState<'allDay' | 'specificHour' | 'range'>(
    filters.customTimeFrom && filters.customTimeTo
      ? 'range'
      : filters.customHour !== undefined
      ? 'specificHour'
      : 'allDay'
  );
  const [timeFrom, setTimeFrom] = React.useState<string>(filters.customTimeFrom || '09:00');
  const [timeTo, setTimeTo] = React.useState<string>(filters.customTimeTo || '18:00');

  // Month navigation for calendar grid
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    if (filters.customDate) {
      const [y, m, d] = filters.customDate.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  React.useEffect(() => {
    if (isOpen) {
      setSelectedDate(filters.customDate || todayKey);
      setSelectedHour(filters.customHour !== undefined ? filters.customHour : null);
      setTimeFrom(filters.customTimeFrom || '09:00');
      setTimeTo(filters.customTimeTo || '18:00');
      setTimeMode(
        filters.customTimeFrom && filters.customTimeTo
          ? 'range'
          : filters.customHour !== undefined
          ? 'specificHour'
          : 'allDay'
      );
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  // Compute calendar grid days for currentMonth
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: { dayNumber: number; dateKey: string; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevDate = new Date(year, month - 1, d);
    days.push({
      dayNumber: d,
      dateKey: formatDateKey(prevDate),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const currDate = new Date(year, month, d);
    days.push({
      dayNumber: d,
      dateKey: formatDateKey(currDate),
      isCurrentMonth: true,
    });
  }

  // Next month padding to fill complete weeks
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d);
    days.push({
      dayNumber: d,
      dateKey: formatDateKey(nextDate),
      isCurrentMonth: false,
    });
  }

  // Days of the week headers
  const weekDays = language === 'ar'
    ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Month titles
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const monthName = language === 'ar' ? monthNamesAr[month] : monthNamesEn[month];

  // Count notifications for selected date & time criteria
  const previewMatchCount = notifications.filter((n) => {
    const notifDate = new Date(n.timestamp);
    const notifDateKey = formatDateKey(notifDate);
    if (notifDateKey !== selectedDate) return false;

    if (timeMode === 'specificHour' && selectedHour !== null) {
      if (notifDate.getHours() !== selectedHour) return false;
    } else if (timeMode === 'range' && timeFrom && timeTo) {
      const notifMins = notifDate.getHours() * 60 + notifDate.getMinutes();
      const [fh, fm] = timeFrom.split(':').map(Number);
      const [th, tm] = timeTo.split(':').map(Number);
      if (notifMins < fh * 60 + fm || notifMins > th * 60 + tm) return false;
    }

    return true;
  }).length;

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleQuickDate = (type: 'today' | 'yesterday' | '2days') => {
    const d = new Date();
    if (type === 'yesterday') {
      d.setDate(d.getDate() - 1);
    } else if (type === '2days') {
      d.setDate(d.getDate() - 2);
    }
    const key = formatDateKey(d);
    setSelectedDate(key);
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const handleApplyFilter = () => {
    const updated: FilterOptions = {
      ...filters,
      dateRange: 'custom',
      customDate: selectedDate,
      customHour: timeMode === 'specificHour' && selectedHour !== null ? selectedHour : undefined,
      customTimeFrom: timeMode === 'range' ? timeFrom : undefined,
      customTimeTo: timeMode === 'range' ? timeTo : undefined,
    };
    onApply(updated);
    onClose();
  };

  const handleClear = () => {
    const cleared: FilterOptions = {
      ...filters,
      dateRange: 'all',
      customDate: undefined,
      customHour: undefined,
      customTimeFrom: undefined,
      customTimeTo: undefined,
    };
    onApply(cleared);
    onClose();
  };

  // 24-hour slots formatting
  const formatHourLabel = (h: number) => {
    const period = h >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH} ${period}`;
  };

  return (
    <div
      id="calendar_search_modal_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="calendar_search_modal_content"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 shadow-2xl border transition-all ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">{t.dateSearchTitle}</h3>
              <p className="text-[11px] text-zinc-400">{t.calendarSearch}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Date Shortcuts */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => handleQuickDate('today')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors flex-shrink-0 ${
              selectedDate === todayKey
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {t.groupToday}
          </button>
          <button
            onClick={() => handleQuickDate('yesterday')}
            className="px-3 py-1 rounded-full text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex-shrink-0"
          >
            {t.groupYesterday}
          </button>
          <button
            onClick={() => handleQuickDate('2days')}
            className="px-3 py-1 rounded-full text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex-shrink-0"
          >
            {language === 'ar' ? 'قبل يومين' : '2 Days Ago'}
          </button>
        </div>

        {/* Calendar Month Selector & Grid */}
        <div className="mt-4 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
              {monthName} {year}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDays.map((wd) => (
              <span key={wd} className="text-[10px] font-semibold text-zinc-400">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((item, idx) => {
              const isSelected = item.dateKey === selectedDate;
              const isToday = item.dateKey === todayKey;

              return (
                <button
                  key={`${item.dateKey}-${idx}`}
                  onClick={() => setSelectedDate(item.dateKey)}
                  className={`h-7.5 rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : isToday
                      ? 'border border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : item.isCurrentMonth
                      ? 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      : 'text-zinc-400/40 dark:text-zinc-600'
                  }`}
                >
                  {item.dayNumber}
                </button>
              );
            })}
          </div>

          {/* Direct HTML5 Date Picker for convenience */}
          <div className="mt-3 pt-2.5 border-t border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">
              {t.dateSelected}:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                  const [y, m] = e.target.value.split('-').map(Number);
                  setCurrentMonth(new Date(y, m - 1, 1));
                }
              }}
              className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold focus:outline-hidden"
            />
          </div>
        </div>

        {/* Time / Hour Selection Section */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t.selectTime}</span>
            </label>
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl text-[11px]">
              <button
                onClick={() => setTimeMode('allDay')}
                className={`px-2 py-0.5 rounded-lg transition-colors font-medium ${
                  timeMode === 'allDay'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-500'
                }`}
              >
                {t.allHours}
              </button>
              <button
                onClick={() => {
                  setTimeMode('specificHour');
                  if (selectedHour === null) setSelectedHour(12);
                }}
                className={`px-2 py-0.5 rounded-lg transition-colors font-medium ${
                  timeMode === 'specificHour'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-500'
                }`}
              >
                {t.exactHour}
              </button>
              <button
                onClick={() => setTimeMode('range')}
                className={`px-2 py-0.5 rounded-lg transition-colors font-medium ${
                  timeMode === 'range'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-500'
                }`}
              >
                {t.timeRange}
              </button>
            </div>
          </div>

          {/* Specific Hour Quick Selector (0 to 23) */}
          {timeMode === 'specificHour' && (
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>{t.hourSelected}:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedHour !== null ? formatHourLabel(selectedHour) : 'None'}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {Array.from({ length: 24 }, (_, h) => (
                  <button
                    key={h}
                    onClick={() => setSelectedHour(h)}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold border transition-colors ${
                      selectedHour === h
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                    }`}
                  >
                    {formatHourLabel(h)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time Range Selector */}
          {timeMode === 'range' && (
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 grid grid-cols-2 gap-3 text-xs animate-in fade-in">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">{t.timeFrom}:</label>
                <input
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">{t.timeTo}:</label>
                <input
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Matching Results Indicator */}
        <div className="mt-4 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Found {previewMatchCount} notifications</span>
          </div>
          <span className="text-[11px] text-indigo-500 font-bold">{selectedDate}</span>
        </div>

        {/* Modal Actions */}
        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleClear}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.clearDateFilter}</span>
          </button>

          <button
            onClick={handleApplyFilter}
            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>{t.applyDateTime}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
