package com.notifyvault.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.notifyvault.data.local.dao.NotificationDao
import com.notifyvault.data.local.entity.NotificationEntity
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class FilterType {
    ALL, OTP, FAVORITES, WHATSAPP, MESSAGES
}

@HiltViewModel
class NotificationViewModel @Inject constructor(
    private val notificationDao: NotificationDao
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedFilter = MutableStateFlow(FilterType.ALL)
    val selectedFilter: StateFlow<FilterType> = _selectedFilter.asStateFlow()

    val notifications: StateFlow<List<NotificationEntity>> = combine(
        notificationDao.getAllFlow(),
        _searchQuery,
        _selectedFilter
    ) { allList, query, filter ->
        var filtered = allList

        if (query.isNotBlank()) {
            val q = query.trim().lowercase()
            filtered = filtered.filter {
                it.title.lowercase().contains(q) ||
                it.text.lowercase().contains(q) ||
                it.appName.lowercase().contains(q) ||
                (it.otpCode?.contains(q) == true)
            }
        }

        when (filter) {
            FilterType.ALL -> filtered
            FilterType.OTP -> filtered.filter { it.hasOtp }
            FilterType.FAVORITES -> filtered.filter { it.isFavorite }
            FilterType.WHATSAPP -> filtered.filter { it.packageName.lowercase().contains("whatsapp") }
            FilterType.MESSAGES -> filtered.filter { 
                it.packageName.lowercase().contains("sms") || 
                it.packageName.lowercase().contains("messaging") ||
                it.packageName.lowercase().contains("telephony")
            }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setFilter(filter: FilterType) {
        _selectedFilter.value = filter
    }

    fun toggleFavorite(id: String) {
        viewModelScope.launch {
            notificationDao.toggleFavorite(id)
        }
    }

    fun deleteNotification(entity: NotificationEntity) {
        viewModelScope.launch {
            notificationDao.delete(entity)
        }
    }

    fun clearAll() {
        viewModelScope.launch {
            notificationDao.clearAll()
        }
    }

    fun insertTestNotification(title: String, text: String, packageName: String = "com.whatsapp", otp: String? = null) {
        viewModelScope.launch {
            val entity = NotificationEntity(
                id = java.util.UUID.randomUUID().toString(),
                packageName = packageName,
                appName = if (packageName.contains("whatsapp")) "WhatsApp" else "Bank SMS",
                title = title,
                text = text,
                bigText = text,
                timestamp = System.currentTimeMillis(),
                isRead = false,
                isFavorite = false,
                category = if (otp != null) "security" else "general",
                hasOtp = otp != null,
                otpCode = otp,
                tags = if (otp != null) "OTP" else "",
                fingerprint = java.util.UUID.randomUUID().toString()
            )
            notificationDao.insert(entity)
        }
    }
}
