import { NotificationItem, AppEntity, NotificationRule, AppSettings, CategoryType } from '../types';
import { classifyNotificationLocally, detectOtp, generateFingerprint } from './heuristics';

const STORAGE_KEY_NOTIFICATIONS = 'notifyvault_notifications_v1';
const STORAGE_KEY_APPS = 'notifyvault_apps_v1';
const STORAGE_KEY_RULES = 'notifyvault_rules_v1';
const STORAGE_KEY_SETTINGS = 'notifyvault_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  isListenerConnected: true,
  isLoggingPaused: false,
  onboardingCompleted: true,
  privacyLockEnabled: false,
  privacyPin: '1234',
  lockTimeoutMinutes: 1,
  otpMode: 'mask',
  retention: {
    period: '30d',
    maxCount: 10000,
    autoCleanup: true,
    keepFavorites: true,
  },
  theme: 'light',
  language: 'en',
  enableBiometrics: true,
  soundEnabled: true,
};

const INITIAL_APPS: AppEntity[] = [
  {
    packageName: 'com.whatsapp',
    appName: 'WhatsApp',
    iconColor: '#25D366',
    iconBg: '#DCF8C6',
    totalCount: 42,
    unreadCount: 3,
    favoriteCount: 4,
    isBlocked: false,
    isSensitive: false,
    lastActive: Date.now() - 1000 * 60 * 12,
    category: 'Messaging',
    defaultTag: 'Personal',
  },
  {
    packageName: 'com.google.android.gm',
    appName: 'Gmail',
    iconColor: '#EA4335',
    iconBg: '#FCE8E6',
    totalCount: 28,
    unreadCount: 5,
    favoriteCount: 2,
    isBlocked: false,
    isSensitive: false,
    lastActive: Date.now() - 1000 * 60 * 45,
    category: 'Email',
    defaultTag: 'Work',
  },
  {
    packageName: 'com.alrajhicapital.app',
    appName: 'Al Rajhi Bank',
    iconColor: '#002B7F',
    iconBg: '#E6ECF8',
    totalCount: 14,
    unreadCount: 1,
    favoriteCount: 3,
    isBlocked: false,
    isSensitive: true,
    lastActive: Date.now() - 1000 * 60 * 18,
    category: 'Finance',
    defaultTag: 'Bills',
  },
  {
    packageName: 'com.jahez.customer',
    appName: 'Jahez',
    iconColor: '#E21A22',
    iconBg: '#FDE8E9',
    totalCount: 19,
    unreadCount: 0,
    favoriteCount: 1,
    isBlocked: false,
    isSensitive: false,
    lastActive: Date.now() - 1000 * 60 * 95,
    category: 'Delivery',
    defaultTag: 'Orders',
  },
  {
    packageName: 'com.instagram.android',
    appName: 'Instagram',
    iconColor: '#E1306C',
    iconBg: '#FCE8F0',
    totalCount: 35,
    unreadCount: 6,
    favoriteCount: 1,
    isBlocked: false,
    isSensitive: false,
    lastActive: Date.now() - 1000 * 60 * 150,
    category: 'Social',
  },
  {
    packageName: 'com.amazon.mShop.android.shopping',
    appName: 'Amazon Shopping',
    iconColor: '#FF9900',
    iconBg: '#FFF5E5',
    totalCount: 11,
    unreadCount: 0,
    favoriteCount: 2,
    isBlocked: false,
    isSensitive: false,
    lastActive: Date.now() - 1000 * 60 * 60 * 4,
    category: 'Shopping',
    defaultTag: 'Orders',
  },
  {
    packageName: 'org.telegram.messenger',
    appName: 'Telegram',
    iconColor: '#229ED9',
    iconBg: '#E9F5FB',
    totalCount: 52,
    unreadCount: 8,
    favoriteCount: 5,
    isBlocked: false,
    isSensitive: false,
    lastActive: Date.now() - 1000 * 60 * 5,
    category: 'Messaging',
  },
  {
    packageName: 'com.google.android.apps.authenticator2',
    appName: 'Google Authenticator',
    iconColor: '#4285F4',
    iconBg: '#E8F0FE',
    totalCount: 6,
    unreadCount: 0,
    favoriteCount: 0,
    isBlocked: false,
    isSensitive: true,
    lastActive: Date.now() - 1000 * 60 * 60 * 12,
    category: 'Security',
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    notificationKey: 'com.whatsapp|1001|Ahmed_Ali',
    packageName: 'com.whatsapp',
    appName: 'WhatsApp',
    title: 'Ahmed Ali (Dev Team)',
    text: 'Hey! Did you review the PR for the Notification Vault caching layer?',
    bigText: 'Hey! Did you review the PR for the Notification Vault caching layer? We want to merge before deployment.',
    subText: '3 new messages',
    category: 'Messaging',
    channelId: 'chat_messages',
    channelName: 'Messages',
    timestamp: Date.now() - 1000 * 60 * 8,
    postTime: Date.now() - 1000 * 60 * 8,
    isRead: false,
    isFavorite: true,
    isArchived: false,
    isSensitive: false,
    isOngoing: false,
    isClearable: true,
    hasActions: true,
    actionCount: 2,
    importance: 'HIGH',
    conversationInfo: {
      senderName: 'Ahmed Ali',
      isGroupChat: true,
      threadId: 'group_dev_team'
    },
    fingerprint: 'fp_wa_1001',
    createdAt: Date.now() - 1000 * 60 * 8,
    updatedAt: Date.now() - 1000 * 60 * 8,
    tags: ['Work', 'Important']
  },
  {
    id: 'notif_2',
    notificationKey: 'com.alrajhicapital.app|9021|OTP',
    packageName: 'com.alrajhicapital.app',
    appName: 'Al Rajhi Bank',
    title: 'تنبيه أمني - مصرف الراجحي',
    text: 'رمز التحقق لبطاقتك هو 847291. صالح لمدة 5 دقائق. لا تشارك هذا الرمز مطلقاً.',
    bigText: 'رمز التحقق لبطاقتك هو 847291. صالح لمدة 5 دقائق. لا تشارك هذا الرمز مع أي شخص حتى موظف البنك.',
    subText: 'رمز التحقق',
    category: 'OTP',
    channelId: 'finance_alerts',
    channelName: 'Security Alerts',
    timestamp: Date.now() - 1000 * 60 * 18,
    postTime: Date.now() - 1000 * 60 * 18,
    isRead: false,
    isFavorite: false,
    isArchived: false,
    isSensitive: true,
    isOngoing: false,
    isClearable: true,
    hasActions: false,
    actionCount: 0,
    importance: 'HIGH',
    isOtp: true,
    otpCode: '847291',
    isOtpMasked: true,
    fingerprint: 'fp_rajhi_9021',
    createdAt: Date.now() - 1000 * 60 * 18,
    updatedAt: Date.now() - 1000 * 60 * 18,
    tags: ['Bills']
  },
  {
    id: 'notif_3',
    notificationKey: 'com.jahez.customer|4412|Order',
    packageName: 'com.jahez.customer',
    appName: 'Jahez',
    title: 'جاهز - تحديث الطلب #82910',
    text: 'مندوب التوصيل خالد في الطريق إليك ومعه طلبك الساخن! وقت الوصول المتوقع 10 دقائق.',
    category: 'Delivery',
    channelId: 'order_status',
    channelName: 'Live Orders',
    timestamp: Date.now() - 1000 * 60 * 42,
    postTime: Date.now() - 1000 * 60 * 42,
    isRead: true,
    isFavorite: false,
    isArchived: false,
    isSensitive: false,
    isOngoing: true,
    isClearable: true,
    hasActions: true,
    actionCount: 1,
    importance: 'HIGH',
    fingerprint: 'fp_jahez_4412',
    createdAt: Date.now() - 1000 * 60 * 42,
    updatedAt: Date.now() - 1000 * 60 * 42,
    tags: ['Orders']
  },
  {
    id: 'notif_4',
    notificationKey: 'com.google.android.gm|7719|GoogleCloud',
    packageName: 'com.google.android.gm',
    appName: 'Gmail',
    title: 'Google Cloud Platform Alert',
    text: 'Your Cloud Run monthly invoice is ready: $14.20. Autopay scheduled for Sept 15.',
    bigText: 'Invoice summary for project notifyvault-prod: $14.20. View billing breakdown and PDF receipt.',
    category: 'Email',
    channelId: 'billing_notifications',
    channelName: 'Billing',
    timestamp: Date.now() - 1000 * 60 * 120,
    postTime: Date.now() - 1000 * 60 * 120,
    isRead: true,
    isFavorite: true,
    isArchived: false,
    isSensitive: false,
    isOngoing: false,
    isClearable: true,
    hasActions: true,
    actionCount: 2,
    importance: 'MEDIUM',
    fingerprint: 'fp_gm_7719',
    createdAt: Date.now() - 1000 * 60 * 120,
    updatedAt: Date.now() - 1000 * 60 * 120,
    tags: ['Bills', 'Work']
  },
  {
    id: 'notif_5',
    notificationKey: 'com.amazon.mShop.android.shopping|8810|Delivery',
    packageName: 'com.amazon.mShop.android.shopping',
    appName: 'Amazon Shopping',
    title: 'Package Delivered!',
    text: 'Your order with Anker USB-C Fast Charger was handed to resident.',
    bigText: 'Your order #112-9849201-12 was delivered. Enjoy your purchase and let us know your feedback.',
    category: 'Shopping',
    channelId: 'shipment_updates',
    channelName: 'Shipping Updates',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    postTime: Date.now() - 1000 * 60 * 60 * 5,
    isRead: true,
    isFavorite: true,
    isArchived: false,
    isSensitive: false,
    isOngoing: false,
    isClearable: true,
    hasActions: false,
    actionCount: 0,
    importance: 'LOW',
    fingerprint: 'fp_amz_8810',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    updatedAt: Date.now() - 1000 * 60 * 60 * 5,
    tags: ['Orders']
  },
  {
    id: 'notif_6',
    notificationKey: 'org.telegram.messenger|5511|Sarah',
    packageName: 'org.telegram.messenger',
    appName: 'Telegram',
    title: 'Sarah Jenkins',
    text: 'Sent you 4 photos from the conference keynote.',
    category: 'Messaging',
    channelId: 'direct_chats',
    channelName: 'Chats',
    timestamp: Date.now() - 1000 * 60 * 60 * 14,
    postTime: Date.now() - 1000 * 60 * 60 * 14,
    isRead: false,
    isFavorite: false,
    isArchived: false,
    isSensitive: false,
    isOngoing: false,
    isClearable: true,
    hasActions: true,
    actionCount: 1,
    importance: 'HIGH',
    fingerprint: 'fp_tg_5511',
    createdAt: Date.now() - 1000 * 60 * 60 * 14,
    updatedAt: Date.now() - 1000 * 60 * 60 * 14,
    tags: ['Personal']
  },
  {
    id: 'notif_7',
    notificationKey: 'com.instagram.android|3321|Dm',
    packageName: 'com.instagram.android',
    appName: 'Instagram',
    title: 'design_daily liked your reel',
    text: '"Android Material 3 dynamic color scheme architecture in Compose"',
    category: 'Social',
    channelId: 'activity',
    channelName: 'Activity',
    timestamp: Date.now() - 1000 * 60 * 60 * 22,
    postTime: Date.now() - 1000 * 60 * 60 * 22,
    isRead: true,
    isFavorite: false,
    isArchived: true,
    isSensitive: false,
    isOngoing: false,
    isClearable: true,
    hasActions: false,
    actionCount: 0,
    importance: 'LOW',
    fingerprint: 'fp_ig_3321',
    createdAt: Date.now() - 1000 * 60 * 60 * 22,
    updatedAt: Date.now() - 1000 * 60 * 60 * 22,
    tags: []
  },
  {
    id: 'notif_8',
    notificationKey: 'com.whatsapp|1002|Mom',
    packageName: 'com.whatsapp',
    appName: 'WhatsApp',
    title: 'أمي (Family)',
    text: 'لا تنس أن تتصل بخالك اليوم لتهنئته بالترقية الجديدة يا بني ❤️',
    category: 'Messaging',
    channelId: 'chat_messages',
    channelName: 'Messages',
    timestamp: Date.now() - 1000 * 60 * 60 * 26, // Yesterday
    postTime: Date.now() - 1000 * 60 * 60 * 26,
    isRead: true,
    isFavorite: true,
    isArchived: false,
    isSensitive: false,
    isOngoing: false,
    isClearable: true,
    hasActions: true,
    actionCount: 1,
    importance: 'HIGH',
    fingerprint: 'fp_wa_1002',
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
    updatedAt: Date.now() - 1000 * 60 * 60 * 26,
    tags: ['Personal', 'Important']
  },
  {
    id: 'notif_9',
    notificationKey: 'com.google.android.apps.authenticator2|1901|Code',
    packageName: 'com.google.android.apps.authenticator2',
    appName: 'Google Authenticator',
    title: 'GitHub Security',
    text: 'Your single-use sign-in verification code is 391048. Do not share.',
    category: 'OTP',
    channelId: 'security',
    channelName: '2FA Alerts',
    timestamp: Date.now() - 1000 * 60 * 60 * 30,
    postTime: Date.now() - 1000 * 60 * 60 * 30,
    isRead: true,
    isFavorite: false,
    isArchived: false,
    isSensitive: true,
    isOngoing: false,
    isClearable: true,
    hasActions: false,
    actionCount: 0,
    importance: 'HIGH',
    isOtp: true,
    otpCode: '391048',
    isOtpMasked: true,
    fingerprint: 'fp_auth_1901',
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 30,
    tags: []
  },
  {
    id: 'notif_10',
    notificationKey: 'com.uber.customer|2019|Ride',
    packageName: 'com.uber.customer',
    appName: 'Uber',
    title: 'Your Uber receipt',
    text: '$22.50 was charged to your Apple Pay for your trip to Airport Terminal 2.',
    category: 'Finance',
    channelId: 'receipts',
    channelName: 'Receipts',
    timestamp: Date.now() - 1000 * 60 * 60 * 72, // Earlier this week
    postTime: Date.now() - 1000 * 60 * 60 * 72,
    isRead: true,
    isFavorite: false,
    isArchived: false,
    isSensitive: false,
    isOngoing: false,
    isClearable: true,
    hasActions: false,
    actionCount: 0,
    importance: 'MEDIUM',
    fingerprint: 'fp_uber_2019',
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    updatedAt: Date.now() - 1000 * 60 * 60 * 72,
    tags: ['Travel', 'Bills']
  }
];

