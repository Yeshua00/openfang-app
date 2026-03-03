package com.openfang.termux

import android.os.Build
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.openfang.termux/native"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "getArch" -> result.success(Build.SUPPORTED_ABIS.firstOrNull() ?: "aarch64")
                "getFilesDir" -> result.success(applicationContext.filesDir.absolutePath)
                "getNativeLibDir" -> result.success(applicationContext.applicationInfo.nativeLibraryDir)
                "getProotPath" -> result.success("/data/data/com.termux/files/usr/var/lib/proot-distro/installed-rootfs/ubuntu/root")
                "isBootstrapComplete" -> result.success(false)
                "getBootstrapStatus" -> result.success(mapOf(
                    "rootfsExtracted" to false,
                    "nodeInstalled" to false,
                    "openfangInstalled" to false,
                    "openfangBinaryInstalled" to false,
                    "goInstalled" to false
                ))
                "extractRootfs" -> result.success(true)
                "runInProot" -> result.success("")
                "startGateway" -> result.success(true)
                "stopGateway" -> result.success(true)
                "isGatewayRunning" -> result.success(false)
                "setupDirs" -> result.success(true)
                "installBionicBypass" -> result.success(true)
                "writeResolv" -> result.success(true)
                "extractDebPackages" -> result.success(0)
                "extractNodeTarball" -> result.success(true)
                "createBinWrappers" -> result.success(true)
                "startTerminalService" -> result.success(true)
                "stopTerminalService" -> result.success(true)
                "isTerminalServiceRunning" -> result.success(false)
                "startNodeService" -> result.success(true)
                "stopNodeService" -> result.success(true)
                "isNodeServiceRunning" -> result.success(false)
                "updateNodeNotification" -> result.success(true)
                "requestBatteryOptimization" -> result.success(true)
                "isBatteryOptimized" -> result.success(false)
                "startSetupService" -> result.success(true)
                "updateSetupNotification" -> result.success(true)
                "stopSetupService" -> result.success(true)
                "showUrlNotification" -> result.success(true)
                "requestScreenCapture" -> result.success(null)
                "stopScreenCapture" -> result.success(true)
                "requestStoragePermission" -> result.success(true)
                "hasStoragePermission" -> result.success(true)
                "getExternalStoragePath" -> result.success("/sdcard")
                "readRootfsFile" -> result.success("")
                "writeRootfsFile" -> result.success(true)
                "startSshd" -> result.success(true)
                "stopSshd" -> result.success(true)
                "isSshdRunning" -> result.success(false)
                "getSshdPort" -> result.success(8022)
                "getDeviceIps" -> result.success(listOf<String>())
                "setRootPassword" -> result.success(true)
                else -> result.notImplemented()
            }
        }
    }
}
