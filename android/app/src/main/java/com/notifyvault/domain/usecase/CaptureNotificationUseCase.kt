package com.notifyvault.domain.usecase

import com.notifyvault.data.local.dao.NotificationDao
import com.notifyvault.data.local.entity.NotificationEntity
import java.security.MessageDigest
import java.util.UUID
import javax.inject.Inject

class CaptureNotificationUseCase @Inject constructor(
    private val notificationDao: NotificationDao,
    private val detectOtpUseCase: DetectOtpUseCase
) {
    suspend fun execute(
        packageName: String,
        title: String,
        text: String,
        bigText: String?,
        postTime: Long,
        key: String
    ): Boolean {
        // Generate SHA-256 fingerprint for deduplication
        val rawData = "$packageName:$title:$text"
        val fingerprint = MessageDigest.getInstance("SHA-256")
            .digest(rawData.toByteArray())
            .joinToString("") { "%02x".format(it) }

        val detectedOtp = detectOtpUseCase.execute("$title $text ${bigText ?: ""}")
        val hasOtp = detectedOtp != null

        val appName = packageName.substringAfterLast(".").replaceFirstChar { it.uppercase() }

        val entity = NotificationEntity(
            id = UUID.randomUUID().toString(),
            packageName = packageName,
            appName = appName,
            title = title,
            text = text,
            bigText = bigText,
            timestamp = postTime,
            isRead = false,
            isFavorite = false,
            category = if (hasOtp) "security" else "general",
            importance = if (hasOtp) "high" else "default",
            hasOtp = hasOtp,
            otpCode = detectedOtp,
            tags = if (hasOtp) "OTP" else "",
            fingerprint = fingerprint
        )

        val rowId = notificationDao.insert(entity)
        return rowId != -1L
    }
}
