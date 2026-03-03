# OpenFang Termux

<p align="center">
  <img src="assets/logo.png" alt="OpenFang" width="200"/>
</p>

> Run **OpenFang AI Gateway** on Android/Termux — standalone Rust binary with web dashboard.

---

## What is OpenFang?

OpenFang is an open-source Agent Operating System built in Rust by [RightNow AI](https://github.com/RightNow-AI/openfang). It runs autonomous AI agents (called "Hands") that work on schedules, build knowledge graphs, and more.

This project provides a Termux wrapper to run OpenFang on Android devices without root.

## Credits

- **OpenFang** - Created by [RightNow AI](https://github.com/RightNow-AI/openfang) (Jaber)
- **Original Concept** - Based on [OpenClaw](https://github.com/anthropics/openclaw) by Anthropic
- **OpenClaw-Termux** - Created by [Mithun Gowda](https://github.com/mithun50)
- **Dashboard & Integration** - Built by **Yeshua**

---

## Features

- One-tap setup for Termux
- OpenFang Rust binary (no Node.js required)
- Web dashboard at `localhost:4200` (80% zoom)
- Runs in proot-distro (no root required)
- Full Ubuntu environment

---

## Quick Start

### Install

```bash
# Clone this repository
git clone https://github.com/YOUR_USERNAME/openfang-termux.git
cd openfang-termux

# Run setup
npm install
node bin/openfangx setup

# Or use the install script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/openfang-termux/main/install.sh | bash
```

### Commands

```bash
openfangx setup        # Full installation
openfangx init        # Initialize OpenFang config
openfangx start       # Start gateway
openfangx dashboard   # Start web dashboard
openfangx status      # Check status
openfangx shell       # Enter Ubuntu shell
```

---

## Dashboard

Access the dashboard at: **http://localhost:4200**

The dashboard provides:
- Gateway status
- Active hands/agents
- Start/stop controls
- API key configuration

---

## Requirements

| Requirement | Details |
|-------------|---------|
| Android | 10+ (API 29) |
| Termux | From F-Droid (NOT Play Store) |
| Storage | ~200MB |

---

## Architecture

```
┌─────────────────────────────────────┐
│         Termux (Android)            │
│  ┌─────────────────────────────┐   │
│  │    proot-distro             │   │
│  │    ┌───────────────────┐    │   │
│  │    │   Ubuntu          │    │   │
│  │    │   OpenFang Rust   │    │   │
│  │    │   Binary          │    │   │
│  │    └───────────────────┘    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Dashboard (localhost:4200)│  │
│  │   React + Vite (80% zoom)  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ♥ for the Android community<br>
  OpenFang by RightNow AI | Dashboard by Yeshua
</p>
