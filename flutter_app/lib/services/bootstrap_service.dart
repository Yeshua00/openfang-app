import 'dart:io';
import 'package:dio/dio.dart';
import '../constants.dart';
import '../models/setup_state.dart';
import 'native_bridge.dart';

class BootstrapService {
  final Dio _dio = Dio();

  void _updateSetupNotification(String text, {int progress = -1}) {
    try {
      NativeBridge.updateSetupNotification(text, progress: progress);
    } catch (_) {}
  }

  void _stopSetupService() {
    try {
      NativeBridge.stopSetupService();
    } catch (_) {}
  }

  Future<SetupState> checkStatus() async {
    try {
      final complete = await NativeBridge.isBootstrapComplete();
      if (complete) {
        return const SetupState(
          step: SetupStep.complete,
          progress: 1.0,
          message: 'Setup complete',
        );
      }
      return const SetupState(
        step: SetupStep.checkingStatus,
        progress: 0.0,
        message: 'Setup required',
      );
    } catch (e) {
      return SetupState(
        step: SetupStep.error,
        error: 'Failed to check status: $e',
      );
    }
  }

  String _getOpenFangTarget(String arch) {
    if (arch == 'aarch64' || arch == 'arm64') {
      return 'aarch64-unknown-linux-gnu';
    } else if (arch == 'x86_64') {
      return 'x86_64-unknown-linux-gnu';
    }
    return 'aarch64-unknown-linux-gnu';
  }

