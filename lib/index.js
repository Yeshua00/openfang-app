#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const VERSION = '1.0.0';
const HOME = process.env.HOME || '/data/data/com.termux/files/home';
const OPENFANG_DIR = path.join(HOME, '.openfang');
const BIN_DIR = path.join(OPENFANG_DIR, 'bin');
const PROOT_ROOTFS = '/data/data/com.termux/files/usr/var/lib/proot-distro/installed-rootfs';
const PROOT_UBUNTU_ROOT = path.join(PROOT_ROOTFS, 'ubuntu', 'root');

function printBanner() {
  console.log(`
╔═══════════════════════════════════════════╗
║     OpenFang Termux v${VERSION}                  ║
║     AI Gateway for Android                 ║
╚═══════════════════════════════════════════╝
  Based on OpenClaw - Created by Mithun Gowda
  OpenFang by RightNow AI | Dashboard by Yeshua
`);
}

function printHelp() {
  console.log(`
Usage: openfangx <command> [args...]

Commands:
  setup       Full installation (proot + Ubuntu + OpenFang)
  init        Initialize OpenFang configuration
  start       Start OpenFang gateway
  stop        Stop OpenFang gateway
  status      Check installation status
  dashboard   Start dashboard (localhost:4200)
  shell       Open Ubuntu shell
  help        Show this help message

Examples:
  openfangx setup             # First-time setup
  openfangx start             # Start gateway
  openfangx dashboard        # Start dashboard
`);
}

function getInstallStatus() {
  let hasProot = false;
  try {
    execSync('command -v proot-distro', { stdio: 'pipe' });
    hasProot = true;
  } catch {}

  let hasUbuntu = false;
  try {
    hasUbuntu = fs.existsSync(path.join(PROOT_ROOTFS, 'ubuntu'));
  } catch {}

  let hasOpenFang = false;
  try {
    const binPath = path.join(PROOT_UBUNTU_ROOT, '.openfang', 'bin', 'openfang');
    hasOpenFang = fs.existsSync(binPath);
  } catch {}

  return { proot: hasProot, ubuntu: hasUbuntu, openfang: hasOpenFang };
}

function installProot() {
  console.log('[1/4] Installing proot-distro...');
  try {
    execSync('pkg update -y', { stdio: 'inherit' });
    execSync('pkg install -y proot-distro', { stdio: 'inherit' });
    console.log('  ✓ proot-distro installed');
    return true;
  } catch (err) {
    console.error('  ✗ Failed:', err.message);
    return false;
  }
}

function installUbuntu() {
  console.log('[2/4] Installing Ubuntu in proot...');
  try {
    execSync('proot-distro install ubuntu', { stdio: 'inherit' });
    console.log('  ✓ Ubuntu installed');
    return true;
  } catch (err) {
    console.error('  ✗ Failed:', err.message);
    return false;
  }
}

function installOpenFangBinary() {
  console.log('[3/4] Installing OpenFang binary...');
  
  const tmpdir = '/tmp/openfang-install';
  try { fs.rmSync(tmpdir, { recursive: true }); } catch {}
  fs.mkdirSync(tmpdir, { recursive: true });

  const arch = execSync('uname -m', { encoding: 'utf8' }).trim();
  let target;
  
  if (arch === 'aarch64' || arch === 'arm64') {
    target = 'aarch64-unknown-linux-gnu';
  } else if (arch === 'x86_64' || arch === 'amd64') {
    target = 'x86_64-unknown-linux-gnu';
  } else {
    console.error('  ✗ Unsupported architecture:', arch);
    return false;
  }

  const url = `https://github.com/RightNow-AI/openfang/releases/latest/download/openfang-${target}.tar.gz`;
  
  try {
    console.log('  Downloading from:', url);
    execSync(`curl -fsSL "${url}" -o ${tmpdir}/openfang.tar.gz`, { stdio: 'inherit' });
    execSync(`tar -xzf ${tmpdir}/openfang.tar.gz -C ${tmpdir}`, { stdio: 'inherit' });
    
    const binPath = path.join(PROOT_UBUNTU_ROOT, '.openfang', 'bin');
    fs.mkdirSync(binPath, { recursive: true });
    
    const bin = execSync(`find ${tmpdir} -name openfang -type f`, { encoding: 'utf8' }).trim();
    fs.copyFileSync(bin, path.join(binPath, 'openfang'));
    fs.chmodSync(path.join(binPath, 'openfang'), '755');
    
    console.log('  ✓ OpenFang binary installed');
    return true;
  } catch (err) {
    console.error('  ✗ Failed:', err.message);
    return false;
  }
}

function configureOpenFang() {
  console.log('[4/4] Configuring OpenFang...');
  
  const bashrcPath = path.join(PROOT_UBUNTU_ROOT, '.bashrc');
  const openfangPath = path.join(PROOT_UBUNTU_ROOT, '.openfang', 'bin');
  
  let bashrc = '';
  try { bashrc = fs.readFileSync(bashrcPath, 'utf8'); } catch {}
  
  const pathExport = `export PATH="${openfangPath}:\$PATH"`;
  if (!bashrc.includes('.openfang/bin')) {
    fs.appendFileSync(bashrcPath, `\n# OpenFang\n${pathExport}\n`);
  }
  
  console.log('  ✓ OpenFang configured');
  return true;
}

