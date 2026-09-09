export type CategoryType = 
  | 'Messaging'
  | 'Calls'
  | 'Email'
  | 'Finance'
  | 'Shopping'
  | 'Delivery'
  | 'Social'
  | 'Entertainment'
  | 'System'
  | 'Security'
  | 'OTP'
  | 'Other';

export interface NotificationItem {
  id: string;
  notificationKey: string;
  packageName: string;
  appName: string;
  appVersion?: string;
  title: string;
  text: string;
  bigText?: string;
  subText?: string;
  summaryText?: string;
  category: CategoryType;
  channelId?: string;
  channelName?: string;
  groupKey?: string;
  isGroupSummary?: boolean;
  timestamp: number;
  postTime: number;
  removedTime?: number;
  removalReason?: string;
  isRead: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isSensitive: boolean;
  isOngoing: boolean;
  isClearable: boolean;
  hasActions: boolean;
  actionCount: number;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  notificationFlags?: number;
  smallIcon?: string;
  conversationInfo?: {
    senderName?: string;
    isGroupChat?: boolean;
    threadId?: string;
  };
  fingerprint: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  isOtp?: boolean;
  otpCode?: string;
  isOtpMasked?: boolean;
}

export interface AppEntity {
  packageName: string;
  appName: string;
  iconColor: string;
  iconBg: string;
  totalCount: number;
  unreadCount: number;
  favoriteCount: number;
  isBlocked: boolean;
  isSensitive: boolean;
  lastActive: number;
  category: CategoryType;
  defaultTag?: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  isEnabled: boolean;
  conditionApp?: string;
  conditionTitleContains?: string;
  conditionTextContains?: string;
  conditionCategory?: CategoryType;
  actionSave: boolean;
  actionFavorite?: boolean;
  actionTag?: string;
  actionArchive?: boolean;
  actionMask?: boolean;
}

export interface RetentionPolicy {
  period: '1d' | '3d' | '7d' | '30d' | '90d' | '1y' | 'forever';
  maxCount: number;
  autoCleanup: boolean;
  keepFavorites: boolean;
}

export interface AppSettings {
  isListenerConnected: boolean;
  isLoggingPaused: boolean;
  onboardingCompleted: boolean;
  privacyLockEnabled: boolean;
  privacyPin: string;
  lockTimeoutMinutes: number;
  otpMode: 'never' | 'mask' | 'normal';
  retention: RetentionPolicy;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ar';
  enableBiometrics: boolean;
  soundEnabled: boolean;
}

export interface TagEntity {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface FilterOptions {
  searchQuery: string;
  selectedApps: string[];
  dateRange: 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'custom';
  customDate?: string; // YYYY-MM-DD
  customHour?: number; // 0-23
  customTimeFrom?: string; // HH:mm
  customTimeTo?: string; // HH:mm
  status: 'all' | 'read' | 'unread' | 'favorite' | 'archived';
  category: string;
  importance: 'all' | 'HIGH' | 'MEDIUM' | 'LOW';
  tag?: string;
}
