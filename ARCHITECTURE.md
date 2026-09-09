# NotifyVault — System Architecture

NotifyVault follows Google's **Clean Architecture & MVI (Model-View-Intent)** guidelines for modern Android applications, combined with an offline-first Room database repository pattern.

```
┌────────────────────────────────────────────────────────┐
│              Android System Notification Bar           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
      ┌───────────────────────────────────────────┐
      │  NotifyVaultNotificationListenerService   │
      └─────────────────────┬─────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │      CaptureNotificationUseCase       │
        │  - SHA-256 Fingerprint Deduplication  │
        │  - Regex / Heuristic OTP Detection    │
        │  - Category & Importance Classifier   │
        └───────────────────┬───────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │        NotificationRepository         │
        └───────────────────┬───────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │          Room SQLite Database         │
        │   (Indices on timestamp, app, tags)   │
        └───────────────────┬───────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │      Jetpack Compose UI (M3)          │
        │  Home • History • Apps • Insights     │
        └───────────────────────────────────────┘
```

## Data Layer
- **Room Database (`NotifyVaultDatabase`)**: Single source of truth.
- **Indexes**: Indexed on `timestamp`, `packageName`, `isFavorite`, and `category` for instant search response even across 50,000+ entries.
- **Deduplication Engine**: Calculates an incremental SHA-256 hash across `packageName`, `title`, and `text` to block duplicate noise within a 2-second sliding window.

## Domain Layer
- **CaptureNotificationUseCase**: Validates application blacklist, extracts extras, performs OTP detection, and saves to database.
- **DetectOtpUseCase**: Uses bilingual pattern matching (`English` & `العربية`) to detect verification codes and mask sensitive numbers.
- **RetentionWorker**: Executes periodic background cleanup using Android WorkManager without waking the CPU unnecessarily.

## Presentation Layer
- **Jetpack Compose with Material 3 Design System**:
  - Dynamic Color theming
  - RTL Layout mirroring for Arabic locale
  - High-performance lazy lists (`LazyColumn`) backed by Paging 3
