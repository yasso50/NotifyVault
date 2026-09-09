import React from 'react';
import { NotificationItem } from '../types';
import { translations } from '../utils/i18n';
import {
  X,
  Star,
  Copy,
  Share2,
  ExternalLink,
  Archive,
  Trash2,
  Key,
  ShieldCheck,
  Tag,
  ChevronDown,
  ChevronUp,
  Check,
  Info,
  Clock,
  Radio
} from 'lucide-react';

interface Props {
  item: NotificationItem | null;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  language: 'en' | 'ar';
  onToggleFavorite: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
}

export const NotificationDetailModal: React.FC<Props> = ({
  item,
  isOpen,
  onClose,
  isDark,
  language,
  onToggleFavorite,
  onToggleArchive,
  onDelete,
  onAddTag,
  onRemoveTag,
}) => {
  const [isRevealed, setIsRevealed] = React.useState(false);
  const [showTechDetails, setShowTechDetails] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [tagInput, setTagInput] = React.useState('');
  const [showTagInput, setShowTagInput] = React.useState(false);
  const [simulatedToast, setSimulatedToast] = React.useState<string | null>(null);

  if (!isOpen || !item) return null;

  const t = translations[language];
  const isRtl = language === 'ar';

  const triggerToast = (msg: string) => {
    setSimulatedToast(msg);
    setTimeout(() => setSimulatedToast(null), 2500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(label);
    triggerToast(`${label} copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleShare = () => {
    triggerToast(
      language === 'ar'
        ? 'تم فتح نافذة المشاركة (Android Sharesheet)'
        : 'Opened Android Sharesheet simulation'
    );
  };

  const handleOpenSourceApp = () => {
    triggerToast(
      language === 'ar'
        ? `فتح التطبيق: ${item.appName} (${item.packageName})`
        : `Launching ${item.appName} (${item.packageName})...`
    );
  };

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagInput.trim()) {
      onAddTag(item.id, tagInput.trim());
      setTagInput('');
      setShowTagInput(false);
    }
  };

  const formattedDate = new Date(item.timestamp).toLocaleString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }
  );

  return (
    <div
      id="notification_detail_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="notification_detail_sheet"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl p-6 shadow-2xl border transition-all ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Toast Alert Simulation */}
        {simulatedToast && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-zinc-800 text-zinc-100 text-xs text-center font-medium shadow-lg animate-in fade-in duration-150">
            {simulatedToast}
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              {item.appName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-base leading-snug">{item.appName}</h3>
              <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <Clock className="w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="btn_detail_fav"
              onClick={() => onToggleFavorite(item.id)}
              className={`p-2 rounded-full transition-transform active:scale-95 ${
                item.isFavorite
                  ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title="Favorite"
            >
              <Star className={`w-5 h-5 ${item.isFavorite ? 'fill-amber-500' : ''}`} />
            </button>
            <button
              id="btn_detail_close"
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* OTP Mask Alert */}
        {item.isOtp && (
          <div className="my-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2 font-semibold text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>{language === 'ar' ? 'رمز تحقق حساس' : 'Sensitive OTP Verification'}</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              {t.sensitiveWarning}
            </p>
            {item.otpCode && (
              <div className="mt-3 flex items-center justify-between bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-amber-500/30">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  <span className="font-mono text-sm tracking-widest font-bold text-zinc-900 dark:text-zinc-100">
                    {isRevealed ? item.otpCode : '••••••'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRevealed(!isRevealed)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                  >
                    {isRevealed ? t.hideCode : t.revealCode}
                  </button>
                  {isRevealed && (
                    <button
                      onClick={() => copyToClipboard(item.otpCode!, 'OTP Code')}
                      className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-200 text-xs font-medium"
                      title="Copy OTP"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Title & Body */}
        <div className="my-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
              {item.category}
            </span>
            {item.channelName && (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Channel: {item.channelName}
              </span>
            )}
          </div>
          <h2 className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
            {item.title}
          </h2>
          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            {item.bigText || item.text}
          </div>
        </div>

        {/* Tags Section */}
        <div className="my-4">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>{t.tags}</span>
            </span>
            <button
              onClick={() => setShowTagInput(!showTagInput)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              + {t.addTag}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {item.tags.length === 0 && !showTagInput && (
              <span className="text-xs text-zinc-400 italic">No tags assigned</span>
            )}
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900"
              >
                <span>{tag}</span>
                <button
                  onClick={() => onRemoveTag(item.id, tag)}
                  className="hover:text-rose-500 ml-0.5"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          {showTagInput && (
            <form onSubmit={handleAddTagSubmit} className="mt-2 flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. Bills, Work, Receipts"
                className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100"
                autoFocus
              />
              <button
                type="submit"
                className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-medium"
              >
                Save
              </button>
            </form>
          )}
        </div>

        {/* Quick Action Buttons Strip */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <button
            id="btn_copy_title"
            onClick={() => copyToClipboard(item.title, t.copyTitle)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {copiedKey === t.copyTitle ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{t.copyTitle}</span>
          </button>

          <button
            id="btn_copy_text"
            onClick={() => copyToClipboard(item.bigText || item.text, t.copyText)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {copiedKey === t.copyText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{t.copyText}</span>
          </button>

          <button
            id="btn_share_notif"
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t.share}</span>
          </button>
        </div>

        {/* Launch Source App */}
        <button
          id="btn_open_source_app"
          onClick={handleOpenSourceApp}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mb-4 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-200 dark:border-indigo-900/60"
        >
          <ExternalLink className="w-4 h-4" />
          <span>{t.openApp}</span>
        </button>

        {/* Destructive / Archive Strip */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            id="btn_detail_archive"
            onClick={() => {
              onToggleArchive(item.id);
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium py-1 px-2 rounded-lg"
          >
            <Archive className="w-4 h-4" />
            <span>{item.isArchived ? t.unarchive : t.archive}</span>
          </button>

          <button
            id="btn_detail_delete"
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium py-1 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.delete}</span>
          </button>
        </div>

        {/* Expandable Technical Details Drawer */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setShowTechDetails(!showTechDetails)}
            className="w-full flex items-center justify-between text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Technical & NotificationListener Details</span>
            </span>
            {showTechDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showTechDetails && (
            <div className="mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-[11px] font-mono space-y-1.5 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
              <div><span className="text-zinc-400">Package:</span> {item.packageName}</div>
              <div><span className="text-zinc-400">NotificationKey:</span> {item.notificationKey}</div>
              <div><span className="text-zinc-400">Importance:</span> {item.importance}</div>
              <div><span className="text-zinc-400">Channel ID:</span> {item.channelId || 'null'}</div>
              <div><span className="text-zinc-400">PostTime:</span> {item.postTime}</div>
              <div><span className="text-zinc-400">Fingerprint:</span> {item.fingerprint}</div>
              <div><span className="text-zinc-400">Clearable:</span> {item.isClearable ? 'true' : 'false'}</div>
              <div><span className="text-zinc-400">Actions:</span> {item.actionCount}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
