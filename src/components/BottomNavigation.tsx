import React from 'react';
import { Home, History, Grid, BarChart3, Settings } from 'lucide-react';
import { translations } from '../utils/i18n';

export type NavTab = 'home' | 'history' | 'apps' | 'insights' | 'settings';

interface Props {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  isDark: boolean;
  language: 'en' | 'ar';
  unreadCount: number;
}

export const BottomNavigation: React.FC<Props> = ({
  activeTab,
  onChangeTab,
  isDark,
  language,
  unreadCount,
}) => {
  const t = translations[language];

  const tabs: { id: NavTab; label: string; icon: any; badge?: number }[] = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'history', label: t.navHistory, icon: History, badge: unreadCount },
    { id: 'apps', label: t.navApps, icon: Grid },
    { id: 'insights', label: t.navInsights, icon: BarChart3 },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  return (
    <nav
      id="bottom_navigation_bar"
      className={`w-full py-1 px-4 flex items-center justify-around border-t select-none transition-colors z-20 ${
        isDark
          ? 'bg-zinc-950/95 border-zinc-800/80 backdrop-blur-md'
          : 'bg-white/95 border-zinc-200/80 backdrop-blur-md shadow-xs'
      }`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`btn_nav_${tab.id}`}
            onClick={() => onChangeTab(tab.id)}
            className="flex-1 py-1.5 flex flex-col items-center justify-center gap-1 relative group"
          >
            {/* Active Pill indicator */}
            <div
              className={`px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs scale-105'
                  : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[11px] font-medium tracking-tight transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
