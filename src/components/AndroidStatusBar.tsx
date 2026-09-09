import React from 'react';
import { Wifi, Signal, Battery, Bell } from 'lucide-react';

interface Props {
  isDark: boolean;
  activeCount: number;
}

export const AndroidStatusBar: React.FC<Props> = ({ isDark, activeCount }) => {
  const [time, setTime] = React.useState('10:15');

  React.useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="android_status_bar"
      className={`w-full px-5 pt-3 pb-1 flex items-center justify-between text-xs font-medium select-none z-30 transition-colors ${
        isDark ? 'bg-zinc-950 text-zinc-200' : 'bg-zinc-100 text-zinc-700'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold tracking-tight">{time}</span>
        {activeCount > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-indigo-500 font-bold ml-1">
            <Bell className="w-3 h-3 animate-pulse" />
            <span>{activeCount}</span>
          </div>
        )}
      </div>

      {/* Pill notch simulation */}
      <div className="w-16 h-3 bg-zinc-800/40 rounded-full mx-auto" />

      <div className="flex items-center gap-1.5 opacity-90">
        <Wifi className="w-3.5 h-3.5" />
        <Signal className="w-3.5 h-3.5" />
        <div className="flex items-center gap-0.5">
          <Battery className="w-4 h-4" />
          <span className="text-[10px]">94%</span>
        </div>
      </div>
    </div>
  );
};

export const AndroidNavigationBar: React.FC<{ isDark: boolean; onHome?: () => void; onBack?: () => void }> = ({
  isDark,
  onHome,
  onBack,
}) => {
  return (
    <div
      id="android_navigation_bar"
      className={`w-full py-2.5 px-8 flex items-center justify-around select-none border-t transition-colors ${
        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500'
      }`}
    >
      <button
        id="btn_nav_back"
        onClick={onBack}
        className="p-1 rounded-full hover:bg-zinc-500/20 active:scale-95 transition-transform"
        title="Android Back"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      </button>

      <button
        id="btn_nav_home"
        onClick={onHome}
        className="w-14 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 hover:bg-zinc-600 transition-colors"
        title="Android Home"
      />

      <button
        id="btn_nav_recents"
        className="p-1 rounded-full hover:bg-zinc-500/20 active:scale-95 transition-transform"
        title="Android Recents"
      >
        <div className="w-3.5 h-3.5 rounded-sm border-2 border-current" />
      </button>
    </div>
  );
};
