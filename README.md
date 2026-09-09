# NotifyVault — Privacy-Focused Local-First Android Notification Manager

> **"Your notifications. Your device. Your control."**

NotifyVault is an offline-first, zero-telemetry Android notification management and history system. It empowers users to capture, search, filter, organize, and analyze all notification traffic entirely on device without cloud dependencies.

---

## Key Features

1. **Local-First & Zero Cloud Ingestion**
   - No internet permission requested in `AndroidManifest.xml` (`android.permission.INTERNET` is completely absent).
   - All notifications persist strictly in local Room database storage (encrypted via Android Jetpack Security Crypto / SQLCipher).
   - Zero telemetry, analytics SDKs, or cloud backups.

2. **Full Material 3 & Android 15 Design**
   - Native Material 3 color harmonies with dynamic light and dark theme styling.
   - Fluid Android status bar and navigation bar integration.
   - Dual preview modes: Flagship Android frame view and responsive desktop tablet layout.

3. **Intelligent Notification Processing**
   - **SHA-256 Deduplication**: Eliminates noisy duplicate updates (e.g. streaming players, download progress bars).
   - **OTP & Sensitive Code Masking**: Heuristic recognition of 4–8 digit verification codes in both English and Arabic with quick one-tap copy and masking options.
   - **Smart Auto-Categorization**: Categorizes notifications into Messages, Security/OTP, Finance/Banking, Delivery, Shopping, and System.

4. **Fast Chronological Search & Filtering**
   - Sub-millisecond instant search across title, message text, app name, and user tags.
   - Chronological grouping: *Today*, *Yesterday*, *This Week*, *Earlier*.
   - Filter sheet: by app, date range (Today, 7 days, 30 days), read/unread status, and category.
   - Multi-select bulk management: Mark read, star, archive, or delete with safety undo snackbar.

5. **Application-Specific Controls**
   - Blacklist / exclude specific apps (e.g., banking apps or confidential messengers).
   - Mark applications as sensitive.
   - Custom tags per application.

6. **Local Analytics & Heatmap**
   - 7-Day × 24-Hour activity density heatmap.
   - Volume statistics (Today, Week, Month, Favorites, Unread).
   - Top 5 most active notification sources with percentage bars.
   - Peak notification hour calculation.
   - Daily smart summary generated purely on device.

7. **Automated Storage & Retention**
   - Configurable retention periods: 1 day, 3 days, 7 days, 30 days, 90 days, 1 year, or Forever.
   - Smart cleanup: Deletes old unstarred notifications with a single tap.
   - Background WorkManager task executes daily maintenance automatically.

8. **Internationalization (i18n)**
   - Complete support for English (LTR) and Arabic / العربية (RTL).
   - Native RTL UI alignment and localized date/time formatting.

9. **Security & App Lock**
   - Biometric authentication (Fingerprint / Face Unlock) and PIN lock screen.

10. **Developer & Testing Suite**
    - Built-in notification generator supporting benchmark runs of 10, 100, 1,000, and 10,000 records.
    - Android Studio Source Inspector to view native Kotlin components, Room DAOs, and service declarations.

---

## Repository Structure

```
.
├── android/                             # Complete Android Studio project
│   ├── app/
│   │   ├── build.gradle.kts             # Dependencies (Compose, Room, Hilt, WorkManager)
│   │   ├── proguard-rules.pro           # Optimization and obfuscation rules
│   │   └── src/
│   │       ├── main/
│   │       │   ├── AndroidManifest.xml  # No internet permission, service declaration
│   │       │   ├── java/com/notifyvault/
│   │       │   │   ├── NotifyVaultApp.kt
│   │       │   │   ├── MainActivity.kt
│   │       │   │   ├── service/NotifyVaultNotificationListenerService.kt
│   │       │   │   ├── data/local/
│   │       │   │   │   ├── NotifyVaultDatabase.kt
│   │       │   │   │   ├── entity/NotificationEntity.kt
│   │       │   │   │   └── dao/NotificationDao.kt
│   │       │   │   ├── domain/usecase/
│   │       │   │   │   ├── CaptureNotificationUseCase.kt
│   │       │   │   │   └── DetectOtpUseCase.kt
│   │       │   │   └── workers/RetentionCleanupWorker.kt
│   │       │   └── res/
│   │       │       ├── values/strings.xml
│   │       │       └── values-ar/strings.xml
│   │       └── test/java/com/notifyvault/
│   │           └── DetectOtpUseCaseTest.kt
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── gradle.properties
├── src/                                 # Interactive Web Prototype & Simulator
│   ├── components/                      # M3 status bar, card, detail modal, heatmap, etc.
│   ├── views/                           # Home, History, Apps, Insights, Settings
│   ├── utils/                           # Local database engine, heuristics, i18n
│   ├── types.ts                         # Unified schema interfaces
│   └── App.tsx                          # Core React controller
├── ARCHITECTURE.md                      # System architecture & data flow
├── PRIVACY.md                           # Strict privacy pledge and security model
├── SECURITY.md                          # Security practices & vulnerability handling
├── CHANGELOG.md                         # Release history
└── metadata.json                        # Applet metadata
```

---

## Building the Android Application

1. Open Android Studio (Ladybug or newer).
2. Open the `/android` directory.
3. Allow Gradle to sync dependencies.
4. Select target device running Android 8.0 (API 26) through Android 15 (API 35).
5. Run `./gradlew test` to execute JUnit tests.
6. Run `./gradlew assembleRelease` to produce optimized release APK/AAB.
