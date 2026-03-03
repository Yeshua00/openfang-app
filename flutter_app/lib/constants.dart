class AppConstants {
  static const String appName = 'OpenFang';
  static const String version = '1.0.0';
  static const String packageName = 'com.openfang.termux';

  static final ansiEscape = RegExp(r'\x1b\[[0-9;]*[a-zA-Z]');

  static const String authorName = 'OpenFang Team';
  static const String authorEmail = 'team@openfang.sh';
  static const String githubUrl = 'https://github.com/RightNow-AI/openfang';
  static const String license = 'MIT';

  static const String orgName = 'OpenFang';

  static const String gatewayHost = '127.0.0.1';
  static const int gatewayPort = 5555;
  static const String gatewayUrl = 'http://$gatewayHost:$gatewayPort';

  static const String ubuntuRootfsUrl =
      'https://cdimage.ubuntu.com/ubuntu-base/releases/24.04/release/ubuntu-base-24.04.3-base-';
  static const String rootfsArm64 = '${ubuntuRootfsUrl}arm64.tar.gz';
  static const String rootfsArmhf = '${ubuntuRootfsUrl}armhf.tar.gz';
  static const String rootfsAmd64 = '${ubuntuRootfsUrl}amd64.tar.gz';

  static const int healthCheckIntervalMs = 5000;
  static const int maxAutoRestarts = 3;

  static const String channelName = 'com.openfang.termux/native';
  static const String eventChannelName = 'com.openfang.termux/gateway_logs';

  static String getRootfsUrl(String arch) {
    switch (arch) {
      case 'aarch64':
        return rootfsArm64;
      case 'arm':
        return rootfsArmhf;
      case 'x86_64':
        return rootfsAmd64;
      default:
        return rootfsArm64;
    }
  }
}
