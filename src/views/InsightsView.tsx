import React from 'react';
import { NotificationItem, AppEntity } from '../types';
import { translations } from '../utils/i18n';
import { HeatmapView } from '../components/HeatmapView';
import {
  TrendingUp,
  Clock,
  PieChart,
  ShieldCheck,
  Calendar,
  Sparkles,
  BarChart3
} from 'lucide-react';

interface Props {
  notifications: NotificationItem[];
  apps: AppEntity[];
  isDark: boolean;
  language: 'en' | 'ar';
}

export const InsightsView: React.FC<Props> = ({
  notifications,
  apps,
  isDark,
  language,
}) => {
  const t = translations[language];

  // Calculate local statistics
  const now = Date.now();
  const oneDay = 1000 * 60 * 60 * 24;
  const todayCount = notifications.filter((n) => n.timestamp >= now - oneDay).length;
  const weekCount = notifications.filter((n) => n.timestamp >= now - oneDay * 7).length;
  const monthCount = notifications.filter((n) => n.timestamp >= now - oneDay * 30).length;
  const favoritesCount = notifications.filter((n) => n.isFavorite).length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Top apps by volume
  const topApps = React.useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    notifications.forEach((n) => {
      if (!counts[n.packageName]) {
        counts[n.packageName] = { name: n.appName, count: 0 };
      }
      counts[n.packageName].count += 1;
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [notifications]);

  // Peak Hour Calculation
  const peakHour = React.useMemo(() => {
    const hours = Array(24).fill(0);
    notifications.forEach((n) => {
      const h = new Date(n.timestamp).getHours();
      hours[h] += 1;
    });
    let maxHour = 20; // default 8pm
    let maxVal = 0;
    hours.forEach((val, h) => {
      if (val > maxVal) {
        maxVal = val;
        maxHour = h;
      }
    });

    const formatHour = (h: number) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      return `${displayH} ${period}`;
    };

    return `${formatHour(maxHour)} – ${formatHour((maxHour + 1) % 24)}`;
  }, [notifications]);

  // Category Distribution
  const categoryCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    notifications.forEach((n) => {
      map[n.category] = (map[n.category] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [notifications]);

  const topAppName = topApps[0]?.name || 'WhatsApp';

  return (
    <div id="insights_screen" className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t.analyticsTitle}
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            100% On-Device
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {t.analyticsSub}
        </p>
      </div>

      {/* Local Daily Summary Card */}
      <div className="p-5 rounded-3xl bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>{t.dailySummary}</span>
        </div>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
          {t.dailySummaryContent(todayCount, topAppName, favoritesCount, peakHour)}
        </p>
      </div>

      {/* Volume Overview Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
          }`}
        >
          <span className="text-xs text-zinc-400 font-semibold">{t.statToday}</span>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {todayCount}
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
          }`}
        >
          <span className="text-xs text-zinc-400 font-semibold">{t.statWeek}</span>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {weekCount}
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
          }`}
        >
          <span className="text-xs text-zinc-400 font-semibold">This Month</span>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {monthCount}
          </div>
        </div>
      </div>

      {/* 7-Day Activity Heatmap */}
      <div
        className={`p-5 rounded-3xl border ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>{t.heatmapTitle}</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{t.heatmapSub}</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-zinc-400 block">{t.peakHour}</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {peakHour}
            </span>
          </div>
        </div>

        <HeatmapView notifications={notifications} isDark={isDark} language={language} />
      </div>

      {/* Top Apps Distribution & Category Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Active Apps */}
        <div
          className={`p-5 rounded-3xl border ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
          }`}
        >
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>{t.topApps}</span>
          </h3>

          <div className="space-y-3">
            {topApps.map((app) => {
              const pct = notifications.length > 0 ? Math.round((app.count / notifications.length) * 100) : 0;
              return (
                <div key={app.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-700 dark:text-zinc-300">{app.name}</span>
                    <span className="text-zinc-400">{app.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div
          className={`p-5 rounded-3xl border ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
          }`}
        >
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-500" />
            <span>{t.categoryDistribution}</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {categoryCounts.map(([cat, count]) => (
              <div
                key={cat}
                className="px-3 py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs flex items-center gap-2"
              >
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{cat}</span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
