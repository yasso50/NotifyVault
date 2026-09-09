import React from 'react';
import { AppSettings, NotificationRule, AppEntity } from '../types';
import { translations } from '../utils/i18n';
import {
  Shield,
  Lock,
  Key,
  HardDrive,
  Trash2,
  Sliders,
  Plus,
  Moon,
  Sun,
  Globe,
  Download,
  Upload,
  Cpu,
  Check,
  AlertCircle,
  Sparkles,
  Smartphone,
  ExternalLink,
  Copy
} from 'lucide-react';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  rules: NotificationRule[];
  onSaveRule: (r: NotificationRule) => void;
  onDeleteRule: (id: string) => void;
  apps: AppEntity[];
  isDark: boolean;
  language: 'en' | 'ar';
  onCleanUpNow: () => void;
  cleanupCandidateCount: number;
  onGenerateTestData: (count: number) => void;
  onExport: (format: 'json' | 'csv') => void;
  onImport: (jsonText: string) => void;
  onClearAll: () => void;
  onResetToDefault: () => void;
}

export const SettingsView: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  rules,
  onSaveRule,
  onDeleteRule,
  apps,
  isDark,
  language,
  onCleanUpNow,
  cleanupCandidateCount,
  onGenerateTestData,
  onExport,
  onImport,
  onClearAll,
  onResetToDefault,
}) => {
  const [showRuleModal, setShowRuleModal] = React.useState(false);
  const [newRuleName, setNewRuleName] = React.useState('');
  const [newRuleApp, setNewRuleApp] = React.useState('');
  const [newRuleKeyword, setNewRuleKeyword] = React.useState('');
  const [newRuleTag, setNewRuleTag] = React.useState('Important');
  const [benchmarkResult, setBenchmarkResult] = React.useState<string | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = React.useState(false);

  const t = translations[language];

  const handleCopyAppUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 3000);
    });
  };

  const handleBenchmark = (count: number) => {
    const start = performance.now();
    onGenerateTestData(count);
    const ms = Math.round(performance.now() - start);
    setBenchmarkResult(t.benchmarkResult(count, ms));
    setTimeout(() => setBenchmarkResult(null), 4000);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRuleName.trim()) {
      const rule: NotificationRule = {
        id: `rule_${Date.now()}`,
        name: newRuleName.trim(),
        isEnabled: true,
        conditionApp: newRuleApp || undefined,
        conditionTitleContains: newRuleKeyword || undefined,
        actionSave: true,
        actionTag: newRuleTag,
        actionFavorite: true,
      };
      onSaveRule(rule);
      setNewRuleName('');
      setNewRuleKeyword('');
      setShowRuleModal(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        try {
          onImport(text);
          setImportError(null);
        } catch (err: any) {
          setImportError(err.message || 'Import failed');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div id="settings_screen" className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t.settingsTitle}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Local configuration, privacy controls, and on-device storage policies
        </p>
      </div>

      {/* 1. Privacy & Security Section */}
      <div
        className={`p-5 rounded-3xl border ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}
      >
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>{t.privacySection}</span>
        </h3>

        <div className="space-y-4 text-xs">
          {/* App Lock Switch */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                {t.privacyLock}
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">{t.privacyLockSub}</p>
            </div>
            <button
              id="btn_toggle_privacy_lock"
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  privacyLockEnabled: !settings.privacyLockEnabled,
                })
              }
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.privacyLockEnabled ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  settings.privacyLockEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* OTP Handling Selector */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <label className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-2">
              {t.otpHandling}
            </label>
            <div className="space-y-1.5">
              {[
                { key: 'mask', label: t.otpMask },
                { key: 'never', label: t.otpNever },
                { key: 'normal', label: t.otpNormal },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() =>
                    onUpdateSettings({ ...settings, otpMode: opt.key as any })
                  }
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors ${
                    settings.otpMode === opt.key
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <span>{opt.label}</span>
                  {settings.otpMode === opt.key && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Storage & Retention Section */}
      <div
        className={`p-5 rounded-3xl border ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}
      >
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-500" />
          <span>{t.storageSection}</span>
        </h3>

        <div className="space-y-4 text-xs">
          {/* Retention Period Selector */}
          <div>
            <label className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-1.5">
              {t.retentionPolicy}
            </label>
            <p className="text-zinc-500 dark:text-zinc-400 mb-2">{t.retentionSub}</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: '1d', label: '1 Day' },
                { key: '3d', label: '3 Days' },
                { key: '7d', label: '7 Days' },
                { key: '30d', label: '30 Days' },
                { key: '90d', label: '90 Days' },
                { key: '1y', label: '1 Year' },
                { key: 'forever', label: 'Forever' },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      retention: { ...settings.retention, period: p.key as any },
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl font-medium border transition-colors ${
                    settings.retention.period === p.key
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Smart Clean Up Box */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t.cleanUpNow}</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t.cleanUpConfirm(cleanupCandidateCount)}
              </p>
            </div>
            <button
              id="btn_execute_cleanup"
              disabled={cleanupCandidateCount === 0}
              onClick={onCleanUpNow}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs disabled:opacity-40 shadow-xs transition-colors flex-shrink-0"
            >
              {t.executeClean}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Automation Rule Engine Section */}
      <div
        className={`p-5 rounded-3xl border ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-500" />
              <span>{t.ruleEngineSection}</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{t.rulesSub}</p>
          </div>
          <button
            onClick={() => setShowRuleModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.createRule}</span>
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">{rule.name}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {rule.conditionTitleContains && `Contains "${rule.conditionTitleContains}" `}
                  {rule.actionTag && `→ Tag "${rule.actionTag}" `}
                  {rule.actionMask && `→ Mask OTP `}
                </div>
              </div>
              <button
                onClick={() => onDeleteRule(rule.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Appearance & Language */}
      <div
        className={`p-5 rounded-3xl border ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}
      >
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-500" />
          <span>{t.appearanceSection}</span>
        </h3>

        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* Language Selector */}
          <div>
            <label className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-2">
              {t.language}
            </label>
            <div className="space-y-1.5">
              <button
                onClick={() => onUpdateSettings({ ...settings, language: 'en' })}
                className={`w-full p-2.5 rounded-xl border text-left transition-colors ${
                  settings.language === 'en'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                English (LTR)
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, language: 'ar' })}
                className={`w-full p-2.5 rounded-xl border text-left transition-colors ${
                  settings.language === 'ar'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                العربية (RTL)
              </button>
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-2">
              {t.theme}
            </label>
            <div className="space-y-1.5">
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                className={`w-full p-2.5 rounded-xl border flex items-center gap-2 transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>{t.lightTheme}</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                className={`w-full p-2.5 rounded-xl border flex items-center gap-2 transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>{t.darkTheme}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Developer Test Data Generator & Benchmarking */}
      <div
        className={`p-5 rounded-3xl border ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}
      >
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-amber-500" />
          <span>{t.developerSection}</span>
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{t.benchmarkSub}</p>

        {benchmarkResult && (
          <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            {benchmarkResult}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleBenchmark(10)}
            className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold transition-colors"
          >
            {t.generate10}
          </button>
          <button
            onClick={() => handleBenchmark(100)}
            className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold transition-colors"
          >
            {t.generate100}
          </button>
          <button
            onClick={() => handleBenchmark(1000)}
            className="py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold transition-colors"
          >
            {t.generate1k}
          </button>
          <button
            onClick={() => handleBenchmark(10000)}
            className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            {t.generate10k}
          </button>
        </div>
      </div>

      {/* 6. Backup, Export & Reset */}
      <div
        className={`p-5 rounded-3xl border ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}
      >
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-500" />
          <span>{t.exportImport}</span>
        </h3>
        <p className="text-xs text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{t.exportWarning}</span>
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onExport('json')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
          >
            {t.exportJson}
          </button>
          <button
            onClick={() => onExport('csv')}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold"
          >
            {t.exportCsv}
          </button>

          <label className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold cursor-pointer">
            <span>{t.importJson}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={onResetToDefault}
            className="px-4 py-2 rounded-xl text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xs font-semibold ml-auto"
          >
            Reset Sample Data
          </button>
          <button
            onClick={onClearAll}
            className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
          >
            Clear All History
          </button>
        </div>
      </div>

      {/* 7. APK & Android Mobile Installation */}
      <div
        id="apk_download_section"
        className={`p-5 rounded-3xl border ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span>{t.apkDownloadSection}</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Android Ready
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{t.apkDownloadSub}</p>

        <div className="space-y-3 text-xs">
          {/* Option 1: PWA Instant Mobile Install */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {t.pwaInstallTitle}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                أسرع وأسهل خيار
              </span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 mb-2.5 leading-relaxed">
              {t.pwaInstallDesc}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyAppUrl}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? t.copiedAppUrl : t.copyAppUrl}</span>
              </button>
            </div>
          </div>

          {/* Option 2: Native Android Studio APK */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
              {t.androidStudioTitle}
            </span>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-2">
              {t.androidStudioDesc}
            </p>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-[11px] text-zinc-600 dark:text-zinc-300 select-all border border-zinc-200 dark:border-zinc-800">
              android/app/build/outputs/apk/debug/app-debug.apk
            </div>
          </div>

          {/* Option 3: PWABuilder Online APK Generator */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
              {t.pwaBuilderTitle}
            </span>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-2.5">
              {t.pwaBuilderDesc}
            </p>
            <a
              href="https://www.pwabuilder.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100 font-medium transition-colors"
            >
              <span>فتح موقع PWABuilder.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* New Rule Modal */}
      {showRuleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowRuleModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <h3 className="text-sm font-bold mb-3">Create Automation Rule</h3>
            <form onSubmit={handleCreateRule} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g. Star Flights"
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Condition: Keyword in Title</label>
                <input
                  type="text"
                  value={newRuleKeyword}
                  onChange={(e) => setNewRuleKeyword(e.target.value)}
                  placeholder="e.g. Flight, Booking, OTP"
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Action: Assign Tag</label>
                <select
                  value={newRuleTag}
                  onChange={(e) => setNewRuleTag(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
                >
                  <option value="Important">Important</option>
                  <option value="Work">Work</option>
                  <option value="Bills">Bills</option>
                  <option value="Orders">Orders</option>
                  <option value="Travel">Travel</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-medium"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
