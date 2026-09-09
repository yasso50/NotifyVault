import React from 'react';
import {
  NotificationItem,
  AppEntity,
  NotificationRule,
  AppSettings,
  FilterOptions,
} from './types';
import { NotifyVaultDB } from './utils/database';
import { translations } from './utils/i18n';
import { AndroidDeviceFrame } from './components/AndroidDeviceFrame';
import { NotificationSimulatorBar } from './components/NotificationSimulatorBar';
import { BottomNavigation, NavTab } from './components/BottomNavigation';
import { NotificationDetailModal } from './components/NotificationDetailModal';
import { FilterBottomSheet } from './components/FilterBottomSheet';
import { OnboardingModal } from './components/OnboardingModal';
import { PrivacyLockModal } from './components/PrivacyLockModal';
import { AndroidSourceViewerModal } from './components/AndroidSourceViewerModal';

// Views
import { HomeView } from './views/HomeView';
import { HistoryView } from './views/HistoryView';
import { AppsView } from './views/AppsView';
import { InsightsView } from './views/InsightsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = React.useState<NavTab>('home');
  const [tabHistory, setTabHistory] = React.useState<NavTab[]>(['home']);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [apps, setApps] = React.useState<AppEntity[]>([]);
  const [rules, setRules] = React.useState<NotificationRule[]>([]);
  const [settings, setSettings] = React.useState<AppSettings>(NotifyVaultDB.getSettings());

  // UI Modals & Sheets
  const [selectedDetailItem, setSelectedDetailItem] = React.useState<NotificationItem | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);
  const [isSourceViewerOpen, setIsSourceViewerOpen] = React.useState(false);
  const [isLocked, setIsLocked] = React.useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);
  const [systemNotification, setSystemNotification] = React.useState<{
    appName: string;
    title: string;
    text: string;
  } | null>(null);

  // Undo deletion snackbar
  const [undoItem, setUndoItem] = React.useState<NotificationItem | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Filters
  const [filters, setFilters] = React.useState<FilterOptions>({
    searchQuery: '',
    selectedApps: [],
    dateRange: 'all',
    status: 'all',
    category: '',
    importance: 'all',
  });

  // Load initial data from local DB
  React.useEffect(() => {
    const loadedNotifs = NotifyVaultDB.getNotifications();
    const loadedApps = NotifyVaultDB.getApps();
    const loadedRules = NotifyVaultDB.getRules();
    const loadedSettings = NotifyVaultDB.getSettings();

    setNotifications(loadedNotifs);
    setApps(loadedApps);
    setRules(loadedRules);
    setSettings(loadedSettings);

    if (loadedSettings.privacyLockEnabled) {
      setIsLocked(true);
    }
    if (!loadedSettings.onboardingCompleted) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Update HTML document direction and theme
  React.useEffect(() => {
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.language, settings.theme]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTabChange = (newTab: NavTab) => {
    setActiveTab(newTab);
    setTabHistory((prev) => [...prev, newTab]);
  };

  const handleBack = () => {
    if (selectedDetailItem) {
      setSelectedDetailItem(null);
      return;
    }
    if (isFilterSheetOpen) {
      setIsFilterSheetOpen(false);
      return;
    }
    if (tabHistory.length > 1) {
      const prev = [...tabHistory];
      prev.pop();
      setActiveTab(prev[prev.length - 1]);
      setTabHistory(prev);
    } else if (activeTab !== 'home') {
      setActiveTab('home');
    }
  };

  // Notification Actions
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    NotifyVaultDB.toggleFavorite(id);
    setNotifications(NotifyVaultDB.getNotifications());
    setApps(NotifyVaultDB.getApps());
  };

  const handleToggleArchive = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    NotifyVaultDB.toggleArchive(id);
    setNotifications(NotifyVaultDB.getNotifications());
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const deleted = NotifyVaultDB.deleteNotification(id);
    if (deleted) {
      setUndoItem(deleted);
      setNotifications(NotifyVaultDB.getNotifications());
      setApps(NotifyVaultDB.getApps());
      showToast('Notification deleted');
      setTimeout(() => setUndoItem(null), 5000);
    }
  };

  const handleUndoDelete = () => {
    if (undoItem) {
      NotifyVaultDB.restoreNotifications([undoItem]);
      setNotifications(NotifyVaultDB.getNotifications());
      setApps(NotifyVaultDB.getApps());
      setUndoItem(null);
      showToast('Deletion undone');
    }
  };

  const handleBulkDelete = (ids: string[]) => {
    const deleted = NotifyVaultDB.bulkDelete(ids);
    setNotifications(NotifyVaultDB.getNotifications());
    setApps(NotifyVaultDB.getApps());
    showToast(`${deleted.length} notifications deleted`);
  };

  const handleBulkArchive = (ids: string[]) => {
    ids.forEach((id) => NotifyVaultDB.toggleArchive(id));
    setNotifications(NotifyVaultDB.getNotifications());
    showToast(`${ids.length} notifications archived`);
  };

  const handleBulkFavorite = (ids: string[]) => {
    ids.forEach((id) => NotifyVaultDB.toggleFavorite(id));
    setNotifications(NotifyVaultDB.getNotifications());
    showToast(`${ids.length} notifications favorited`);
  };

  const handleBulkMarkRead = (ids: string[]) => {
    ids.forEach((id) => NotifyVaultDB.markAsRead(id));
    setNotifications(NotifyVaultDB.getNotifications());
    setApps(NotifyVaultDB.getApps());
    showToast(`${ids.length} notifications marked as read`);
  };

  const handleAddTag = (id: string, tag: string) => {
    NotifyVaultDB.addTagToNotification(id, tag);
    setNotifications(NotifyVaultDB.getNotifications());
    if (selectedDetailItem?.id === id) {
      setSelectedDetailItem(NotifyVaultDB.getNotifications().find((n) => n.id === id) || null);
    }
  };

  const handleRemoveTag = (id: string, tag: string) => {
    NotifyVaultDB.removeTagFromNotification(id, tag);
    setNotifications(NotifyVaultDB.getNotifications());
    if (selectedDetailItem?.id === id) {
      setSelectedDetailItem(NotifyVaultDB.getNotifications().find((n) => n.id === id) || null);
    }
  };

  // App-specific rules
  const handleUpdateAppBlock = (pkg: string, isBlocked: boolean) => {
    NotifyVaultDB.updateAppBlock(pkg, isBlocked);
    setApps(NotifyVaultDB.getApps());
  };

  const handleUpdateAppSensitive = (pkg: string, isSensitive: boolean) => {
    NotifyVaultDB.updateAppSensitive(pkg, isSensitive);
    setApps(NotifyVaultDB.getApps());
  };

  // Rules
  const handleSaveRule = (rule: NotificationRule) => {
    NotifyVaultDB.saveRule(rule);
    setRules(NotifyVaultDB.getRules());
    showToast('Rule saved');
  };

  const handleDeleteRule = (id: string) => {
    NotifyVaultDB.deleteRule(id);
    setRules(NotifyVaultDB.getRules());
    showToast('Rule deleted');
  };

  // Settings
  const handleUpdateSettings = (newSettings: AppSettings) => {
    NotifyVaultDB.saveSettings(newSettings);
    setSettings(newSettings);
  };

  // Cleanup
  const handleCleanUpNow = () => {
    const removed = NotifyVaultDB.executeSmartCleanup();
    setNotifications(NotifyVaultDB.getNotifications());
    setApps(NotifyVaultDB.getApps());
    showToast(translations[settings.language].cleanedToast(removed));
  };

  // Test data benchmark
  const handleGenerateTestData = (count: number) => {
    NotifyVaultDB.generateTestData(count);
    setNotifications(NotifyVaultDB.getNotifications());
    setApps(NotifyVaultDB.getApps());
  };

  const handleClearAll = () => {
    NotifyVaultDB.clearAllData();
    setNotifications([]);
    showToast('All notifications cleared');
  };

  const handleResetToDefault = () => {
    NotifyVaultDB.resetToDefault();
    setNotifications(NotifyVaultDB.getNotifications());
    setApps(NotifyVaultDB.getApps());
    setRules(NotifyVaultDB.getRules());
    setSettings(NotifyVaultDB.getSettings());
    showToast('Reset to sample data');
  };

  // Export / Import
  const handleExport = (format: 'json' | 'csv') => {
    const content = NotifyVaultDB.exportData(format);
    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifyvault_export_${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${format.toUpperCase()}`);
  };

  const handleImport = (jsonText: string) => {
    const res = NotifyVaultDB.importData(jsonText);
    if (res.success) {
      setNotifications(NotifyVaultDB.getNotifications());
      setApps(NotifyVaultDB.getApps());
      showToast(`Imported ${res.count} notifications`);
    } else {
      showToast(res.error || 'Import failed');
    }
  };

  // Simulated Incoming Notification Injection
  const handleInjectNotification = (raw: {
    packageName: string;
    appName: string;
    title: string;
    text: string;
    bigText?: string;
  }) => {
    const result = NotifyVaultDB.processIncomingNotification(raw);
    if (result.item) {
      setNotifications(NotifyVaultDB.getNotifications());
      setApps(NotifyVaultDB.getApps());

      // Show heads-up banner on device
      setSystemNotification({
        appName: raw.appName,
        title: raw.title,
        text: raw.text,
      });
      setTimeout(() => setSystemNotification(null), 4500);
    } else {
      showToast(`Dropped: ${result.reason}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isDark = settings.theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-900'}`}>
      {/* Top Simulation Bar */}
      <NotificationSimulatorBar
        isConnected={settings.isListenerConnected}
        onToggleConnection={() =>
          handleUpdateSettings({
            ...settings,
            isListenerConnected: !settings.isListenerConnected,
          })
        }
        onInject={handleInjectNotification}
        onOpenSourceViewer={() => setIsSourceViewerOpen(true)}
        isDark={isDark}
        language={settings.language}
      />

      {/* Main Android Device Frame */}
      <AndroidDeviceFrame
        isDark={isDark}
        activeCount={unreadCount}
        onHome={() => setActiveTab('home')}
        onBack={handleBack}
        systemNotification={systemNotification}
        onDismissSystemNotification={() => setSystemNotification(null)}
      >
        {activeTab === 'home' && (
          <HomeView
            notifications={notifications}
            settings={settings}
            isDark={isDark}
            language={settings.language}
            onOpenDetail={(item) => {
              NotifyVaultDB.markAsRead(item.id);
              setSelectedDetailItem(item);
              setNotifications(NotifyVaultDB.getNotifications());
            }}
            onToggleFavorite={handleToggleFavorite}
            onArchive={handleToggleArchive}
            onDelete={handleDelete}
            onNavigateToHistory={(query) => {
              if (query !== undefined) {
                setFilters({ ...filters, searchQuery: query });
              }
              handleTabChange('history');
            }}
            onNavigateToInsights={() => handleTabChange('insights')}
            onToggleListenerConnection={() =>
              handleUpdateSettings({
                ...settings,
                isListenerConnected: !settings.isListenerConnected,
              })
            }
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            notifications={notifications}
            apps={apps}
            filters={filters}
            onUpdateFilters={setFilters}
            onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
            isDark={isDark}
            language={settings.language}
            onOpenDetail={(item) => {
              NotifyVaultDB.markAsRead(item.id);
              setSelectedDetailItem(item);
              setNotifications(NotifyVaultDB.getNotifications());
            }}
            onToggleFavorite={handleToggleFavorite}
            onArchive={handleToggleArchive}
            onDelete={handleDelete}
            onBulkDelete={handleBulkDelete}
            onBulkArchive={handleBulkArchive}
            onBulkFavorite={handleBulkFavorite}
            onBulkMarkRead={handleBulkMarkRead}
          />
        )}

        {activeTab === 'apps' && (
          <AppsView
            apps={apps}
            notifications={notifications}
            isDark={isDark}
            language={settings.language}
            onUpdateAppBlock={handleUpdateAppBlock}
            onUpdateAppSensitive={handleUpdateAppSensitive}
            onOpenDetail={(item) => {
              NotifyVaultDB.markAsRead(item.id);
              setSelectedDetailItem(item);
              setNotifications(NotifyVaultDB.getNotifications());
            }}
            onToggleFavorite={handleToggleFavorite}
            onArchive={handleToggleArchive}
            onDelete={handleDelete}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            notifications={notifications}
            apps={apps}
            isDark={isDark}
            language={settings.language}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            rules={rules}
            onSaveRule={handleSaveRule}
            onDeleteRule={handleDeleteRule}
            apps={apps}
            isDark={isDark}
            language={settings.language}
            onCleanUpNow={handleCleanUpNow}
            cleanupCandidateCount={NotifyVaultDB.getCleanupCandidateCount()}
            onGenerateTestData={handleGenerateTestData}
            onExport={handleExport}
            onImport={handleImport}
            onClearAll={handleClearAll}
            onResetToDefault={handleResetToDefault}
          />
        )}
      </AndroidDeviceFrame>

      {/* Sticky Bottom Navigation on Phone */}
      <div className="fixed bottom-0 left-0 right-0 z-30 max-w-[440px] mx-auto">
        <BottomNavigation
          activeTab={activeTab}
          onChangeTab={handleTabChange}
          isDark={isDark}
          language={settings.language}
          unreadCount={unreadCount}
        />
      </div>

      {/* Undo Snackbar */}
      {undoItem && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900 text-white shadow-2xl border border-zinc-700 flex items-center gap-3 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200">
          <span>Notification deleted</span>
          <button
            onClick={handleUndoDelete}
            className="text-indigo-400 font-bold hover:underline"
          >
            Undo
          </button>
        </div>
      )}

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-100 text-xs font-semibold shadow-lg animate-in fade-in duration-150">
          {toastMessage}
        </div>
      )}

      {/* Detail Modal */}
      <NotificationDetailModal
        item={selectedDetailItem}
        isOpen={!!selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        isDark={isDark}
        language={settings.language}
        onToggleFavorite={(id) => handleToggleFavorite(id)}
        onToggleArchive={(id) => handleToggleArchive(id)}
        onDelete={(id) => handleDelete(id)}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        apps={apps}
        isDark={isDark}
        language={settings.language}
      />

      {/* Onboarding Dialog */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => {
          setIsOnboardingOpen(false);
          handleUpdateSettings({ ...settings, onboardingCompleted: true });
        }}
        isDark={isDark}
        language={settings.language}
      />

      {/* Privacy Lock Modal */}
      <PrivacyLockModal
        isOpen={isLocked}
        correctPin={settings.privacyPin || '1234'}
        onUnlocked={() => setIsLocked(false)}
        isDark={isDark}
        language={settings.language}
      />

      {/* Android Studio Source Inspector Modal */}
      <AndroidSourceViewerModal
        isOpen={isSourceViewerOpen}
        onClose={() => setIsSourceViewerOpen(false)}
        isDark={isDark}
      />
    </div>
  );
}
