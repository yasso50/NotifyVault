import React from 'react';
import { Lock, Fingerprint, Delete } from 'lucide-react';

interface Props {
  isOpen: boolean;
  correctPin: string;
  onUnlocked: () => void;
  isDark: boolean;
  language: 'en' | 'ar';
}

export const PrivacyLockModal: React.FC<Props> = ({
  isOpen,
  correctPin,
  onUnlocked,
  isDark,
  language,
}) => {
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        if (next === correctPin) {
          onUnlocked();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 800);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleBiometric = () => {
    // Simulated Android BiometricPrompt prompt success
    onUnlocked();
  };

  return (
    <div
      id="privacy_lock_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
    >
      <div
        id="privacy_lock_card"
        className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border text-center transition-all ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold">
          {language === 'ar' ? 'خزنة الإشعارات مقفلة' : 'NotifyVault Locked'}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-6">
          {language === 'ar'
            ? 'أدخل رمز PIN للمتابعة إلى سجل إشعاراتك'
            : 'Enter PIN or use biometrics to access notification history'}
        </p>

        {/* PIN Indicators */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                error
                  ? 'border-rose-500 bg-rose-500 animate-bounce'
                  : pin.length > idx
                  ? 'border-indigo-600 bg-indigo-600'
                  : 'border-zinc-400 dark:border-zinc-600'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-500 font-medium mb-3">Incorrect PIN (default is 1234)</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
            <button
              key={n}
              onClick={() => handleDigit(n)}
              className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-lg font-bold flex items-center justify-center transition-colors active:scale-95"
            >
              {n}
            </button>
          ))}
          <button
            onClick={handleBiometric}
            className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 flex items-center justify-center transition-colors"
            title="Biometrics"
          >
            <Fingerprint className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-lg font-bold flex items-center justify-center transition-colors active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 flex items-center justify-center transition-colors active:scale-95"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
