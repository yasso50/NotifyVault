import React from 'react';
import { NotificationItem, AppSettings } from '../types';
import { translations } from '../utils/i18n';
import { NotificationCard } from '../components/NotificationCard';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Star,
  Inbox,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  Calendar as CalendarIcon
} from 'lucide-react';

interface Props {
  notifications: NotificationItem[];
  settings: AppSettings;
  isDark: boolean;
  language: 'en' | 'ar';
  onOpenDetail: (item: NotificationItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onArchive: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onNavigateToHistory: (query?: string) => void;
  onNavigateToInsights: () => void;
  onToggleListenerConnection: () => void;
}

export const HomeView: React.FC<Props> = ({
  notifications,
  settings,
  isDark,
  language,
  onOpenDetail,
  onToggleFavorite,
  onArchive,
  onDelete,
  onNavigateToHistory,
  onNavigateToInsights,
  onToggleListenerConnection,
}) => {
  const t = translations[language];

  // Calculate stats
  const now = Date.now();
  const oneDayAgo = now - 1000 * 60 * 60 * 24;
  const oneWeekAgo = now - 1000 * 60 * 60 * 24 * 7;

  const todayCount = notifications.filter((n) => n.timestamp >= oneDayAgo).length;
  const weekCount = notifications.filter((n) => n.timestamp >= oneWeekAgo).length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const favoriteCount = notifications.filter((n) => n.isFavorite).length;

  const recentList = notifications.slice(0, 8);

  return (
    <div id="home_screen" className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t.appName}
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Local-First
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t.tagline}
          </p>
        </div>

        {/* Access Status Pill */}
        <button
          id="btn_home_listener_status"
          onClick={onToggleListenerConnection}
          className={`self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
            settings.isListenerConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
          title="NotificationListenerService Status"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              settings.isListenerConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span>
            {settings.isListenerConnected ? t.accessConnected : t.accessDisconnected}
          </span>
        </button>
      </div>

      {/* Access alert if disconnected */}
      {!settings.isListenerConnected && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>{t.accessRequired}</span>
          </div>
          <button
            onClick={onToggleListenerConnection}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-semibold text-xs shadow-xs hover:bg-amber-600 transition-colors flex-shrink-0"
          >
            {t.enableAccess}
          </button>
        </div>
      )}

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Today Card */}
        <div
          onClick={() => onNavigateToHistory()}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${
            isDark
              ? 'bg-zinc-900/80 border-zinc-800 text-zinc-100 hover:border-zinc-700'
              : 'bg-white border-zinc-200/80 text-zinc-900 hover:border-zinc-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">{t.statToday}</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight">{todayCount}</div>
          <span className="text-[11px] text-zinc-400">Notifications</span>
        </div>

        {/* This Week Card */}
        <div
          onClick={onNavigateToInsights}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${
            isDark
              ? 'bg-zinc-900/80 border-zinc-800 text-zinc-100 hover:border-zinc-700'
              : 'bg-white border-zinc-200/80 text-zinc-900 hover:border-zinc-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">{t.statWeek}</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight">{weekCount}</div>
          <span className="text-[11px] text-zinc-400">Total volume</span>
        </div>

        {/* Unread Card */}
        <div
          onClick={() => onNavigateToHistory()}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${
            isDark
              ? 'bg-zinc-900/80 border-zinc-800 text-zinc-100 hover:border-zinc-700'
              : 'bg-white border-zinc-200/80 text-zinc-900 hover:border-zinc-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">{t.statUnread}</span>
            <Inbox className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            {unreadCount}
          </div>
          <span className="text-[11px] text-zinc-400">Pending review</span>
        </div>

        {/* Favorites Card */}
        <div
          onClick={() => onNavigateToHistory()}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${
            isDark
              ? 'bg-zinc-900/80 border-zinc-800 text-zinc-100 hover:border-zinc-700'
              : 'bg-white border-zinc-200/80 text-zinc-900 hover:border-zinc-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">{t.statFavorites}</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-500">
            {favoriteCount}
          </div>
          <span className="text-[11px] text-zinc-400">Starred items</span>
        </div>
      </div>

      {/* Quick Search Bar trigger */}
      <div
        id="home_search_trigger"
        onClick={() => onNavigateToHistory()}
        className={`w-full p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
          isDark
            ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
            : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-500 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-zinc-400" />
          <span className="text-xs">{t.searchPlaceholder}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title={t.calendarSearch}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            ⌘K
          </span>
        </div>
      </div>

      {/* Recent Notifications Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {t.recentNotifications}
            </h2>
            <span className="text-xs font-semibold text-zinc-400">({notifications.length})</span>
          </div>
          <button
            onClick={() => onNavigateToHistory()}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentList.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-400">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {t.noNotifications}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              {t.noNotificationsSub}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentList.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                isDark={isDark}
                isSelectMode={false}
                isSelected={false}
                onSelect={() => {}}
                onClick={onOpenDetail}
                onToggleFavorite={onToggleFavorite}
                onArchive={onArchive}
                onDelete={onDelete}
                language={language}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
