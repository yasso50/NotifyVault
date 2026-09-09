# NotifyVault — Privacy Manifesto & Policy

## 1. Zero Cloud Transmission
NotifyVault is engineered from the ground up to never send your personal notifications to external servers, cloud databases, or third parties.
- `android.permission.INTERNET` is intentionally and strictly omitted from `AndroidManifest.xml`.
- The application cannot communicate with any remote server even if it wanted to.

## 2. On-Device Sensitive Data Processing
- **OTP Protection**: Verification codes and one-time passwords can be masked with one tap or configured to be masked automatically upon arrival.
- **App Exclusion**: Any app (such as password managers, healthcare records, or private banking apps) can be individually blocked from ever saving notifications.

## 3. Storage & Deletion
- All notifications are stored inside the app's sandboxed internal storage.
- You have complete control over data retention: delete all items, auto-expire older than 1–90 days, or selectively preserve favorites.
- When you clear your history or uninstall the app, all records are permanently erased from flash memory.
