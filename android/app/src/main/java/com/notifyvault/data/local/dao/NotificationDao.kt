package com.notifyvault.data.local.dao

import androidx.paging.PagingSource
import androidx.room.*
import com.notifyvault.data.local.entity.NotificationEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface NotificationDao {

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(notification: NotificationEntity): Long

    @Update
    suspend fun update(notification: NotificationEntity)

    @Delete
    suspend fun delete(notification: NotificationEntity)

    @Query("SELECT * FROM notifications WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): NotificationEntity?

    @Query("SELECT * FROM notifications ORDER BY timestamp DESC")
    fun getAllPaged(): PagingSource<Int, NotificationEntity>

    @Query("SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 500")
    fun getAllFlow(): Flow<List<NotificationEntity>>

    @Query("SELECT * FROM notifications WHERE hasOtp = 1 ORDER BY timestamp DESC")
    fun getOtpFlow(): Flow<List<NotificationEntity>>

    @Query("SELECT * FROM notifications WHERE isFavorite = 1 ORDER BY timestamp DESC")
    fun getFavoritesFlow(): Flow<List<NotificationEntity>>

    @Query("SELECT * FROM notifications WHERE packageName = :packageName ORDER BY timestamp DESC")
    fun getByPackagePaged(packageName: String): PagingSource<Int, NotificationEntity>

    @Query("SELECT * FROM notifications WHERE isFavorite = 1 ORDER BY timestamp DESC")
    fun getFavoritesPaged(): PagingSource<Int, NotificationEntity>

    @Query("""
        SELECT * FROM notifications 
        WHERE (title LIKE '%' || :query || '%' OR text LIKE '%' || :query || '%' OR appName LIKE '%' || :query || '%')
        ORDER BY timestamp DESC
    """)
    fun searchPaged(query: String): PagingSource<Int, NotificationEntity>

    @Query("""
        SELECT * FROM notifications 
        WHERE (title LIKE '%' || :query || '%' OR text LIKE '%' || :query || '%' OR appName LIKE '%' || :query || '%')
        ORDER BY timestamp DESC LIMIT 200
    """)
    fun searchFlow(query: String): Flow<List<NotificationEntity>>

    @Query("UPDATE notifications SET isFavorite = NOT isFavorite WHERE id = :id")
    suspend fun toggleFavorite(id: String)

    @Query("UPDATE notifications SET isRead = 1 WHERE id = :id")
    suspend fun markAsRead(id: String)

    @Query("DELETE FROM notifications WHERE isFavorite = 0 AND timestamp < :cutoffTimestamp")
    suspend fun deleteOlderThan(cutoffTimestamp: Long): Int

    @Query("DELETE FROM notifications")
    suspend fun clearAll()
}
