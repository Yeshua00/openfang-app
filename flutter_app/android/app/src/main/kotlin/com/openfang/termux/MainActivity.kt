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
                "getArch" -> {
                    result.success(Build.SUPPORTED_ABIS.firstOrNull() ?: "aarch64")
                }
                "getFilesDir" -> {
                    result.success(applicationContext.filesDir.absolutePath)
                }
                "getNativeLibDir" -> {
                    result.success(applicationContext.applicationInfo.nativeLibraryDir)
                }
                "getProotPath" -> {
                    result.success("/data/data/com.termux/files/usr/var/lib/proot-distro/installed-rootfs/ubuntu/root")
                }
                "isBootstrapComplete" -> {
                    result.success(false)
                }
                "getBootstrapStatus" -> {
                    result.success(mapOf(
                        "rootfsExtracted" to false,
                        "nodeInstalled" to false,
                        "openfangInstalled" to false,
                        "goInstalled" to false
                    ))
                }
                else -> {
                    result.notImplemented()
                }
            }
        }
    }
}
