import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { AndroidStatusBar, AndroidNavigationBar } from './AndroidStatusBar';

interface Props {
  isDark: boolean;
  activeCount: number;
  onHome: () => void;
  onBack: () => void;
  children: React.ReactNode;
  systemNotification: {
    appName: string;
    title: string;
    text: string;
    icon?: string;
  } | null;
  onDismissSystemNotification: () => void;
}

export const AndroidDeviceFrame: React.FC<Props> = ({
  isDark,
  activeCount,
  onHome,
  onBack,
  children,
  systemNotification,
  onDismissSystemNotification,
}) => {
  const [isPhoneMode, setIsPhoneMode] = React.useState(true);

  return (
    <div className="w-full flex flex-col items-center justify-start min-h-screen py-4 px-2 sm:px-4">
      {/* Mode Switcher toolbar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-2 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            NotifyVault Device View:
          </span>
          <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-xl">
            <button
              onClick={() => setIsPhoneMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                isPhoneMode
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Mockup</span>
            </button>
            <button
              onClick={() => setIsPhoneMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                !isPhoneMode
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Expanded View</span>
            </button>
          </div>
        </div>

        <span className="hidden sm:inline text-[11px] opacity-70">
          Android 15 • Material 3 • Room 2.6 • Local Only
        </span>
      </div>

      {/* Frame Container */}
      <div
        className={`relative w-full transition-all duration-300 flex flex-col ${
          isPhoneMode
            ? 'max-w-[440px] h-[890px] rounded-[44px] shadow-2xl ring-8 ring-zinc-800/60 dark:ring-zinc-800 overflow-hidden border-4 border-zinc-900'
            : 'max-w-4xl rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden'
        } ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}
      >
        {/* Android Status Bar */}
        <AndroidStatusBar isDark={isDark} activeCount={activeCount} />

        {/* Incoming System Notification Heads-Up Banner */}
        {systemNotification && (
          <div
            id="android_system_heads_up_notification"
            onClick={onDismissSystemNotification}
            className="absolute top-10 left-3 right-3 z-40 p-3 rounded-2xl bg-zinc-900/95 dark:bg-zinc-800/95 text-white shadow-2xl border border-zinc-700/80 flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-top-4 duration-200 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {systemNotification.appName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-300 truncate">
                  {systemNotification.appName}
                </span>
                <span className="text-[10px] text-zinc-400">now</span>
              </div>
              <h5 className="text-xs font-semibold truncate mt-0.5">
                {systemNotification.title}
              </h5>
              <p className="text-[11px] text-zinc-300 truncate">
                {systemNotification.text}
              </p>
            </div>
          </div>
        )}

        {/* Inner App Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>

        {/* Android Navigation Bar */}
        <AndroidNavigationBar isDark={isDark} onHome={onHome} onBack={onBack} />
      </div>
    </div>
  );
};
