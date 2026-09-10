package com.notifyvault.di

import android.content.Context
import androidx.room.Room
import com.notifyvault.data.local.NotifyVaultDatabase
import com.notifyvault.data.local.dao.NotificationDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): NotifyVaultDatabase {
        return Room.databaseBuilder(
            context,
            NotifyVaultDatabase::class.java,
            "notifyvault.db"
        ).fallbackToDestructiveMigration().build()
    }

    @Provides
    fun provideNotificationDao(database: NotifyVaultDatabase): NotificationDao {
        return database.notificationDao()
    }
}
