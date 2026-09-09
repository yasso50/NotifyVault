package com.notifyvault.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.notifyvault.data.local.dao.NotificationDao
import com.notifyvault.data.local.entity.NotificationEntity

@Database(
    entities = [NotificationEntity::class],
    version = 1,
    exportSchema = true
)
abstract class NotifyVaultDatabase : RoomDatabase() {
    abstract fun notificationDao(): NotificationDao
}
