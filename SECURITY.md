# NotifyVault — Security Architecture

## Security Principles

1. **Sandboxed Data Storage**
   Notifications are saved in Android's private app directory (`/data/data/com.notifyvault/databases/`). Android file system permissions ensure other apps cannot access this directory.

2. **Biometric Authentication & PIN Lock**
   NotifyVault supports Android BiometricPrompt (Fingerprint, Face Unlock) and an encrypted PIN fallback to guard access upon opening.

3. **ProGuard / R8 Obfuscation**
   Release builds are hardened against reverse-engineering and decompilation with custom rules in `proguard-rules.pro`.

4. **No Third-Party Analytics SDKs**
   No Google Analytics, Firebase, Crashlytics, or marketing trackers are bundled into the project.