const INITIAL_RULES: NotificationRule[] = [
  {
    id: 'rule_1',
    name: 'Auto-tag Work Invoices',
    isEnabled: true,
    conditionApp: 'com.google.android.gm',
    conditionTitleContains: 'Invoice',
    actionSave: true,
    actionTag: 'Bills',
    actionFavorite: false,
  },
  {
    id: 'rule_2',
    name: 'Auto-Favorite Mom & VIP Contacts',
    isEnabled: true,
    conditionApp: 'com.whatsapp',
    conditionTitleContains: 'أمي',
    actionSave: true,
    actionFavorite: true,
    actionTag: 'Important',
  },
  {
    id: 'rule_3',
    name: 'Mask Bank OTP Codes',
    isEnabled: true,
    conditionCategory: 'OTP',
    actionSave: true,
    actionMask: true,
  }
];

export class NotifyVaultDB {
  private static getStored<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private static setStored<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage quota or storage access error', e);
    }
  }

  static getNotifications(): NotificationItem[] {
    const list = this.getStored<NotificationItem[]>(STORAGE_KEY_NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    // Sort descending by timestamp
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }

  static getApps(): AppEntity[] {
    return this.getStored<AppEntity[]>(STORAGE_KEY_APPS, INITIAL_APPS);
  }

  static getRules(): NotificationRule[] {
    return this.getStored<NotificationRule[]>(STORAGE_KEY_RULES, INITIAL_RULES);
  }

  static getSettings(): AppSettings {
    return this.getStored<AppSettings>(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS);
  }

  static saveSettings(settings: AppSettings): void {
    this.setStored(STORAGE_KEY_SETTINGS, settings);
  }

  /**
   * Core notification ingestion replicating NotificationListenerService + Room.
   */
  static processIncomingNotification(raw: {
    packageName: string;
    appName: string;
    title: string;
    text: string;
    bigText?: string;
    subText?: string;
    channelId?: string;
    channelName?: string;
    importance?: 'HIGH' | 'MEDIUM' | 'LOW';
  }): { item: NotificationItem | null; reason?: string } {
    const settings = this.getSettings();

    // 1. Check if logging is paused or listener disconnected
    if (!settings.isListenerConnected) {
      return { item: null, reason: 'Listener disconnected' };
    }
    if (settings.isLoggingPaused) {
      return { item: null, reason: 'Notification logging paused' };
    }

    // 2. Check if app is blocked or sensitive
    const apps = this.getApps();
    const appEntry = apps.find((a) => a.packageName === raw.packageName);
    if (appEntry?.isBlocked) {
      return { item: null, reason: 'App blocked by privacy rules' };
    }

    // 3. Local categorization & OTP detection
    const category = classifyNotificationLocally(raw.packageName, raw.title, raw.text, raw.subText);
    const otpResult = detectOtp(raw.text, `${raw.title} ${raw.text}`.toLowerCase());

    // 4. Handle OTP preferences
    if (otpResult.isOtp && settings.otpMode === 'never') {
      return { item: null, reason: 'OTP dropped per user policy' };
    }

    // 5. Generate fingerprint for duplicate detection
    const fingerprint = generateFingerprint(raw.packageName, `${raw.packageName}|${Date.now()}`, raw.title, raw.text);
    const existingList = this.getNotifications();

    // Check duplicate within 3 minutes
    const duplicate = existingList.find(
      (n) => n.packageName === raw.packageName &&
             n.title === raw.title &&
             n.text === raw.text &&
             Math.abs(n.timestamp - Date.now()) < 1000 * 60 * 3
    );

    if (duplicate) {
      // Update existing item timestamp rather than creating duplicate
      duplicate.timestamp = Date.now();
      duplicate.updatedAt = Date.now();
      this.setStored(STORAGE_KEY_NOTIFICATIONS, existingList);
      return { item: duplicate, reason: 'Updated duplicate notification' };
    }

    // 6. Evaluate Rule Engine
    const rules = this.getRules();
    let isFavorite = false;
    let isArchived = false;
    let shouldMask = settings.otpMode === 'mask' && otpResult.isOtp;
    const tags: string[] = [];

    if (appEntry?.defaultTag) {
      tags.push(appEntry.defaultTag);
    }

    for (const rule of rules) {
      if (!rule.isEnabled) continue;

      let matched = true;
      if (rule.conditionApp && rule.conditionApp !== raw.packageName) matched = false;
      if (rule.conditionCategory && rule.conditionCategory !== category) matched = false;
      if (rule.conditionTitleContains && !raw.title.toLowerCase().includes(rule.conditionTitleContains.toLowerCase())) matched = false;
      if (rule.conditionTextContains && !raw.text.toLowerCase().includes(rule.conditionTextContains.toLowerCase())) matched = false;

      if (matched) {
        if (!rule.actionSave) {
          return { item: null, reason: 'Blocked by custom rule: ' + rule.name };
        }
        if (rule.actionFavorite) isFavorite = true;
        if (rule.actionArchive) isArchived = true;
        if (rule.actionMask) shouldMask = true;
        if (rule.actionTag && !tags.includes(rule.actionTag)) {
          tags.push(rule.actionTag);
        }
      }
    }

    const newItem: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notificationKey: `${raw.packageName}|${Date.now()}`,
      packageName: raw.packageName,
      appName: raw.appName,
      title: raw.title,
      text: raw.text,
      bigText: raw.bigText,
      subText: raw.subText,
      category,
      channelId: raw.channelId || 'default',
      channelName: raw.channelName || 'Notifications',
      timestamp: Date.now(),
      postTime: Date.now(),
      isRead: false,
      isFavorite,
      isArchived,
      isSensitive: appEntry?.isSensitive || (otpResult.isOtp ?? false),
      isOngoing: false,
      isClearable: true,
      hasActions: true,
      actionCount: 1,
      importance: raw.importance || 'HIGH',
      fingerprint,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags,
      isOtp: otpResult.isOtp,
      otpCode: otpResult.code,
      isOtpMasked: shouldMask,
    };

    // Prepend to list
    existingList.unshift(newItem);
    this.setStored(STORAGE_KEY_NOTIFICATIONS, existingList);

    // Update app tracking entity
    this.updateAppStats(raw.packageName, raw.appName, category);

    return { item: newItem };
  }

  private static updateAppStats(packageName: string, appName: string, category: CategoryType): void {
    const apps = this.getApps();
    let app = apps.find((a) => a.packageName === packageName);
    if (!app) {
      app = {
        packageName,
        appName,
        iconColor: '#3B82F6',
        iconBg: '#EFF6FF',
        totalCount: 1,
        unreadCount: 1,
        favoriteCount: 0,
        isBlocked: false,
        isSensitive: false,
        lastActive: Date.now(),
        category,
      };
      apps.push(app);
    } else {
      app.totalCount += 1;
      app.unreadCount += 1;
      app.lastActive = Date.now();
    }
    this.setStored(STORAGE_KEY_APPS, apps);
  }

  static toggleFavorite(id: string): boolean {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.isFavorite = !item.isFavorite;
      this.setStored(STORAGE_KEY_NOTIFICATIONS, list);
      return item.isFavorite;
    }
    return false;
  }

  static toggleArchive(id: string): boolean {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.isArchived = !item.isArchived;
      this.setStored(STORAGE_KEY_NOTIFICATIONS, list);
      return item.isArchived;
    }
    return false;
  }

  static markAsRead(id: string): void {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item && !item.isRead) {
      item.isRead = true;
      this.setStored(STORAGE_KEY_NOTIFICATIONS, list);
      // Decrement unread on app
      const apps = this.getApps();
      const app = apps.find((a) => a.packageName === item.packageName);
      if (app && app.unreadCount > 0) {
        app.unreadCount -= 1;
        this.setStored(STORAGE_KEY_APPS, apps);
      }
    }
  }

  static deleteNotification(id: string): NotificationItem | null {
    const list = this.getNotifications();
    const index = list.findIndex((n) => n.id === id);
    if (index !== -1) {
      const removed = list.splice(index, 1)[0];
      this.setStored(STORAGE_KEY_NOTIFICATIONS, list);
      return removed;
    }
    return null;
  }

  static bulkDelete(ids: string[]): NotificationItem[] {
    const list = this.getNotifications();
    const removed: NotificationItem[] = [];
    const remaining = list.filter((n) => {
      if (ids.includes(n.id)) {
        removed.push(n);
        return false;
      }
      return true;
    });
    this.setStored(STORAGE_KEY_NOTIFICATIONS, remaining);
    return removed;
  }

  static restoreNotifications(items: NotificationItem[]): void {
    const list = this.getNotifications();
    list.unshift(...items);
    this.setStored(STORAGE_KEY_NOTIFICATIONS, list);
  }

  static addTagToNotification(id: string, tag: string): void {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item && !item.tags.includes(tag)) {
      item.tags.push(tag);
      this.setStored(STORAGE_KEY_NOTIFICATIONS, list);
    }
  }

  static removeTagFromNotification(id: string, tag: string): void {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.tags = item.tags.filter((t) => t !== tag);
      this.setStored(STORAGE_KEY_NOTIFICATIONS, list);
    }
  }

  static updateAppBlock(packageName: string, isBlocked: boolean): void {
    const apps = this.getApps();
    const app = apps.find((a) => a.packageName === packageName);
    if (app) {
      app.isBlocked = isBlocked;
      this.setStored(STORAGE_KEY_APPS, apps);
    }
  }

  static updateAppSensitive(packageName: string, isSensitive: boolean): void {
    const apps = this.getApps();
    const app = apps.find((a) => a.packageName === packageName);
    if (app) {
      app.isSensitive = isSensitive;
      this.setStored(STORAGE_KEY_APPS, apps);
    }
  }

  static saveRule(rule: NotificationRule): void {
    const rules = this.getRules();
    const idx = rules.findIndex((r) => r.id === rule.id);
    if (idx >= 0) {
      rules[idx] = rule;
    } else {
      rules.push(rule);
    }
    this.setStored(STORAGE_KEY_RULES, rules);
  }

  static deleteRule(id: string): void {
    const rules = this.getRules().filter((r) => r.id !== id);
    this.setStored(STORAGE_KEY_RULES, rules);
  }

  /**
   * Smart cleanup simulation.
   * Finds older non-favorite notifications, duplicates, or system items.
   */
  static getCleanupCandidateCount(): number {
    const list = this.getNotifications();
    const oneWeekAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;
    return list.filter((n) => !n.isFavorite && n.timestamp < oneWeekAgo).length;
  }

  static executeSmartCleanup(): number {
    const list = this.getNotifications();
    const oneWeekAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const kept = list.filter((n) => n.isFavorite || n.timestamp >= oneWeekAgo);
    const removedCount = list.length - kept.length;
    this.setStored(STORAGE_KEY_NOTIFICATIONS, kept);
    return removedCount;
  }

  /**
   * Test Data Generator for benchmarking and performance testing.
   * Generates up to 10,000 realistic synthetic items.
   */
  static generateTestData(count: number): number {
    const list = this.getNotifications();
    const apps = this.getApps();
    const sampleTemplates = [
      { title: 'New message from Alex', text: 'Are we still meeting at 4 PM for sync?', cat: 'Messaging' as CategoryType },
      { title: 'Security Alert', text: 'New login from Chrome on Linux (192.168.1.1)', cat: 'Security' as CategoryType },
      { title: 'Amazon Package Update', text: 'Your order was out for delivery with driver', cat: 'Shopping' as CategoryType },
      { title: 'رمز التحقق للدخول', text: 'رمز التحقق المؤقت لحسابك هو 591024', cat: 'OTP' as CategoryType },
      { title: 'تنبيه مصرفي', text: 'تم خصم مبلغ 45.00 ريال لدى متجر محلي', cat: 'Finance' as CategoryType },
      { title: 'GitHub notification', text: 'Mentioned in PR #412: refactor notification worker', cat: 'Email' as CategoryType },
      { title: 'جاهز - تحديث الطلب', text: 'المطعم بدأ في تحضير وجبتك المفضلة', cat: 'Delivery' as CategoryType },
    ];

    const generated: NotificationItem[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const template = sampleTemplates[i % sampleTemplates.length];
      const app = apps[i % apps.length];
      const timeOffset = Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30); // within 30 days
      const isOtp = template.cat === 'OTP';

      generated.push({
        id: `bench_${now}_${i}`,
        notificationKey: `${app.packageName}|bench_${i}`,
        packageName: app.packageName,
        appName: app.appName,
        title: `${template.title} #${i + 1}`,
        text: template.text,
        category: template.cat,
        channelId: 'bench_channel',
        channelName: 'General',
        timestamp: now - timeOffset,
        postTime: now - timeOffset,
        isRead: i % 3 === 0,
        isFavorite: i % 15 === 0,
        isArchived: false,
        isSensitive: isOtp,
        isOngoing: false,
        isClearable: true,
        hasActions: false,
        actionCount: 0,
        importance: i % 2 === 0 ? 'HIGH' : 'MEDIUM',
        fingerprint: `fp_bench_${i}`,
        createdAt: now - timeOffset,
        updatedAt: now - timeOffset,
        tags: i % 5 === 0 ? ['Benchmark'] : [],
        isOtp,
        otpCode: isOtp ? '591024' : undefined,
        isOtpMasked: isOtp,
      });
    }

    const combined = [...generated, ...list].slice(0, 15000);
    this.setStored(STORAGE_KEY_NOTIFICATIONS, combined);
    return generated.length;
  }

  static clearAllData(): void {
    this.setStored(STORAGE_KEY_NOTIFICATIONS, []);
  }

  static resetToDefault(): void {
    this.setStored(STORAGE_KEY_NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.setStored(STORAGE_KEY_APPS, INITIAL_APPS);
    this.setStored(STORAGE_KEY_RULES, INITIAL_RULES);
    this.setStored(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS);
  }

  static exportData(format: 'json' | 'csv'): string {
    const notifications = this.getNotifications();
    if (format === 'json') {
      const exportObject = {
        app: 'NotifyVault',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        count: notifications.length,
        items: notifications,
      };
      return JSON.stringify(exportObject, null, 2);
    } else {
      // CSV
      const headers = ['id', 'packageName', 'appName', 'timestamp', 'date', 'title', 'text', 'category', 'isFavorite', 'isRead'];
      const rows = notifications.map((n) => [
        `"${n.id}"`,
        `"${n.packageName}"`,
        `"${n.appName.replace(/"/g, '""')}"`,
        n.timestamp,
        `"${new Date(n.timestamp).toISOString()}"`,
        `"${n.title.replace(/"/g, '""')}"`,
        `"${n.text.replace(/"/g, '""')}"`,
        `"${n.category}"`,
        n.isFavorite,
        n.isRead
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }
  }

  static importData(jsonContent: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonContent);
      const items: NotificationItem[] = Array.isArray(parsed) ? parsed : (parsed.items || []);
      if (!Array.isArray(items)) {
        return { success: false, count: 0, error: 'Invalid backup structure: items array not found' };
      }
      const existing = this.getNotifications();
      const existingIds = new Set(existing.map((n) => n.id));
      let added = 0;
      for (const item of items) {
        if (item.id && item.title && !existingIds.has(item.id)) {
          existing.push(item);
          existingIds.add(item.id);
          added++;
        }
      }
      this.setStored(STORAGE_KEY_NOTIFICATIONS, existing);
      return { success: true, count: added };
    } catch (e: any) {
      return { success: false, count: 0, error: e.message || 'Malformed JSON backup' };
    }
  }
}
