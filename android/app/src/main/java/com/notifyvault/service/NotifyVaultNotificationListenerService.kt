package com.notifyvault.service

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.notifyvault.domain.usecase.CaptureNotificationUseCase
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class NotifyVaultNotificationListenerService : NotificationListenerService() {

    @Inject
    lateinit var captureNotificationUseCase: CaptureNotificationUseCase

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val extras = sbn.notification.extras
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString()
        val packageName = sbn.packageName ?: return

        // Ignore self notifications and empty system toasts
        if (packageName == applicationContext.packageName || (title.isBlank() && text.isBlank())) {
            return
        }

        serviceScope.launch {
            try {
                captureNotificationUseCase.execute(
                    packageName = packageName,
                    title = title,
                    text = text,
                    bigText = bigText,
                    postTime = sbn.postTime,
                    key = sbn.key
                )
            } catch (e: Exception) {
                Log.e("NotifyVault", "Error saving notification", e)
            }
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        super.onNotificationRemoved(sbn)
        // Handled for dismissal tracking if user enabled dismissal sync
    }
}
