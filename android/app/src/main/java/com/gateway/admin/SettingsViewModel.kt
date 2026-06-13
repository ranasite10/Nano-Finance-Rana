package com.gateway.admin

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class TongConfig(
    val step: Int,
    val isActive: Boolean,
    val type: AudioAlertManager.AlarmType
)

data class SettingsState(
    val baseUrl: String = "https://example.com",
    val pollingInterval: Int = 5,
    val alarmDuration: Int = 10,
    val tongs: List<TongConfig> = emptyList(),
    val isServiceRunning: Boolean = false,
    val lastSyncStatus: String = "Never synced",
    val lastSyncTime: String = "-"
)

class SettingsViewModel(application: Application) : AndroidViewModel(application) {
    private val context = application.applicationContext
    private val prefs = context.getSharedPreferences("gateway_monitor_prefs", Context.MODE_PRIVATE)
    private val audioAlertManager = AudioAlertManager(context)

    private val _state = MutableStateFlow(SettingsState())
    val state: StateFlow<SettingsState> = _state.asStateFlow()

    private val listener = android.content.SharedPreferences.OnSharedPreferenceChangeListener { _, key ->
        if (key == "pref_last_sync_status" || key == "pref_last_sync_time" || key == "pref_service_running" || key == "pref_base_url") {
            loadSettings()
        }
    }

    init {
        prefs.registerOnSharedPreferenceChangeListener(listener)
        loadSettings()
    }

    fun loadSettings() {
        // Dynamically prefill with a smart default or loaded preference
        val baseUrl = prefs.getString("pref_base_url", "") ?: ""
        val pollingInterval = prefs.getInt("pref_poll_interval", 5)
        val alarmDuration = prefs.getInt("pref_alarm_duration", 10)
        val isServiceRunning = prefs.getBoolean("pref_service_running", false)
        val lastSyncStatus = prefs.getString("pref_last_sync_status", "Never synced") ?: "Never synced"
        val lastSyncTime = prefs.getString("pref_last_sync_time", "-") ?: "-"
        
        val tongs = (0..4).map { step ->
            val isActive = prefs.getBoolean("pref_tong_step_${step}_active", true)
            val typeStr = prefs.getString("pref_tong_step_${step}_type", getDefaultAlarmType(step)) ?: "DIGITAL_BEEP"
            val type = try {
                AudioAlertManager.AlarmType.valueOf(typeStr)
            } catch (e: Exception) {
                AudioAlertManager.AlarmType.DIGITAL_BEEP
            }
            TongConfig(step, isActive, type)
        }

        _state.value = SettingsState(
            baseUrl = baseUrl,
            pollingInterval = pollingInterval,
            alarmDuration = alarmDuration,
            tongs = tongs,
            isServiceRunning = isServiceRunning,
            lastSyncStatus = lastSyncStatus,
            lastSyncTime = lastSyncTime
        )
    }

    private fun getDefaultAlarmType(step: Int): String {
        return when (step) {
            0, 4 -> "SOFT_CHIME"
            1 -> "DIGITAL_BEEP"
            2 -> "PHONE_RINGTONE"
            else -> "DIGITAL_BEEP"
        }
    }

    fun updateBaseUrl(url: String) {
        prefs.edit().putString("pref_base_url", url).apply()
        _state.value = _state.value.copy(baseUrl = url)
    }

    fun updatePollingInterval(interval: Int) {
        prefs.edit().putInt("pref_poll_interval", interval.coerceIn(2, 60)).apply()
        _state.value = _state.value.copy(pollingInterval = interval)
    }

    fun updateAlarmDuration(duration: Int) {
        prefs.edit().putInt("pref_alarm_duration", duration.coerceIn(1, 60)).apply()
        _state.value = _state.value.copy(alarmDuration = duration)
    }

    fun toggleTong(step: Int, active: Boolean) {
        prefs.edit().putBoolean("pref_tong_step_${step}_active", active).apply()
        val updatedTongs = _state.value.tongs.map {
            if (it.step == step) it.copy(isActive = active) else it
        }
        _state.value = _state.value.copy(tongs = updatedTongs)
    }

    fun updateTongType(step: Int, type: AudioAlertManager.AlarmType) {
        prefs.edit().putString("pref_tong_step_${step}_type", type.name).apply()
        val updatedTongs = _state.value.tongs.map {
            if (it.step == step) it.copy(type = type) else it
        }
        _state.value = _state.value.copy(tongs = updatedTongs)
    }

    fun testSound(type: AudioAlertManager.AlarmType) {
        val duration = _state.value.alarmDuration
        audioAlertManager.playSound(type, duration)
    }

    fun stopTestSound() {
        audioAlertManager.stopSound()
    }

    fun toggleService(enable: Boolean) {
        if (enable) {
            MonitoringService.startService(context)
        } else {
            MonitoringService.stopService(context)
        }
        _state.value = _state.value.copy(isServiceRunning = enable)
    }

    override fun onCleared() {
        prefs.unregisterOnSharedPreferenceChangeListener(listener)
        audioAlertManager.stopSound()
        super.onCleared()
    }
}