  Future<void> runFullSetup({
    required void Function(SetupState) onProgress,
  }) async {
    try {
      // Start foreground service to keep app alive during setup
      try {
        await NativeBridge.startSetupService();
      } catch (_) {} // Non-fatal if service fails to start

      // Step 0: Setup directories
      onProgress(const SetupState(
        step: SetupStep.checkingStatus,
        progress: 0.0,
        message: 'Setting up directories...',
      ));
      _updateSetupNotification('Setting up directories...', progress: 2);
      try { await NativeBridge.setupDirs(); } catch (_) {}
      try { await NativeBridge.writeResolv(); } catch (_) {}

      // Step 1: Download rootfs
      final arch = await NativeBridge.getArch();
      final rootfsUrl = AppConstants.getRootfsUrl(arch);
      final filesDir = await NativeBridge.getFilesDir();

      // Direct Dart fallback: ensure config dir + resolv.conf exist (#40).
      try {
        final configDir = '$filesDir/config';
        final resolvFile = File('$configDir/resolv.conf');
        if (!resolvFile.existsSync()) {
          Directory(configDir).createSync(recursive: true);
          resolvFile.writeAsStringSync('nameserver 8.8.8.8\nnameserver 8.8.4.4\n');
        }
      } catch (_) {}
      final tarPath = '$filesDir/tmp/ubuntu-rootfs.tar.gz';

      _updateSetupNotification('Downloading Ubuntu rootfs...', progress: 5);
      onProgress(const SetupState(
        step: SetupStep.downloadingRootfs,
        progress: 0.0,
        message: 'Downloading Ubuntu rootfs...',
      ));

      await _dio.download(
        rootfsUrl,
        tarPath,
        onReceiveProgress: (received, total) {
          if (total > 0) {
            final progress = received / total;
            final mb = (received / 1024 / 1024).toStringAsFixed(1);
            final totalMb = (total / 1024 / 1024).toStringAsFixed(1);
            // Map download to 5-30% of overall progress
            final notifProgress = 5 + (progress * 25).round();
            _updateSetupNotification('Downloading rootfs: $mb / $totalMb MB', progress: notifProgress);
            onProgress(SetupState(
              step: SetupStep.downloadingRootfs,
              progress: progress,
              message: 'Downloading: $mb MB / $totalMb MB',
            ));
          }
        },
      );

      // Step 2: Extract rootfs (30-45%)
      _updateSetupNotification('Extracting rootfs...', progress: 30);
      onProgress(const SetupState(
        step: SetupStep.extractingRootfs,
        progress: 0.0,
        message: 'Extracting rootfs (this takes a while)...',
      ));
      await NativeBridge.extractRootfs(tarPath);
      onProgress(const SetupState(
        step: SetupStep.extractingRootfs,
        progress: 1.0,
        message: 'Rootfs extracted',
      ));

      // Install bionic bypass + cwd-fix + node-wrapper BEFORE using node.
      // The wrapper patches process.cwd() which returns ENOSYS in proot.
      await NativeBridge.installBionicBypass();

      // Step 3: Install Node.js (45-80%)
      // Fix permissions inside proot (Java extraction may miss execute bits)
      _updateSetupNotification('Fixing rootfs permissions...', progress: 45);
      onProgress(const SetupState(
        step: SetupStep.installingNode,
        progress: 0.0,
        message: 'Fixing rootfs permissions...',
      ));
      // Blanket recursive chmod on all bin/lib directories.
      // Java tar extraction loses execute bits; dpkg needs tar, xz,
      // gzip, rm, mv, etc. — easier to fix everything than enumerate.
      await NativeBridge.runInProot(
        'chmod -R 755 /usr/bin /usr/sbin /bin /sbin '
        '/usr/local/bin /usr/local/sbin 2>/dev/null; '
        'chmod -R +x /usr/lib/apt/ /usr/lib/dpkg/ /usr/libexec/ '
        '/var/lib/dpkg/info/ /usr/share/debconf/ 2>/dev/null; '
        'chmod 755 /lib/*/ld-linux-*.so* /usr/lib/*/ld-linux-*.so* 2>/dev/null; '
        'mkdir -p /var/lib/dpkg/updates /var/lib/dpkg/triggers; '
        'echo permissions_fixed',
      );

      // --- Install base packages via apt-get (like Termux proot-distro) ---
      // Now that our proot matches Termux exactly (env -i, clean host env,
      // proper flags), dpkg works normally. No need for Java-side deb
      // extraction — let dpkg+tar handle it inside proot like Termux does.
      _updateSetupNotification('Updating package lists...', progress: 48);
      onProgress(const SetupState(
        step: SetupStep.installingNode,
        progress: 0.1,
        message: 'Updating package lists...',
      ));
      await NativeBridge.runInProot('apt-get update -y');

      _updateSetupNotification('Installing base packages...', progress: 52);
      onProgress(const SetupState(
        step: SetupStep.installingNode,
        progress: 0.15,
        message: 'Installing base packages...',
      ));
      // ca-certificates: HTTPS for npm/git
      // git: openclaw has git deps (@whiskeysockets/libsignal-node)
      // python3, make, g++: node-gyp needs these to compile native addons
      //   (npm's bundled node-gyp runs as a JS module, not a spawned process,
      //    so proot-compat.js spawn mock can't intercept it)
      // dpkg extracts via tar inside proot — permissions are correct.
      // Post-install scripts (update-ca-certificates) run automatically.
      // Pre-configure tzdata to avoid interactive continent/timezone prompt
      // (tzdata is a dependency of python3 and ignores DEBIAN_FRONTEND on
      // first install if no timezone is pre-set).
      await NativeBridge.runInProot(
        'ln -sf /usr/share/zoneinfo/Etc/UTC /etc/localtime && '
        'echo "Etc/UTC" > /etc/timezone',
      );
      await NativeBridge.runInProot(
        'apt-get install -y --no-install-recommends '
        'ca-certificates git python3 make g++',
      );

      // --- Install OpenFang binary (replaces Node.js + OpenClaw) ---
      // Step 4: Install OpenFang
      _updateSetupNotification('Installing OpenFang...', progress: 82);
      onProgress(const SetupState(
        step: SetupStep.installingOpenClaw,
        progress: 0.0,
        message: 'Installing OpenFang binary...',
      ));

      // Download OpenFang binary directly
      final openfangTarget = _getOpenFangTarget(arch);
      final openfangUrl = 'https://github.com/RightNow-AI/openfang/releases/latest/download/openfang-$openfangTarget.tar.gz';
      final openfangPath = '$filesDir/tmp/openfang.tar.gz';

      await _dio.download(
        openfangUrl,
        openfangPath,
        onReceiveProgress: (received, total) {
          if (total > 0) {
            final progress = received / total;
            final notifProgress = 82 + (progress * 10).round();
            _updateSetupNotification('Downloading OpenFang...', progress: notifProgress);
            onProgress(SetupState(
              step: SetupStep.installingOpenClaw,
              progress: progress * 0.5,
              message: 'Downloading OpenFang...',
            ));
          }
        },
      );

      _updateSetupNotification('Extracting OpenFang...', progress: 92);
      onProgress(const SetupState(
        step: SetupStep.installingOpenClaw,
        progress: 0.7,
        message: 'Extracting OpenFang...',
      ));

      // Extract and install OpenFang
      await NativeBridge.runInProot(
        'cd /tmp && tar -xzf $openfangPath && '
        'mkdir -p /root/.openfang/bin && '
        'cp openfang /root/.openfang/bin/ && '
        'chmod +x /root/.openfang/bin/openfang && '
        'rm -f /tmp/openfang*',
      );

      // Add to PATH
      await NativeBridge.runInProot(
        'echo \'export PATH="/root/.openfang/bin:\$PATH"\' >> /root/.bashrc',
      );

      _updateSetupNotification('Verifying OpenFang...', progress: 96);
      onProgress(const SetupState(
        step: SetupStep.installingOpenClaw,
        progress: 0.9,
        message: 'Verifying OpenFang...',
      ));

      await NativeBridge.runInProot('/root/.openfang/bin/openfang --version');

      onProgress(const SetupState(
        step: SetupStep.installingOpenClaw,
        progress: 1.0,
        message: 'OpenFang installed',
      ));

      // Step 5: Bionic Bypass already installed (before node verification)
      _updateSetupNotification('Setup complete!', progress: 100);
      onProgress(const SetupState(
        step: SetupStep.configuringBypass,
        progress: 1.0,
        message: 'Bionic Bypass configured',
      ));

      // Done
      _stopSetupService();
      onProgress(const SetupState(
        step: SetupStep.complete,
        progress: 1.0,
        message: 'Setup complete! Ready to start the gateway.',
      ));
    } on DioException catch (e) {
      _stopSetupService();
      onProgress(SetupState(
        step: SetupStep.error,
        error: 'Download failed: ${e.message}. Check your internet connection.',
      ));
    } catch (e) {
      _stopSetupService();
      onProgress(SetupState(
        step: SetupStep.error,
        error: 'Setup failed: $e',
      ));
    }
  }
}
