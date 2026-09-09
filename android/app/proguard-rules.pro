# NotifyVault ProGuard / R8 Rules

# Room Database
-keepclassmembers class * extends androidx.room.RoomDatabase {
    <init>();
}
-keep class * extends androidx.room.RoomDatabase
-dontwarn androidx.room.paging.**

# Kotlin Coroutines & Flow
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}

# Hilt & Dagger
-dontwarn com.google.errorprone.annotations.**
-keep,allowobfuscation,allowshrinking @interface dagger.hilt.**

# Security & Crypto
-keepclassmembers class * extends androidx.security.crypto.EncryptedSharedPreferences {
    *;
}
