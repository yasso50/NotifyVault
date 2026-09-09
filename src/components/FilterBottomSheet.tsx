import React from 'react';
import { FilterOptions, AppEntity, CategoryType } from '../types';
import { translations } from '../utils/i18n';
import { X, Filter, RotateCcw, Check, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (newFilters: FilterOptions) => void;
  apps: AppEntity[];
  isDark: boolean;
  language: 'en' | 'ar';
}

export const FilterBottomSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  apps,
  isDark,
  language,
}) => {
  const [localFilters, setLocalFilters] = React.useState<FilterOptions>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const t = translations[language];

  const categories: CategoryType[] = [
    'Messaging',
    'Email',
    'Finance',
    'Delivery',
    'Shopping',
    'Social',
    'Calls',
    'OTP',
    'Security',
    'System',
    'Other',
  ];

  const handleAppToggle = (pkg: string) => {
    const exists = localFilters.selectedApps.includes(pkg);
    if (exists) {
      setLocalFilters({
        ...localFilters,
        selectedApps: localFilters.selectedApps.filter((p) => p !== pkg),
      });
    } else {
      setLocalFilters({
        ...localFilters,
        selectedApps: [...localFilters.selectedApps, pkg],
      });
    }
  };

  const handleReset = () => {
    const reset: FilterOptions = {
      searchQuery: '',
      selectedApps: [],
      dateRange: 'all',
      customDate: undefined,
      customHour: undefined,
      customTimeFrom: undefined,
      customTimeTo: undefined,
      status: 'all',
      category: '',
      importance: 'all',
    };
    setLocalFilters(reset);
    onApplyFilters(reset);
    onClose();
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  return (
    <div
      id="filter_sheet_overlay"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="filter_sheet_content"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border transition-all ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base">{t.filterTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Presets */}
        <div className="my-4">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
            {language === 'ar' ? 'نطاق التاريخ والوقت' : 'Date & Time Range'}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'all', label: language === 'ar' ? 'كل الأوقات' : 'All Time' },
              { key: 'today', label: t.groupToday },
              { key: 'yesterday', label: t.groupYesterday },
              { key: '7days', label: language === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days' },
              { key: '30days', label: language === 'ar' ? 'آخر 30 يوماً' : 'Last 30 Days' },
              { key: 'custom', label: language === 'ar' ? '📅 تاريخ وساعة محددة' : '📅 Specific Date & Time' },
            ].map((d) => (
              <button
                key={d.key}
                onClick={() => {
                  if (d.key === 'custom') {
                    const todayStr = new Date().toISOString().split('T')[0];
                    setLocalFilters({
                      ...localFilters,
                      dateRange: 'custom',
                      customDate: localFilters.customDate || todayStr,
                    });
                  } else {
                    setLocalFilters({
                      ...localFilters,
                      dateRange: d.key as any,
                      customDate: undefined,
                      customHour: undefined,
                      customTimeFrom: undefined,
                      customTimeTo: undefined,
                    });
                  }
                }}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
                  localFilters.dateRange === d.key
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Custom Date & Hour Inputs when custom is active */}
          {localFilters.dateRange === 'custom' && (
            <div className="mt-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t.selectDate}</span>
                </span>
                <input
                  type="date"
                  value={localFilters.customDate || ''}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, customDate: e.target.value })
                  }
                  className="px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-200/60 dark:border-zinc-700/40">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t.exactHour}</span>
                </span>
                <select
                  value={localFilters.customHour !== undefined ? localFilters.customHour : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalFilters({
                      ...localFilters,
                      customHour: val === '' ? undefined : Number(val),
                    });
                  }}
                  className="px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold focus:outline-hidden"
                >
                  <option value="">{t.allHours}</option>
                  {Array.from({ length: 24 }, (_, h) => {
                    const period = h >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
                    const displayH = h % 12 === 0 ? 12 : h % 12;
                    return (
                      <option key={h} value={h}>
                        {displayH}:00 {period}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="my-4">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
            Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'read', label: 'Read' },
              { key: 'favorite', label: 'Favorites' },
              { key: 'archived', label: 'Archived' },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() =>
                  setLocalFilters({ ...localFilters, status: s.key as any })
                }
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
                  localFilters.status === s.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="my-4">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setLocalFilters({ ...localFilters, category: '' })}
              className={`text-xs px-2.5 py-1 rounded-xl font-medium ${
                localFilters.category === ''
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setLocalFilters({ ...localFilters, category: c })}
                className={`text-xs px-2.5 py-1 rounded-xl font-medium ${
                  localFilters.category === c
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* App Selection */}
        <div className="my-4">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
            Filter By Apps ({localFilters.selectedApps.length > 0 ? `${localFilters.selectedApps.length} selected` : 'All'})
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
            {apps.map((app) => {
              const isSelected = localFilters.selectedApps.includes(app.packageName);
              return (
                <button
                  key={app.packageName}
                  onClick={() => handleAppToggle(app.packageName)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'bg-zinc-50 dark:bg-zinc-850 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-zinc-400'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <span className="truncate flex-1">{app.appName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetFilters}</span>
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-colors"
          >
            {t.applyFilters}
          </button>
        </div>
      </div>
    </div>
  );
};
