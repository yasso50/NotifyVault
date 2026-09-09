import React from 'react';
import { translations } from '../utils/i18n';
import { Radio, Plus, MessageSquare, ShieldCheck, Mail, Truck, Code, Download } from 'lucide-react';

interface Props {
  isConnected: boolean;
  onToggleConnection: () => void;
  onInject: (data: {
    packageName: string;
    appName: string;
    title: string;
    text: string;
    bigText?: string;
  }) => void;
  onOpenSourceViewer: () => void;
  isDark: boolean;
  language: 'en' | 'ar';
}

export const NotificationSimulatorBar: React.FC<Props> = ({
  isConnected,
  onToggleConnection,
  onInject,
  onOpenSourceViewer,
  isDark,
  language,
}) => {
  const [showCustomModal, setShowCustomModal] = React.useState(false);
  const [customPkg, setCustomPkg] = React.useState('com.custom.app');
  const [customAppName, setCustomAppName] = React.useState('Custom App');
  const [customTitle, setCustomTitle] = React.useState('');
  const [customText, setCustomText] = React.useState('');

  const t = translations[language];

  const handleQuickInject = (type: 'wa' | 'otp' | 'jahez' | 'gm') => {
    if (type === 'wa') {
      onInject({
        packageName: 'com.whatsapp',
        appName: 'WhatsApp',
        title: 'Omar Farooq',
        text: 'Hey, are you free for a quick call regarding the security audit?',
        bigText: 'Hey, are you free for a quick call regarding the security audit? The report looks ready.',
      });
    } else if (type === 'otp') {
      const code = Math.floor(100000 + Math.random() * 900000);
      onInject({
        packageName: 'com.alrajhicapital.app',
        appName: 'Al Rajhi Bank',
        title: 'مصرف الراجحي - رمز أمان',
        text: `رمز التحقق المؤقت للدخول إلى حسابك هو ${code}. صالح لمدة 3 دقائق.`,
        bigText: `رمز التحقق المؤقت للدخول إلى حسابك هو ${code}. لا تفصح عن هذا الرمز لأي شخص مطلقاً.`,
      });
    } else if (type === 'jahez') {
      onInject({
        packageName: 'com.jahez.customer',
        appName: 'Jahez',
        title: 'جاهز - تحديث الطلب السريع',
        text: 'كابتن التوصيل عبد الله في الطريق لتسليم طلبك الآن!',
      });
    } else if (type === 'gm') {
      onInject({
        packageName: 'com.google.android.gm',
        appName: 'Gmail',
        title: 'Stripe Billing',
        text: 'Your subscription for Cloud Infrastructure was renewed: $49.00',
      });
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTitle && customText) {
      onInject({
        packageName: customPkg,
        appName: customAppName,
        title: customTitle,
        text: customText,
      });
      setCustomTitle('');
      setCustomText('');
      setShowCustomModal(false);
    }
  };

  return (
    <>
      <div
        id="simulator_toolbar"
        className={`w-full px-4 py-2.5 flex items-center justify-between gap-3 text-xs border-b select-none transition-colors ${
          isDark
            ? 'bg-zinc-950/90 border-zinc-800 text-zinc-300'
            : 'bg-zinc-50 border-zinc-200 text-zinc-700'
        }`}
      >
        {/* Connection status pill */}
        <div className="flex items-center gap-2">
          <button
            id="btn_toggle_listener"
            onClick={onToggleConnection}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-all ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
            }`}
            title="Toggle NotificationListenerService state"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{isConnected ? t.accessConnected : t.accessDisconnected}</span>
          </button>
        </div>

        {/* Simulator Ingestion Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] text-zinc-400 hidden sm:inline mr-1">
            {language === 'ar' ? 'اختبار ورود إشعار:' : 'Simulate Incoming:'}
          </span>

          <button
            id="btn_inject_wa"
            onClick={() => handleQuickInject('wa')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600/20 font-medium transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            <span>WhatsApp</span>
          </button>

          <button
            id="btn_inject_otp"
            onClick={() => handleQuickInject('otp')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 font-medium transition-colors"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>OTP (عربي)</span>
          </button>

          <button
            id="btn_inject_jahez"
            onClick={() => handleQuickInject('jahez')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 font-medium transition-colors"
          >
            <Truck className="w-3 h-3" />
            <span>جاهز</span>
          </button>

          <button
            id="btn_inject_custom"
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Custom</span>
          </button>
        </div>

        {/* Android Studio Source Inspector button */}
        <button
          id="btn_open_android_source"
          onClick={onOpenSourceViewer}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs transition-colors flex-shrink-0"
        >
          <Code className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Android Studio Source</span>
        </button>
      </div>

      {/* Custom Notification Modal */}
      {showCustomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowCustomModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <h3 className="text-sm font-bold mb-3">Simulate Custom Android Notification</h3>
            <form onSubmit={handleCustomSubmit} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Package Name</label>
                <input
                  type="text"
                  value={customPkg}
                  onChange={(e) => setCustomPkg(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">App Display Name</label>
                <input
                  type="text"
                  value={customAppName}
                  onChange={(e) => setCustomAppName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Notification Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., Order shipped #9124"
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Notification Text / OTP</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g., Your OTP code is 492019"
                  rows={3}
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-medium"
                >
                  Post to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
