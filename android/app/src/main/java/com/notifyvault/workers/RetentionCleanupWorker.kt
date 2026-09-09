package com.notifyvault.workers

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.notifyvault.data.local.dao.NotificationDao
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class RetentionCleanupWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val notificationDao: NotificationDao
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            // Default 30-day retention cutoff: delete unstarred notifications older than 30 days
            val thirtyDaysMillis = 30L * 24 * 60 * 60 * 1000
            val cutoff = System.currentTimeMillis() - thirtyDaysMillis

            val deletedCount = notificationDao.deleteOlderThan(cutoff)
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
