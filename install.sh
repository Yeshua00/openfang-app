#!/bin/bash
#
# OpenFang Dashboard Installer
# Installs OpenFang Rust binary and dashboard
#

set -e

REPO="RightNow-AI/openfang"
INSTALL_DIR="$HOME/.openfang"
BIN_DIR="$HOME/.openfang/bin"
DASHBOARD_DIR="$HOME/.openfang/dashboard"
BINARY="openfang"

main() {
  need_cmd curl
  need_cmd tar
  need_cmd uname

  _os="$(uname -s)"
  _arch="$(uname -m)"

  case "$_os" in
    Linux)
      case "$_arch" in
        x86_64|amd64)  _target="x86_64-unknown-linux-gnu" ;;
        aarch64|arm64) _target="aarch64-unknown-linux-gnu" ;;
        *)             err "Unsupported architecture: $_arch" ;;
      esac
      ;;
    Darwin)
      case "$_arch" in
        x86_64|amd64)  _target="x86_64-apple-darwin" ;;
        aarch64|arm64) _target="aarch64-apple-darwin" ;;
        *)             err "Unsupported architecture: $_arch" ;;
      esac
      ;;
    *)
      err "Unsupported OS: $_os"
      ;;
  esac

  say "Detected: $_os $_arch -> $_target"

  # Install OpenFang binary
  install_binary "$_target"

  # Install dashboard
  install_dashboard

  # Add to PATH
  add_to_path

  say ""
  say "OpenFang installed successfully!"
  say ""
  say "  Run: openfang init"
  say "  Dashboard: http://localhost:4200"
  say "  Docs: https://openfang.sh/docs"
  say ""
}

install_binary() {
  _target="$1"
  _url="https://github.com/${REPO}/releases/latest/download/openfang-${_target}.tar.gz"

  say "Downloading OpenFang from: $_url"

  _tmpdir="$(mktemp -d 2>/dev/null || mktemp -d -t openfang)"
  trap 'rm -rf "$_tmpdir"' EXIT

  _code=$(curl -fsSL -w "%{http_code}" "$_url" -o "${_tmpdir}/openfang.tar.gz") || true
  if [ "$_code" = "404" ]; then
    err "Release not found for ${_target}. Check https://github.com/${REPO}/releases"
  fi

  say "Extracting..."
  tar -xzf "${_tmpdir}/openfang.tar.gz" -C "$_tmpdir"

  _bin="$(find "$_tmpdir" -name "$BINARY" -type f -perm +111 2>/dev/null | head -1)"
  if [ -z "$_bin" ]; then
    _bin="$(find "$_tmpdir" -name "$BINARY" -type f | head -1)"
  fi
  if [ -z "$_bin" ]; then
    err "Could not find openfang binary in archive"
  fi

  mkdir -p "$BIN_DIR"
  cp "$_bin" "${BIN_DIR}/${BINARY}"
  chmod +x "${BIN_DIR}/${BINARY}"

  if "${BIN_DIR}/${BINARY}" --version >/dev/null 2>&1; then
    _ver=$("${BIN_DIR}/${BINARY}" --version 2>/dev/null || echo "unknown")
    say "Installed: $_ver"
  else
    say "Installed to: ${BIN_DIR}/${BINARY}"
  fi
}

install_dashboard() {
  say "Installing dashboard dependencies..."
  
  # Check if npm/node available for dashboard
  if command -v npm >/dev/null 2>&1; then
    DASHBOARD_SOURCE="$(cd "$(dirname "$0")/dashboard" 2>/dev/null || echo "")"
    
    if [ -n "$DASHBOARD_SOURCE" ] && [ -f "$DASHBOARD_SOURCE/package.json" ]; then
      mkdir -p "$DASHBOARD_DIR"
      cp -r "$DASHBOARD_SOURCE/." "$DASHBOARD_DIR/"
      cd "$DASHBOARD_DIR"
      npm install --production 2>/dev/null || true
      say "Dashboard installed to: $DASHBOARD_DIR"
    fi
  else
    say "Note: npm not found. Dashboard will use pre-built files."
    DASHBOARD_SOURCE="$(cd "$(dirname "$0")/dashboard/dist" 2>/dev/null || echo "")"
    if [ -n "$DASHBOARD_SOURCE" ] && [ -f "$DASHBOARD_SOURCE/index.html" ]; then
      mkdir -p "$DASHBOARD_DIR"
      cp -r "$DASHBOARD_SOURCE/." "$DASHBOARD_DIR/"
      say "Dashboard installed to: $DASHBOARD_DIR"
    fi
  fi
}

add_to_path() {
  case ":$PATH:" in
    *":${BIN_DIR}:"*) return ;;
  esac

  _line="export PATH="${BIN_DIR}:\$PATH""

  if [ -n "${SHELL:-}" ]; then
    case "$SHELL" in
      */zsh)  _profile="$HOME/.zshrc" ;;
      */bash)
        if [ -f "$HOME/.bashrc" ]; then
          _profile="$HOME/.bashrc"
        else
          _profile="$HOME/.bash_profile"
        fi ;;
      *)      _profile="$HOME/.profile" ;;
    esac
  else
    _profile="$HOME/.profile"
  fi

  if [ -n "$_profile" ] && [ -f "$_profile" ]; then
    if ! grep -q "/.openfang/bin" "$_profile" 2>/dev/null; then
      printf "\n# OpenFang\n%s\n" "$_line" >> "$_profile"
      say "Added to PATH via $_profile"
    fi
  fi
}

say() {
  printf "  \033[1;36mopenfang\033[0m %s\n" "$1"
}

err() {
  printf "  \033[1;36mopenfang\033[0m \033[1;31merror:\033[0m %s\n" "$1" >&2
  exit 1
}

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "need '$1' (command not found)"
  fi
}

main
