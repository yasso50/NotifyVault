import React from 'react';
import { X, Copy, Check, Download, Folder, FileCode, Layers, ShieldCheck, Database, Radio } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const AndroidSourceViewerModal: React.FC<Props> = ({ isOpen, onClose, isDark }) => {
  const [selectedFile, setSelectedFile] = React.useState<string>('NotificationListenerService.kt');
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const files: Record<string, { category: string; icon: any; content: string }> = {
    'NotificationListenerService.kt': {
      category: 'service',
      icon: Radio,
      content: `package com.notifyvault.service

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.content.Intent
import android.os.IBinder
import androidx.annotation.WorkerThread
import com.notifyvault.domain.usecase.CaptureNotificationUseCase
import com.notifyvault.core.util.FingerprintGenerator
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Production-ready Android NotificationListenerService for NotifyVault.
 *
 * Implements strict lifecycle handling, service reconnect recovery,
 * deduplication fingerprinting, and asynchronous local persistence.
 * Zero telemetry, 100% on-device.
 */
@AndroidEntryPoint
class NotifyVaultNotificationListenerService : NotificationListenerService() {

    @Inject
    lateinit var captureNotificationUseCase: CaptureNotificationUseCase

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    override fun onListenerConnected() {
        super.onListenerConnected()
        // Synchronize currently active notifications on connection without creating duplicates
        serviceScope.launch {
            try {
                val activeNotifications = activeNotifications ?: return@launch
                for (sbn in activeNotifications) {
                    processStatusBarNotification(sbn, isInitialSync = true)
                }
            } catch (e: SecurityException) {
                // Defensively handle security exception if permission is revoked in background
            }
        }
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        // Android system killed or restarted the listener service
        requestRebind()
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        sbn?.let { statusBarNotification ->
            serviceScope.launch {
                processStatusBarNotification(statusBarNotification, isInitialSync = false)
            }
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?, rankingMap: RankingMap?, reason: Int) {
        super.onNotificationRemoved(sbn, rankingMap, reason)
        // Record dismissal timestamp and removal reason locally if appropriate
    }

    @WorkerThread
    private suspend fun processStatusBarNotification(sbn: StatusBarNotification, isInitialSync: Boolean) {
        val notification = sbn.notification ?: return
        val extras = notification.extras ?: return

        // Defensive parsing against malformed notifications or null char sequences
        val title = extras.getCharSequence(android.app.Notification.EXTRA_TITLE)?.toString() ?: ""
        val text = extras.getCharSequence(android.app.Notification.EXTRA_TEXT)?.toString() ?: ""
        val bigText = extras.getCharSequence(android.app.Notification.EXTRA_BIG_TEXT)?.toString()
        val subText = extras.getCharSequence(android.app.Notification.EXTRA_SUB_TEXT)?.toString()

        // Skip completely empty system notification stubs
        if (title.isBlank() && text.isBlank()) return

        captureNotificationUseCase.execute(
            packageName = sbn.packageName,
            notificationKey = sbn.key ?: "\${sbn.packageName}_\${sbn.id}",
            title = title,
            text = text,
            bigText = bigText,
            subText = subText,
            channelId = notification.channelId,
            postTime = sbn.postTime,
            isClearable = sbn.isClearable,
            isOngoing = sbn.isOngoing,
            flags = notification.flags,
            isInitialSync = isInitialSync
        )
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }
}`,
    },
    'NotificationEntity.kt': {
      category: 'data/local/entity',
      icon: Database,
      content: `package com.notifyvault.data.local.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Room Entity representing a captured notification.
 * Highly indexed for instantaneous search and chronological timelines.
 */
@Entity(
    tableName = "notifications",
    indices = [
        Index(value = ["packageName"]),
        Index(value = ["timestamp"]),
        Index(value = ["isFavorite"]),
        Index(value = ["isRead"]),
        Index(value = ["isArchived"]),
        Index(value = ["fingerprint"])
    ]
)
data class NotificationEntity(
    @PrimaryKey
    val id: String,
    val notificationKey: String,
    val packageName: String,
    val appName: String,
    val appVersion: String? = null,
    val title: String,
    val text: String,
    val bigText: String? = null,
    val subText: String? = null,
    val summaryText: String? = null,
    val category: String, // Messaging, Email, Finance, OTP, etc.
    val channelId: String? = null,
    val channelName: String? = null,
    val groupKey: String? = null,
    val isGroupSummary: Boolean = false,
    val timestamp: Long,
    val postTime: Long,
    val removedTime: Long? = null,
    val removalReason: String? = null,
    val isRead: Boolean = false,
    val isFavorite: Boolean = false,
    val isArchived: Boolean = false,
    val isSensitive: Boolean = false,
    val isOngoing: Boolean = false,
    val isClearable: Boolean = true,
    val hasActions: Boolean = false,
    val actionCount: Int = 0,
    val importance: String = "HIGH",
    val notificationFlags: Int = 0,
    val fingerprint: String,
    val isOtp: Boolean = false,
    val otpCode: String? = null,
    val isOtpMasked: Boolean = false,
    val tags: List<String> = emptyList(),
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)`,
    },
    'NotificationDao.kt': {
      category: 'data/local/dao',
      icon: Database,
      content: `package com.notifyvault.data.local.dao

import androidx.paging.PagingSource
import androidx.room.*
import com.notifyvault.data.local.entity.NotificationEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface NotificationDao {

    @Query("SELECT * FROM notifications WHERE isArchived = 0 ORDER BY timestamp DESC")
    fun getTimelinePaged(): PagingSource<Int, NotificationEntity>

    @Query("SELECT * FROM notifications WHERE isArchived = 0 ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentNotifications(limit: Int = 50): Flow<List<NotificationEntity>>

    @Query("SELECT * FROM notifications WHERE isFavorite = 1 ORDER BY timestamp DESC")
    fun getFavorites(): Flow<List<NotificationEntity>>

    @Query("SELECT * FROM notifications WHERE packageName = :packageName AND isArchived = 0 ORDER BY timestamp DESC")
    fun getNotificationsForApp(packageName: String): Flow<List<NotificationEntity>>

    @Query("""
        SELECT * FROM notifications 
        WHERE (title LIKE '%' || :query || '%' OR text LIKE '%' || :query || '%' OR appName LIKE '%' || :query || '%')
        AND isArchived = 0
        ORDER BY timestamp DESC
    """)
    fun searchNotifications(query: String): Flow<List<NotificationEntity>>

    @Query("SELECT * FROM notifications WHERE fingerprint = :fingerprint LIMIT 1")
    suspend fun findByFingerprint(fingerprint: String): NotificationEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(notification: NotificationEntity)

    @Update
    suspend fun update(notification: NotificationEntity)

    @Query("UPDATE notifications SET isFavorite = :isFavorite WHERE id = :id")
    suspend fun setFavorite(id: String, isFavorite: Boolean)

    @Query("UPDATE notifications SET isRead = 1 WHERE id = :id")
    suspend fun markAsRead(id: String)

    @Query("DELETE FROM notifications WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("DELETE FROM notifications WHERE id IN (:ids)")
    suspend fun deleteBulk(ids: List<String>)

    @Query("DELETE FROM notifications WHERE timestamp < :cutoffTime AND isFavorite = 0")
    suspend fun deleteOlderThan(cutoffTime: Long): Int
}`,
    },
    'OtpDetectionUseCase.kt': {
      category: 'domain/usecase',
      icon: ShieldCheck,
      content: `package com.notifyvault.domain.usecase

import java.util.regex.Pattern
import javax.inject.Inject

/**
 * Local-first regex-based OTP and verification code detector.
 * Supports English and Arabic verification phrases.
 */
class DetectOtpUseCase @Inject constructor() {

    private val enKeywords = Pattern.compile(
        "(?i)(?:verification\\\\s*code|one-time\\\\s*password|otp|code\\\\s*is|secret\\\\s*code|pin\\\\s*is)"
    )
    private val arKeywords = Pattern.compile(
        "(?:رمز\\\\s*التحقق|كود\\\\s*التحقق|رمز\\\\s*التأكيد|كلمة\\\\s*المرور\\\\s*لمرة\\\\s*واحدة)"
    )
    private val digitPattern = Pattern.compile("(?:\\\\b|[\\\\s:])([0-9]{4,8})(?:\\\\b|[\\\\s.]|$)")

    data class Result(
        val isOtp: Boolean,
        val code: String? = null,
        val maskedText: String? = null
    )

    fun execute(title: String, text: String): Result {
        val combined = "$title $text"
        val hasKeyword = enKeywords.matcher(combined).find() || arKeywords.matcher(combined).find()

        if (!hasKeyword) {
            return Result(isOtp = false)
        }

        val matcher = digitPattern.matcher(text)
        if (matcher.find()) {
            val code = matcher.group(1)
            val masked = text.replace(code, "••••••")
            return Result(isOtp = true, code = code, maskedText = masked)
        }

        return Result(isOtp = true)
    }
}`,
    },
    'RetentionCleanupWorker.kt': {
      category: 'workers',
      icon: Layers,
      content: `package com.notifyvault.workers

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.notifyvault.data.local.dao.NotificationDao
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import java.util.concurrent.TimeUnit

/**
 * WorkManager scheduled daily background worker to safely prune records
 * older than user-specified retention policy while preserving Favorites.
 */
@HiltWorker
class RetentionCleanupWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val notificationDao: NotificationDao
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            // Default 30-day policy cutoff
            val cutoff = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(30)
            val deletedCount = notificationDao.deleteOlderThan(cutoff)
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}`,
    },
    'build.gradle.kts': {
      category: 'config',
      icon: FileCode,
      content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.notifyvault"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.notifyvault"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.navigation.compose)

    // Room Database
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    implementation(libs.androidx.room.paging)
    ksp(libs.androidx.room.compiler)

    // Hilt Dependency Injection
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)

    // WorkManager
    implementation(libs.androidx.work.runtime.ktx)
    implementation(libs.androidx.hilt.work)

    // Biometrics & Security
    implementation(libs.androidx.biometric)
    implementation(libs.androidx.security.crypto)
}`,
    },
    'AndroidManifest.xml': {
      category: 'manifest',
      icon: FileCode,
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Minimal permissions: strictly local execution with zero Internet requirement -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <application
        android:name=".NotifyVaultApp"
        android:allowBackup="false"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.NotifyVault"
        tools:targetApi="31">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.NotifyVault">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Android Notification Listener Service Definition -->
        <service
            android:name=".service.NotifyVaultNotificationListenerService"
            android:label="@string/notification_service_label"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>

    </application>

</manifest>`,
    }
  };

  const current = files[selectedFile];

  const handleCopy = () => {
    if (current) {
      navigator.clipboard?.writeText(current.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadAll = () => {
    // Generate combined bundle
    const content = Object.entries(files)
      .map(([name, item]) => `// ==========================================\n// FILE: ${item.category}/${name}\n// ==========================================\n\n${item.content}\n\n`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notifyvault_android_source_bundle.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="android_source_modal_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="android_source_modal"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl h-[85vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">NotifyVault Android Architecture</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Kotlin 2.0 • Jetpack Compose • Material 3 • Room 2.6 • Hilt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-semibold"
              title="Download Source Bundle"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Bundle</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy File'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar Tree + Code Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto p-3 bg-zinc-50 dark:bg-zinc-950/50">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2 mb-2">
              Android Project
            </div>
            <div className="space-y-1">
              {Object.entries(files).map(([fileName, data]) => {
                const IconComponent = data.icon;
                const isSelected = selectedFile === fileName;
                return (
                  <button
                    key={fileName}
                    onClick={() => setSelectedFile(fileName)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-850'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
                    <div className="truncate">
                      <div className="truncate">{fileName}</div>
                      <div className="text-[10px] opacity-70 truncate">{data.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950 text-zinc-200">
            <div className="px-4 py-2 border-b border-zinc-800 text-xs font-mono text-zinc-400 flex items-center justify-between">
              <span>app/src/main/java/com/notifyvault/{current?.category}/{selectedFile}</span>
              <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 font-sans">
                Production Kotlin
              </span>
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-zinc-300 selection:bg-indigo-600">
              <pre>{current?.content}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
