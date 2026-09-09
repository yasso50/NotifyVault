import { CategoryType } from '../types';

/**
 * Local lightweight heuristic classifier for notifications.
 * Runs 100% offline on-device without external AI APIs.
 */
export function classifyNotificationLocally(
  packageName: string,
  title: string,
  text: string,
  subText?: string
): CategoryType {
  const combined = `${packageName} ${title} ${text} ${subText || ''}`.toLowerCase();
  const combinedArabic = `${title} ${text} ${subText || ''}`;

  // Check OTP first
  if (detectOtp(combinedArabic, combined).isOtp) {
    return 'OTP';
  }

  // Messaging heuristics
  if (
    packageName.includes('whatsapp') ||
    packageName.includes('telegram') ||
    packageName.includes('signal') ||
    packageName.includes('messaging') ||
    packageName.includes('viber') ||
    packageName.includes('discord') ||
    packageName.includes('slack') ||
    /message|chat|رسالة|دردشة|واتساب|تيليجرام/i.test(combined)
  ) {
    return 'Messaging';
  }

  // Calls
  if (
    packageName.includes('dialer') ||
    packageName.includes('telecom') ||
    packageName.includes('phone') ||
    /incoming call|missed call|مكالمة فائتة|اتصال/i.test(combined)
  ) {
    return 'Calls';
  }

  // Email
  if (
    packageName.includes('gmail') ||
    packageName.includes('outlook') ||
    packageName.includes('mail') ||
    /subject:|inbox|بريد|إيميل/i.test(combined)
  ) {
    return 'Email';
  }

  // Finance & Banking
  if (
    packageName.includes('bank') ||
    packageName.includes('wallet') ||
    packageName.includes('alrajhi') ||
    packageName.includes('paypal') ||
    packageName.includes('revolut') ||
    packageName.includes('chase') ||
    packageName.includes('pay') ||
    /payment|transfer|transaction|debited|credited|balance|حساب|تحويل|سحب|إيداع|بطاقة/i.test(combined)
  ) {
    return 'Finance';
  }

  // Delivery
  if (
    packageName.includes('hungerstation') ||
    packageName.includes('jahez') ||
    packageName.includes('ubereats') ||
    packageName.includes('talabat') ||
    packageName.includes('doordash') ||
    packageName.includes('deliveroo') ||
    packageName.includes('dhl') ||
    packageName.includes('fedex') ||
    packageName.includes('aramex') ||
    /driver|on the way|delivered|order arriving|طلبك في الطريق|تم التوصيل|مندوب/i.test(combined)
  ) {
    return 'Delivery';
  }

  // Shopping
  if (
    packageName.includes('amazon') ||
    packageName.includes('noon') ||
    packageName.includes('ebay') ||
    packageName.includes('aliexpress') ||
    packageName.includes('shein') ||
    /shipped|order confirmed|cart|discount|شحنة|طلبك تم تأكيده|تخفيض/i.test(combined)
  ) {
    return 'Shopping';
  }

  // Social
  if (
    packageName.includes('instagram') ||
    packageName.includes('twitter') ||
    packageName.includes('tiktok') ||
    packageName.includes('facebook') ||
    packageName.includes('reddit') ||
    packageName.includes('snapchat') ||
    packageName.includes('linkedin') ||
    /liked your photo|commented|followed you|اعجب بمنشورك|تابعك/i.test(combined)
  ) {
    return 'Social';
  }

  // Security
  if (
    packageName.includes('authenticator') ||
    /new login|security alert|password reset|تسجيل دخول جديد|تنبيه أمني/i.test(combined)
  ) {
    return 'Security';
  }

  // System
  if (
    packageName.startsWith('android') ||
    packageName.startsWith('com.android') ||
    packageName.includes('settings') ||
    /system update|storage almost full|battery saver|تحديث النظام/i.test(combined)
  ) {
    return 'System';
  }

  return 'Other';
}

/**
 * Privacy-focused local OTP detection.
 * Identifies verification codes in English and Arabic.
 */
export function detectOtp(
  rawText: string,
  normalizedText: string
): { isOtp: boolean; code?: string; maskedText?: string } {
  // English regex patterns
  const enKeywords = /(?:verification\s*code|one-time\s*password|otp|code\s*is|secret\s*code|auth\s*code|pin\s*is|security\s*code)/i;
  // Arabic regex patterns
  const arKeywords = /(?:رمز\s*التحقق|كود\s*التحقق|رمز\s*التأكيد|كلمة\s*المرور\s*لمرة\s*واحدة|رمز\s*الأمان)/;

  const hasOtpKeyword = enKeywords.test(normalizedText) || arKeywords.test(rawText);

  if (!hasOtpKeyword) {
    return { isOtp: false };
  }

  // Look for 4 to 8 digit numbers
  const numberRegex = /(?:\b|[\s:])([0-9]{4,8})(?:\b|[\s.]|$)/;
  const match = rawText.match(numberRegex);

  if (match && match[1]) {
    const code = match[1];
    const masked = rawText.replace(code, '••••••');
    return {
      isOtp: true,
      code: code,
      maskedText: masked
    };
  }

  return { isOtp: true };
}

/**
 * Generate fingerprint for duplicate detection and merging.
 */
export function generateFingerprint(
  packageName: string,
  notificationKey: string,
  title: string,
  text: string
): string {
  const str = `${packageName}|${notificationKey}|${title.trim()}|${text.trim()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}
