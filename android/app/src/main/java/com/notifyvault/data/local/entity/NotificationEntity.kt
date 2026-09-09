package com.notifyvault.data.local.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "notifications",
    indices = [
        Index(value = ["fingerprint"], unique = true),
        Index(value = ["packageName"]),
        Index(value = ["timestamp"]),
        Index(value = ["isFavorite"]),
        Index(value = ["category"])
    ]
)
data class NotificationEntity(
    @PrimaryKey
    val id: String,
    val packageName: String,
    val appName: String,
    val title: String,
    val text: String,
    val bigText: String?,
    val timestamp: Long,
    val isRead: Boolean = false,
    val isFavorite: Boolean = false,
    val isArchived: Boolean = false,
    val category: String = "general",
    val importance: String = "default",
    val hasOtp: Boolean = false,
    val otpCode: String? = null,
    val tags: String = "", // Comma-separated or JSON list
    val fingerprint: String
)
