import React from 'react';
import { NotificationItem } from '../types';
import { Star, ShieldAlert, Key, Tag, Archive, Trash2, CheckCircle2, MessageSquare, Mail, Phone, ShoppingBag, Truck, DollarSign, Bell } from 'lucide-react';

interface Props {
  item: NotificationItem;
  isDark: boolean;
  isSelectMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onClick: (item: NotificationItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onArchive: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  language: 'en' | 'ar';
}

export const NotificationCard: React.FC<Props> = ({
  item,
  isDark,
  isSelectMode,
  isSelected,
  onSelect,
  onClick,
  onToggleFavorite,
  onArchive,
  onDelete,
  language,
}) => {
  const isRtl = language === 'ar';

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (isRtl) {
      if (mins < 1) return 'الآن';
      if (mins < 60) return `منذ ${mins} د`;
      if (hours < 24) return `منذ ${hours} س`;
      return `منذ ${days} ي`;
    } else {
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Messaging': return <MessageSquare className="w-3 h-3" />;
      case 'Email': return <Mail className="w-3 h-3" />;
      case 'Calls': return <Phone className="w-3 h-3" />;
      case 'Finance': return <DollarSign className="w-3 h-3" />;
      case 'Shopping': return <ShoppingBag className="w-3 h-3" />;
      case 'Delivery': return <Truck className="w-3 h-3" />;
      case 'OTP': return <Key className="w-3 h-3 text-amber-500" />;
      default: return <Bell className="w-3 h-3" />;
    }
  };

  // Get initial or accent color based on package name
  const getAppInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const getAppColor = (pkg: string) => {
    if (pkg.includes('whatsapp')) return 'bg-emerald-600 text-white';
    if (pkg.includes('telegram')) return 'bg-sky-500 text-white';
    if (pkg.includes('gmail')) return 'bg-rose-500 text-white';
    if (pkg.includes('bank') || pkg.includes('alrajhi')) return 'bg-blue-700 text-white';
    if (pkg.includes('jahez') || pkg.includes('hunger')) return 'bg-red-600 text-white';
    if (pkg.includes('amazon')) return 'bg-amber-600 text-white';
    if (pkg.includes('instagram')) return 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white';
    return 'bg-indigo-600 text-white';
  };

  return (
    <div
      id={`notif_card_${item.id}`}
      onClick={() => {
        if (isSelectMode) {
          onSelect(item.id);
        } else {
          onClick(item);
        }
      }}
      className={`group relative w-full p-4 rounded-2xl transition-all cursor-pointer border ${
        isSelected
          ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/30'
          : isDark
          ? item.isRead
            ? 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 text-zinc-200'
            : 'bg-zinc-900 hover:bg-zinc-850 border-indigo-900/50 text-white shadow-sm'
          : item.isRead
          ? 'bg-white hover:bg-zinc-50 border-zinc-200/80 text-zinc-900'
          : 'bg-white hover:bg-blue-50/30 border-blue-200 text-zinc-950 shadow-sm'
      }`}
    >
      {/* Unread indicator dot */}
      {!item.isRead && (
        <span
          className={`absolute top-4 ${isRtl ? 'left-3' : 'right-3'} w-2 h-2 rounded-full bg-indigo-500 shadow-sm`}
        />
      )}

      <div className="flex items-start gap-3">
        {/* Selection Checkbox (if in select mode) */}
        {isSelectMode ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item.id);
            }}
            className="pt-1"
          >
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-zinc-400 dark:border-zinc-600'
              }`}
            >
              {isSelected && <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>
        ) : (
          /* App Icon Badge */
          <div className="relative flex-shrink-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs ${getAppColor(
                item.packageName
              )}`}
            >
              {getAppInitials(item.appName)}
            </div>
            {item.isOtp && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                <Key className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                {item.appName}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                {getCategoryIcon(item.category)}
                <span>{item.category}</span>
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex-shrink-0 font-medium">
              {formatRelativeTime(item.timestamp)}
            </span>
          </div>

          {/* Title */}
          <h4 className="mt-1 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
            {item.title}
          </h4>

          {/* Body Text */}
          <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {item.isOtp && item.isOtpMasked && item.otpCode
              ? item.text.replace(item.otpCode, '••••••')
              : item.text}
          </p>

          {/* Badges / Tags & Action strip */}
          <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.isOtp && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                  <ShieldAlert className="w-2.5 h-2.5" />
                  <span>OTP</span>
                </span>
              )}
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5 opacity-60" />
                  <span>{t}</span>
                </span>
              ))}
              {item.isArchived && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  Archived
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
              <button
                id={`btn_fav_${item.id}`}
                onClick={(e) => onToggleFavorite(item.id, e)}
                className={`p-1.5 rounded-full transition-transform active:scale-90 ${
                  item.isFavorite
                    ? 'text-amber-500 fill-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                title={item.isFavorite ? 'Unfavorite' : 'Favorite'}
              >
                <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-500' : ''}`} />
              </button>

              <button
                id={`btn_archive_${item.id}`}
                onClick={(e) => onArchive(item.id, e)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Archive"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>

              <button
                id={`btn_del_${item.id}`}
                onClick={(e) => onDelete(item.id, e)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
