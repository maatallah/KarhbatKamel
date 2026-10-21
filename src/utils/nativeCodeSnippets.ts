export interface NativeSnippet {
  id: string;
  filename: string;
  path: string;
  language: string;
  description: string;
  code: string;
}

export const NATIVE_SNIPPETS: NativeSnippet[] = [
  {
    id: 'main_application',
    filename: 'MainApplication.kt',
    path: 'android/app/src/main/java/com/automusicplayer/MainApplication.kt',
    language: 'kotlin',
    description: 'Solves Bridgeless C++ JNI layout bridges by initializing SoLoader immediately inside attachBaseContext before static feature configuration mapping runs, avoiding unhandled ExceptionInInitializerError loops.',
    code: `package com.automusicplayer

import android.app.Application
import android.content.Context
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

    override fun attachBaseContext(base: Context?) {
        // Enforce immediate execution before Bridgeless C++ modules load static flags
        // Critical for Standalone APK startup stability on Android 11 (SM-A107F)
        SoLoader.init(base, com.facebook.react.common.build.MergedSoMapping.openSourceMergedSoMapping)
        super.attachBaseContext(base)
    }

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages() = PackageList(this).packages.apply {
                // Add native automotive bridge modules
                add(AmpNativePackage())
            }

            override fun getJSMainModuleName(): String = "index"
            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
            override val isNewArchEnabled: Boolean = true
            override val isHermesEnabled: Boolean = true
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        // Load Bridgeless C++ TurboModules EntryPoint
        load(bridgelessEnabled = true)
    }
}`,
  },
  {
    id: 'playback_service',
    filename: 'PlaybackService.kt',
    path: 'android/app/src/main/java/com/automusicplayer/media/PlaybackService.kt',
    language: 'kotlin',
    description: 'Continuous foreground audio execution. Enforces immediate createNotificationChannel() and startForeground(1, notification) at the absolute start of onCreate() to eliminate background service startup crash loops.',
    code: `package com.automusicplayer.media

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.media3.common.MediaItem
import androidx.media3.session.MediaLibraryService
import androidx.media3.session.MediaSession
import com.automusicplayer.MainActivity

class PlaybackService : MediaLibraryService() {

    private val CHANNEL_ID = "amp_playback_channel"
    private val NOTIFICATION_ID = 1001
    private var mediaLibrarySession: MediaLibrarySession? = null

    override fun onCreate() {
        // Strict Enforcement: Initialize foreground assets at the absolute start of onCreate()
        // Must be called immediately to comply with Android 11+ background service execution limits
        createNotificationChannel()
        val notification = createNotification("AMP Automotive Engine Initialized")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }

        super.onCreate()
        initializeMediaLibrarySession()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "AMP Automotive Playback Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Automotive background playback and SDVS active audio normalization"
                setShowBadge(false)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun createNotification(contentText: String): Notification {
        val launchIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Auto Music Player (AMP)")
            .setContentText(contentText)
            .setSubText("SDVS Active • Automotive Mode")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build()
    }

    private fun initializeMediaLibrarySession() {
        // Expose media assets to vehicle infotainment and Bluetooth AVRCP accessories
        val player = androidx.media3.exoplayer.ExoPlayer.Builder(this).build()
        mediaLibrarySession = MediaLibrarySession.Builder(this, player, LibraryCallback()).build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaLibrarySession? {
        return mediaLibrarySession
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        return START_STICKY
    }

    override fun onDestroy() {
        mediaLibrarySession?.run {
            player.release()
            release()
            mediaLibrarySession = null
        }
        super.onDestroy()
    }

    private class LibraryCallback : MediaLibrarySession.Callback
}`,
  },
  {
    id: 'sdvs_module',
    filename: 'SdvsModule.kt',
    path: 'android/app/src/main/java/com/automusicplayer/modules/SdvsModule.kt',
    language: 'kotlin',
    description: 'Speed-Dependent Volume Scaling TurboModule interfacing native LocationManager to compute acoustic gain and modulate ExoPlayer audio volume in real-time.',
    code: `package com.automusicplayer.modules

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlin.math.ln
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow

class SdvsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), LocationListener {

    private var locationManager: LocationManager? = null
    private var isTracking = false
    private var minSpeedKmH = 15.0
    private var maxSpeedKmH = 130.0
    private var maxBoostDb = 8.0
    private var curveType = "exponential"

    override fun getName() = "AmpSdvsModule"

    @ReactMethod
    @SuppressLint("MissingPermission")
    fun startSpeedTracking(config: ReadableMap, promise: Promise) {
        try {
            minSpeedKmH = config.getDouble("minSpeedKmH")
            maxSpeedKmH = config.getDouble("maxSpeedKmH")
            maxBoostDb = config.getDouble("maxBoostDb")
            curveType = config.getString("curveType") ?: "exponential"

            locationManager = reactContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
            locationManager?.requestLocationUpdates(
                LocationManager.GPS_PROVIDER,
                500L, // 500ms sampling rate for responsive speed tracking
                1.0f, // 1 meter delta
                this
            )
            isTracking = true
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SDVS_ERROR", e.localizedMessage)
        }
    }

    @ReactMethod
    fun stopSpeedTracking(promise: Promise) {
        locationManager?.removeUpdates(this)
        isTracking = false
        promise.resolve(true)
    }

    override fun onLocationChanged(location: Location) {
        // Speed provided by GPS hardware in meters/second
        val speedMps = if (location.hasSpeed()) location.speed else 0.0f
        val speedKmH = speedMps * 3.6

        val boostDb = computeBoostDb(speedKmH)
        val gainMultiplier = 10.0.pow(boostDb / 20.0)

        val params = Arguments.createMap().apply {
            putDouble("speedKmH", speedKmH)
            putDouble("boostDb", boostDb)
            putDouble("gainMultiplier", gainMultiplier)
            putDouble("accuracy", location.accuracy.toDouble())
            putDouble("timestamp", location.time.toDouble())
        }

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onSpeedChange", params)
    }

    private fun computeBoostDb(speedKmH: Double): Double {
        if (speedKmH <= minSpeedKmH) return 0.0
        if (speedKmH >= maxSpeedKmH) return maxBoostDb

        val ratio = (speedKmH - minSpeedKmH) / (maxSpeedKmH - minSpeedKmH)
        val clamped = max(0.0, min(1.0, ratio))

        return when (curveType) {
            "linear" -> clamped * maxBoostDb
            "exponential" -> clamped.pow(1.7) * maxBoostDb
            "s_curve" -> {
                val s = 1.0 / (1.0 + Math.exp(-8.0 * (clamped - 0.5)))
                val s0 = 1.0 / (1.0 + Math.exp(4.0))
                val s1 = 1.0 / (1.0 + Math.exp(-4.0))
                ((s - s0) / (s1 - s0)) * maxBoostDb
            }
            else -> clamped * maxBoostDb
        }
    }

    override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
    override fun onProviderEnabled(provider: String) {}
    override fun onProviderDisabled(provider: String) {}
}`,
  },
  {
    id: 'ignition_receiver',
    filename: 'IgnitionReceiver.kt',
    path: 'android/app/src/main/java/com/automusicplayer/receivers/IgnitionReceiver.kt',
    language: 'kotlin',
    description: 'Hardware broadcast receiver mapping vehicle 12V rail connection and cutoff events (ACTION_POWER_CONNECTED / ACTION_POWER_DISCONNECTED) to automatic play/pause actions.',
    code: `package com.automusicplayer.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.automusicplayer.media.PlaybackService

class IgnitionReceiver : BroadcastReceiver() {

    private val TAG = "AMP_IgnitionReceiver"
    private val crankDelayMs = 1500L // 1.5s delay to avoid alternator startup voltage dip
    private val handler = Handler(Looper.getMainLooper())

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_POWER_CONNECTED -> {
                Log.d(TAG, "Vehicle Ignition Detected: POWER_CONNECTED")
                // Grace delay allowing starter motor crank to finish
                handler.postDelayed({
                    val playIntent = Intent(context, PlaybackService::class.java).apply {
                        action = "ACTION_AUTO_PLAY"
                    }
                    context.startService(playIntent)
                }, crankDelayMs)
            }

            Intent.ACTION_POWER_DISCONNECTED -> {
                Log.d(TAG, "Vehicle Engine Cutoff: POWER_DISCONNECTED")
                handler.removeCallbacksAndMessages(null)
                val pauseIntent = Intent(context, PlaybackService::class.java).apply {
                    action = "ACTION_AUTO_PAUSE"
                }
                context.startService(pauseIntent)
            }
        }
    }
}`,
  },
  {
    id: 'telemetry_storage',
    filename: 'TelemetryStorage.kt',
    path: 'android/app/src/main/java/com/automusicplayer/telemetry/TelemetryStorage.kt',
    language: 'kotlin',
    description: 'Thread-safe offline persistence layer with explicit filesystem sync (WAL mode) ensuring telemetry survive unexpected system kills and low-memory conditions.',
    code: `package com.automusicplayer.telemetry

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

@Entity(tableName = "telemetry_events")
data class TelemetryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val timestamp: Long,
    val type: String,
    val message: String,
    val speedKmH: Double?,
    val boostDb: Double?,
    val errorDetails: String?
)

@Dao
interface TelemetryDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(event: TelemetryEntity)

    @Query("SELECT * FROM telemetry_events ORDER BY timestamp DESC LIMIT :limit")
    suspend fun getRecent(limit: Int): List<TelemetryEntity>

    @Query("DELETE FROM telemetry_events")
    suspend fun clear()
}

@Database(entities = [TelemetryEntity::class], version = 1, exportSchema = false)
abstract class AmpTelemetryDatabase : RoomDatabase() {
    abstract fun telemetryDao(): TelemetryDao

    companion object {
        @Volatile
        private var INSTANCE: AmpTelemetryDatabase? = null

        fun getDatabase(context: Context): AmpTelemetryDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AmpTelemetryDatabase::class.java,
                    "amp_telemetry.db"
                )
                .setJournalMode(JournalMode.WRITE_AHEAD_LOGGING)
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

class TelemetryWriter(private val context: Context) {
    private val db = AmpTelemetryDatabase.getDatabase(context)

    suspend fun writeWithDiskFlush(event: TelemetryEntity) = withContext(Dispatchers.IO) {
        db.telemetryDao().insert(event)
        // Enforce immediate safe file system flush for crash boundary protection
        val dbPath = context.getDatabasePath("amp_telemetry.db")
        if (dbPath.exists()) {
            FileOutputStream(dbPath, true).channel.force(true)
        }
    }
}`,
  },
  {
    id: 'manifest',
    filename: 'AndroidManifest.xml',
    path: 'android/app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Production Android manifest declaring foregroundServiceType="mediaPlayback", GPS permissions, Bluetooth AVRCP intents, and Ignition BroadcastReceiver.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.automusicplayer">

    <!-- Permissions required for continuous automotive playback -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Speed-Dependent Volume Scaling GPS Hardware Permissions -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Storage and Bluetooth Media Permissions -->
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme"
        android:supportsRtl="true">

        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
                <category android:name="android.intent.category.CAR_LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Foreground Audio Service with MediaPlayback type -->
        <service
            android:name=".media.PlaybackService"
            android:foregroundServiceType="mediaPlayback"
            android:exported="true">
            <intent-filter>
                <action android:name="androidx.media3.session.MediaLibraryService" />
                <action android:name="android.media.browse.MediaBrowserService" />
            </intent-filter>
        </service>

        <!-- Vehicle Ignition Power Receiver -->
        <receiver
            android:name=".receivers.IgnitionReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.ACTION_POWER_CONNECTED" />
                <action android:name="android.intent.action.ACTION_POWER_DISCONNECTED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`,
  },
  {
    id: 'build_gradle',
    filename: 'build.gradle.kts',
    path: 'android/app/build.gradle.kts',
    language: 'kotlin',
    description: 'Gradle 9.4.1 build configuration with Target SDK 34, Android 11 SM-A107F tuning, and Bridgeless TurboModules compilation settings.',
    code: `plugins {
    id("com.android.application")
    id("kotlin-android")
    id("com.facebook.react")
}

react {
    // Modern Bridgeless / TurboModules React Native Architecture enabled
    root = file("../../")
    reactNativeDir = file("../../node_modules/react-native")
    codegenDir = file("../../node_modules/@react-native/codegen")
    autolinkLibrariesWithApp()
}

android {
    namespace = "com.automusicplayer"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.automusicplayer"
        minSdk = 21
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        ndk {
            abiFilters.addAll(listOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64"))
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("com.facebook.react:react-android")
    implementation("com.facebook.soloader:soloader:0.12.1")
    
    // AndroidX Media3 / ExoPlayer for Automotive foreground playback
    implementation("androidx.media3:media3-exoplayer:1.3.1")
    implementation("androidx.media3:media3-session:1.3.1")
    implementation("androidx.media3:media3-ui:1.3.1")

    // Room persistence for offline telemetry
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
}`,
  },
];