async function runSetup() {
  console.log('Starting OpenFang setup for Termux...\n');
  console.log('This will install: proot-distro → Ubuntu → OpenFang\n');

  const status = getInstallStatus();

  if (!status.proot) {
    installProot();
  } else {
    console.log('[1/4] proot-distro: ✓ already installed');
  }

  if (!status.ubuntu) {
    installUbuntu();
  } else {
    console.log('[2/4] Ubuntu: ✓ already installed');
  }

  if (!status.openfang) {
    installOpenFangBinary();
  } else {
    console.log('[3/4] OpenFang: ✓ already installed');
  }

  configureOpenFang();

  console.log('\n═══════════════════════════════════════════');
  console.log('Setup complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Initialize: openfangx init');
  console.log('  2. Start:     openfangx start');
  console.log('  3. Dashboard: openfangx dashboard');
  console.log('');
  console.log('Dashboard: http://localhost:4200');
  console.log('═══════════════════════════════════════════');
}

function showStatus() {
  const status = getInstallStatus();

  console.log('Installation Status:\n');
  console.log('Termux:');
  console.log(`  proot-distro: ${status.proot ? '✓ installed' : '✗ missing'}`);
  console.log(`  Ubuntu:       ${status.ubuntu ? '✓ installed' : '✗ not installed'}`);
  console.log('');

  if (status.ubuntu) {
    console.log('OpenFang:');
    console.log(`  Binary:       ${status.openfang ? '✓ installed' : '✗ not installed'}`);
    console.log('');
  }

  if (status.proot && status.ubuntu && status.openfang) {
    console.log('Status: ✓ Ready to run!');
    console.log('');
    console.log('Commands:');
    console.log('  openfangx start       # Start gateway');
    console.log('  openfangx init        # Initialize config');
    console.log('  openfangx dashboard   # Start dashboard');
  } else {
    console.log('Status: ✗ Setup incomplete');
    console.log('Run: openfangx setup');
  }
}

function startOpenFang() {
  const status = getInstallStatus();

  if (!status.proot || !status.ubuntu) {
    console.error('proot/Ubuntu not installed. Run: openfangx setup');
    process.exit(1);
  }

  if (!status.openfang) {
    console.error('OpenFang not installed. Run: openfangx setup');
    process.exit(1);
  }

  console.log('Starting OpenFang gateway...\n');

  const proc = spawn('proot-distro', ['login', 'ubuntu', '--', 'bash', '-c', 'cd /root && .openfang/bin/openfang start'], {
    stdio: 'inherit'
  });

  proc.on('error', (err) => {
    console.error('Failed to start:', err.message);
  });
}

function initOpenFang() {
  const status = getInstallStatus();

  if (!status.openfang) {
    console.error('OpenFang not installed. Run: openfangx setup');
    process.exit(1);
  }

  console.log('Initializing OpenFang...\n');

  const proc = spawn('proot-distro', ['login', 'ubuntu', '--', 'bash', '-c', '.openfang/bin/openfang init'], {
    stdio: 'inherit'
  });

  proc.on('error', (err) => {
    console.error('Failed to initialize:', err.message);
  });
}

function startDashboard() {
  console.log('Starting OpenFang Dashboard on http://localhost:4200\n');
  
  const dashboardDir = path.join(HOME, '.openfang', 'dashboard');
  
  if (!fs.existsSync(dashboardDir)) {
    console.log('Dashboard not found. Installing...');
    
    const srcDir = path.join(SCRIPT_DIR, 'dashboard');
    if (fs.existsSync(path.join(srcDir, 'package.json'))) {
      fs.mkdirSync(dashboardDir, { recursive: true });
      execSync(`cp -r ${srcDir}/* ${dashboardDir}/`, { stdio: 'inherit' });
    } else if (fs.existsSync(path.join(srcDir, 'dist'))) {
      fs.mkdirSync(dashboardDir, { recursive: true });
      execSync(`cp -r ${srcDir}/dist/* ${dashboardDir}/`, { stdio: 'inherit' });
    }
  }

  const proc = spawn('npm', ['run', 'dev'], {
    cwd: dashboardDir,
    stdio: 'inherit'
  });

  proc.on('error', (err) => {
    console.error('Failed to start dashboard:', err.message);
  });
}

function openShell() {
  const status = getInstallStatus();

  if (!status.proot || !status.ubuntu) {
    console.error('proot/Ubuntu not installed. Run: openfangx setup');
    process.exit(1);
  }

  console.log('Entering Ubuntu shell...\n');

  const shell = spawn('proot-distro', ['login', 'ubuntu'], {
    stdio: 'inherit'
  });

  shell.on('error', (err) => {
    console.error('Failed to open shell:', err.message);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  printBanner();

  switch (command) {
    case 'setup':
    case 'install':
      await runSetup();
      break;

    case 'status':
      showStatus();
      break;

    case 'start':
      startOpenFang();
      break;

    case 'init':
      initOpenFang();
      break;

    case 'dashboard':
    case 'ui':
      startDashboard();
      break;

    case 'shell':
    case 'ubuntu':
      openShell();
      break;

    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;

    default:
      console.log(`Unknown command: ${command}`);
      printHelp();
      break;
  }
}

main();
