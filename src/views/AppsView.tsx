import React from 'react';
import { AppEntity, NotificationItem } from '../types';
import { translations } from '../utils/i18n';
import { NotificationCard } from '../components/NotificationCard';
import {
  Search,
  Shield,
  Ban,
  Clock,
  ChevronRight,
  X,
  Star,
  Trash2,
  Tag,
  Sliders,
  Check
} from 'lucide-react';

interface Props {
  apps: AppEntity[];
  notifications: NotificationItem[];
  isDark: boolean;
  language: 'en' | 'ar';
  onUpdateAppBlock: (pkg: string, isBlocked: boolean) => void;
  onUpdateAppSensitive: (pkg: string, isSensitive: boolean) => void;
  onOpenDetail: (item: NotificationItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onArchive: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const AppsView: React.FC<Props> = ({
  apps,
  notifications,
  isDark,
  language,
  onUpdateAppBlock,
  onUpdateAppSensitive,
  onOpenDetail,
  onToggleFavorite,
  onArchive,
  onDelete,
}) => {
  const [appSearch, setAppSearch] = React.useState('');
  const [selectedApp, setSelectedApp] = React.useState<AppEntity | null>(null);

  const t = translations[language];

  const filteredApps = React.useMemo(() => {
    return apps.filter(
      (a) =>
        a.appName.toLowerCase().includes(appSearch.toLowerCase()) ||
        a.packageName.toLowerCase().includes(appSearch.toLowerCase())
    );
  }, [apps, appSearch]);

  // Notifications for the selected app
  const appNotifications = React.useMemo(() => {
    if (!selectedApp) return [];
    return notifications.filter((n) => n.packageName === selectedApp.packageName);
  }, [notifications, selectedApp]);

  return (
    <div id="apps_screen" className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t.navApps}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {apps.length} applications logged in NotifyVault
        </p>
      </div>

      {/* App Search Bar */}
      <div
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border transition-all ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 focus-within:border-indigo-500'
            : 'bg-white border-zinc-200 focus-within:border-indigo-600 shadow-xs'
        }`}
      >
        <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        <input
          id="input_apps_search"
          type="text"
          value={appSearch}
          onChange={(e) => setAppSearch(e.target.value)}
          placeholder="Filter applications by name or package..."
          className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
        />
        {appSearch && (
          <button
            onClick={() => setAppSearch('')}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* App List */}
      <div className="space-y-2.5">
        {filteredApps.map((app) => {
          const appNotifs = notifications.filter((n) => n.packageName === app.packageName);
          const unread = appNotifs.filter((n) => !n.isRead).length;
          const favorites = appNotifs.filter((n) => n.isFavorite).length;

          return (
            <div
              key={app.packageName}
              id={`app_row_${app.packageName.replace(/\./g, '_')}`}
              onClick={() => setSelectedApp(app)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-200'
                  : 'bg-white hover:bg-zinc-50 border-zinc-200/80 text-zinc-800 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
                  {app.appName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm truncate">{app.appName}</h4>
                    {app.isBlocked && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        Blocked
                      </span>
                    )}
                    {app.isSensitive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Sensitive
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate font-mono mt-0.5">
                    {app.packageName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {appNotifs.length}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    {unread > 0 && <span className="text-indigo-500 font-semibold">{unread} unread</span>}
                    {favorites > 0 && <span>• {favorites} ★</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* App Detail Modal */}
      {selectedApp && (
        <div
          id="app_detail_modal_overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedApp(null)}
        >
          <div
            id="app_detail_modal"
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-xl max-h-[88vh] flex flex-col rounded-3xl p-6 shadow-2xl border ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                  {selectedApp.appName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base">{selectedApp.appName}</h3>
                  <p className="text-xs text-zinc-400 font-mono">{selectedApp.packageName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* App Settings Toggles */}
            <div className="my-4 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onUpdateAppBlock(selectedApp.packageName, !selectedApp.isBlocked)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-colors ${
                  selectedApp.isBlocked
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" />
                    <span>Do Not Save</span>
                  </div>
                  <p className="text-[10px] opacity-70 mt-0.5">Ignore future notifications</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedApp.isBlocked ? 'bg-rose-600 text-white border-rose-600' : 'border-zinc-400'
                  }`}
                >
                  {selectedApp.isBlocked && <Check className="w-2.5 h-2.5" />}
                </div>
              </button>

              <button
                onClick={() => onUpdateAppSensitive(selectedApp.packageName, !selectedApp.isSensitive)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-colors ${
                  selectedApp.isSensitive
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Sensitive App</span>
                  </div>
                  <p className="text-[10px] opacity-70 mt-0.5">Mask OTP / content</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedApp.isSensitive ? 'bg-amber-600 text-white border-amber-600' : 'border-zinc-400'
                  }`}
                >
                  {selectedApp.isSensitive && <Check className="w-2.5 h-2.5" />}
                </div>
              </button>
            </div>

            {/* Notification History for this app */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                <span>Notification History ({appNotifications.length})</span>
              </div>

              {appNotifications.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-xs">
                  No notifications recorded for this application.
                </div>
              ) : (
                appNotifications.map((item) => (
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
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
