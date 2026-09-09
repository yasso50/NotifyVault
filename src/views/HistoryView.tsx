import React from 'react';
import { NotificationItem, FilterOptions, AppEntity } from '../types';
import { translations } from '../utils/i18n';
import { NotificationCard } from '../components/NotificationCard';
import { CalendarSearchModal } from '../components/CalendarSearchModal';
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  Trash2,
  Archive,
  Star,
  CheckCircle,
  RotateCcw,
  X,
  Tag,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';

interface Props {
  notifications: NotificationItem[];
  apps: AppEntity[];
  filters: FilterOptions;
  onUpdateFilters: (f: FilterOptions) => void;
  onOpenFilterSheet: () => void;
  isDark: boolean;
  language: 'en' | 'ar';
  onOpenDetail: (item: NotificationItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onArchive: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkArchive: (ids: string[]) => void;
  onBulkFavorite: (ids: string[]) => void;
  onBulkMarkRead: (ids: string[]) => void;
}

export const HistoryView: React.FC<Props> = ({
  notifications,
  apps,
  filters,
  onUpdateFilters,
  onOpenFilterSheet,
  isDark,
  language,
  onOpenDetail,
  onToggleFavorite,
  onArchive,
  onDelete,
  onBulkDelete,
  onBulkArchive,
  onBulkFavorite,
  onBulkMarkRead,
}) => {
  const [searchQuery, setSearchQuery] = React.useState(filters.searchQuery || '');
  const [isSelectMode, setIsSelectMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([
    'OTP',
    'Amazon',
    'رمز التحقق',
    'Invoice',
    'طلبك',
  ]);

  const t = translations[language];

  // Debounce search update
  React.useEffect(() => {
    const handler = setTimeout(() => {
      onUpdateFilters({ ...filters, searchQuery });
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Filter notifications locally
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((n) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = n.title.toLowerCase().includes(q);
        const inText = n.text.toLowerCase().includes(q);
        const inApp = n.appName.toLowerCase().includes(q);
        const inPkg = n.packageName.toLowerCase().includes(q);
        const inOtp = n.otpCode && n.otpCode.includes(q);
        const inTags = n.tags.some((t) => t.toLowerCase().includes(q));

        if (!inTitle && !inText && !inApp && !inPkg && !inOtp && !inTags) {
          return false;
        }
      }

      // App selection
      if (filters.selectedApps.length > 0) {
        if (!filters.selectedApps.includes(n.packageName)) return false;
      }

      // Status
      if (filters.status === 'unread' && n.isRead) return false;
      if (filters.status === 'read' && !n.isRead) return false;
      if (filters.status === 'favorite' && !n.isFavorite) return false;
      if (filters.status === 'archived' && !n.isArchived) return false;
      if (filters.status !== 'archived' && n.isArchived && filters.status === 'all') {
        // default: hide archived unless requested
        return false;
      }

      // Category
      if (filters.category && n.category !== filters.category) return false;

      // Importance
      if (filters.importance !== 'all' && n.importance !== filters.importance) return false;

      // Date Range
      const now = Date.now();
      if (filters.dateRange === 'today') {
        if (n.timestamp < now - 1000 * 60 * 60 * 24) return false;
      } else if (filters.dateRange === 'yesterday') {
        const start = now - 1000 * 60 * 60 * 48;
        const end = now - 1000 * 60 * 60 * 24;
        if (n.timestamp < start || n.timestamp > end) return false;
      } else if (filters.dateRange === '7days') {
        if (n.timestamp < now - 1000 * 60 * 60 * 24 * 7) return false;
      } else if (filters.dateRange === '30days') {
        if (n.timestamp < now - 1000 * 60 * 60 * 24 * 30) return false;
      } else if (filters.dateRange === 'custom' && filters.customDate) {
        const d = new Date(n.timestamp);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const notifDateKey = `${y}-${m}-${day}`;
        if (notifDateKey !== filters.customDate) return false;

        if (filters.customHour !== undefined) {
          if (d.getHours() !== filters.customHour) return false;
        } else if (filters.customTimeFrom && filters.customTimeTo) {
          const notifMins = d.getHours() * 60 + d.getMinutes();
          const [fh, fm] = filters.customTimeFrom.split(':').map(Number);
          const [th, tm] = filters.customTimeTo.split(':').map(Number);
          if (notifMins < fh * 60 + fm || notifMins > th * 60 + tm) return false;
        }
      }

      return true;
    });
  }, [notifications, searchQuery, filters]);

  // Group notifications chronologically: Today, Yesterday, This Week, Earlier
  const groupedTimeline = React.useMemo(() => {
    const now = Date.now();
    const oneDay = 1000 * 60 * 60 * 24;
    const todayCutoff = now - oneDay;
    const yesterdayCutoff = now - oneDay * 2;
    const weekCutoff = now - oneDay * 7;

    const today: NotificationItem[] = [];
    const yesterday: NotificationItem[] = [];
    const thisWeek: NotificationItem[] = [];
    const earlier: NotificationItem[] = [];

    filteredNotifications.forEach((item) => {
      if (item.timestamp >= todayCutoff) {
        today.push(item);
      } else if (item.timestamp >= yesterdayCutoff) {
        yesterday.push(item);
      } else if (item.timestamp >= weekCutoff) {
        thisWeek.push(item);
      } else {
        earlier.push(item);
      }
    });

    return [
      { title: t.groupToday, items: today },
      { title: t.groupYesterday, items: yesterday },
      { title: t.groupThisWeek, items: thisWeek },
      { title: t.groupEarlier, items: earlier },
    ].filter((g) => g.items.length > 0);
  }, [filteredNotifications, t]);

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n) => n.id));
    }
  };

  const formatHourLabel = (h: number) => {
    const period = h >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH} ${period}`;
  };

  const activeFiltersCount =
    (filters.selectedApps.length > 0 ? 1 : 0) +
    (filters.dateRange !== 'all' ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.customDate ? 1 : 0);

  return (
    <div id="history_screen" className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Top Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div
          className={`flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border transition-all ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 focus-within:border-indigo-500'
              : 'bg-white border-zinc-200 focus-within:border-indigo-600 shadow-xs'
          }`}
        >
          <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          <input
            id="input_history_search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Calendar Search Button inside the search box */}
          <button
            id="btn_open_calendar_search"
            type="button"
            onClick={() => setIsCalendarOpen(true)}
            className={`relative p-1.5 rounded-xl transition-all flex items-center gap-1 flex-shrink-0 ${
              filters.customDate
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title={t.calendarSearch}
          >
            <CalendarIcon className="w-4 h-4" />
            {filters.customDate && (
              <span className="w-2 h-2 rounded-full bg-rose-400 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
            )}
          </button>
        </div>

        {/* Filter Bottom Sheet Trigger */}
        <button
          id="btn_open_filter_sheet"
          onClick={onOpenFilterSheet}
          className={`relative p-2.5 rounded-2xl border transition-colors ${
            activeFiltersCount > 0
              ? 'bg-indigo-600 text-white border-indigo-600'
              : isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-xs'
          }`}
          title="Filter Notifications"
        >
          <Filter className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Select Mode Toggle */}
        <button
          id="btn_toggle_select_mode"
          onClick={() => {
            setIsSelectMode(!isSelectMode);
            setSelectedIds([]);
          }}
          className={`p-2.5 rounded-2xl border transition-colors ${
            isSelectMode
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-xs'
          }`}
          title="Bulk Select Mode"
        >
          {isSelectMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Date & Time Filter Chip */}
      {filters.customDate && (
        <div
          id="active_date_filter_chip"
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-700 dark:text-indigo-300 animate-in fade-in"
        >
          <div className="flex items-center gap-1.5 font-semibold">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{filters.customDate}</span>
          </div>

          {filters.customHour !== undefined && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-200/60 dark:bg-indigo-900/80 font-mono text-[11px] font-bold">
              {formatHourLabel(filters.customHour)}
            </span>
          )}

          {filters.customTimeFrom && filters.customTimeTo && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-200/60 dark:bg-indigo-900/80 font-mono text-[11px] font-bold">
              {filters.customTimeFrom} – {filters.customTimeTo}
            </span>
          )}

          <button
            onClick={() =>
              onUpdateFilters({
                ...filters,
                dateRange: 'all',
                customDate: undefined,
                customHour: undefined,
                customTimeFrom: undefined,
                customTimeTo: undefined,
              })
            }
            className="ml-auto p-1 rounded-lg hover:bg-indigo-200/50 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 transition-colors"
            title={t.clearDateFilter}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Suggested Search Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-[11px] text-zinc-400 flex-shrink-0">Suggested:</span>
        {recentSearches.map((chip) => (
          <button
            key={chip}
            onClick={() => setSearchQuery(chip)}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors flex-shrink-0 ${
              searchQuery === chip
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-zinc-100 dark:bg-zinc-850 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Bulk Action Strip (When in Select Mode) */}
      {isSelectMode && (
        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {selectedIds.length === filteredNotifications.length ? 'Deselect All' : t.selectAll}
            </button>
            <span className="text-xs font-semibold text-zinc-500">
              ({selectedIds.length} {t.selectedCount})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={selectedIds.length === 0}
              onClick={() => {
                onBulkMarkRead(selectedIds);
                setSelectedIds([]);
              }}
              className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 disabled:opacity-40"
              title="Mark Read"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              disabled={selectedIds.length === 0}
              onClick={() => {
                onBulkFavorite(selectedIds);
                setSelectedIds([]);
              }}
              className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 text-amber-500 disabled:opacity-40"
              title="Favorite Selected"
            >
              <Star className="w-4 h-4" />
            </button>
            <button
              disabled={selectedIds.length === 0}
              onClick={() => {
                onBulkArchive(selectedIds);
                setSelectedIds([]);
              }}
              className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 disabled:opacity-40"
              title="Archive Selected"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              disabled={selectedIds.length === 0}
              onClick={() => {
                onBulkDelete(selectedIds);
                setSelectedIds([]);
              }}
              className="p-1.5 rounded-lg bg-rose-500 text-white disabled:opacity-40 shadow-xs"
              title="Delete Selected"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Chronological Timeline */}
      {groupedTimeline.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-400">
          <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            No notifications match your filters
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing active filters.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedTimeline.map((group) => (
            <div key={group.title} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {group.title}
                </span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                <span className="text-[11px] font-semibold text-zinc-400">
                  {group.items.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {group.items.map((item) => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    isDark={isDark}
                    isSelectMode={isSelectMode}
                    isSelected={selectedIds.includes(item.id)}
                    onSelect={handleToggleSelect}
                    onClick={onOpenDetail}
                    onToggleFavorite={onToggleFavorite}
                    onArchive={onArchive}
                    onDelete={onDelete}
                    language={language}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar Search Modal */}
      <CalendarSearchModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        filters={filters}
        onApply={onUpdateFilters}
        notifications={notifications}
        isDark={isDark}
        language={language}
      />
    </div>
  );
};
