import React from 'react';
import { translations } from '../utils/i18n';
import { Shield, Bell, Search, Lock, CheckCircle2, ChevronRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onComplete: () => void;
  isDark: boolean;
  language: 'en' | 'ar';
}

export const OnboardingModal: React.FC<Props> = ({
  isOpen,
  onComplete,
  isDark,
  language,
}) => {
  const [step, setStep] = React.useState(0);
  const [permissionRequested, setPermissionRequested] = React.useState(false);

  if (!isOpen) return null;

  const t = translations[language];

  const screens = [
    {
      icon: <Bell className="w-12 h-12 text-indigo-500" />,
      title: t.onboard1Title,
      sub: t.onboard1Sub,
    },
    {
      icon: <Shield className="w-12 h-12 text-emerald-500" />,
      title: t.onboard2Title,
      sub: t.onboard2Sub,
    },
    {
      icon: <Search className="w-12 h-12 text-sky-500" />,
      title: t.onboard3Title,
      sub: t.onboard3Sub,
    },
    {
      icon: <Lock className="w-12 h-12 text-amber-500" />,
      title: t.onboard4Title,
      sub: t.onboard4Sub,
    },
  ];

  const handleNext = () => {
    if (step < screens.length - 1) {
      setStep(step + 1);
    } else {
      setPermissionRequested(true);
    }
  };

  const handleGrantAccess = () => {
    onComplete();
  };

  return (
    <div
      id="onboarding_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="onboarding_dialog"
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border text-center transition-all ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {!permissionRequested ? (
          <div>
            {/* Step Icon */}
            <div className="mx-auto w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 shadow-inner">
              {screens[step].icon}
            </div>

            {/* Title & Description */}
            <h2 className="text-xl font-bold tracking-tight mb-3">
              {screens[step].title}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 px-2">
              {screens[step].sub}
            </p>

            {/* Stepper Dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {screens.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-7 bg-indigo-600'
                      : 'w-2 bg-zinc-300 dark:bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            {/* Next / Get Started button */}
            <button
              id="btn_onboard_next"
              onClick={handleNext}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>{step === screens.length - 1 ? t.getStarted : 'Continue'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Android NotificationListener Permission Dialog Simulation */
          <div className="animate-in fade-in">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold mb-2">
              {language === 'ar' ? 'السماح بالوصول للإشعارات' : 'Allow Notification Access'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
              {language === 'ar'
                ? 'يحتاج NotifyVault إلى إذن قراءة الإشعارات عبر خدمة NotificationListenerService لحفظ الإشعارات محلياً على جهازك وفهرستها. لن يتم نقل أي بيانات خارج جهازك.'
                : 'NotifyVault needs Notification Access via Android\'s NotificationListenerService to intercept and locally index incoming notifications. All data stays strictly offline on this phone.'}
            </p>

            <div className="my-4 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 text-left text-xs space-y-2 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Zero server telemetry or external logging</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>On-device Room database storage only</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Full user control over excluded apps and retention</span>
              </div>
            </div>

            <button
              id="btn_grant_access"
              onClick={handleGrantAccess}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md active:scale-98 transition-all"
            >
              {t.grantAccess}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
