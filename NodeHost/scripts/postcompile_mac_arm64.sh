#!/usr/bin/env bash
# Builds a macOS .pkg installer for YouTubeDiscordPresence (arm64).
# Requires: macOS, Node.js, npm (for pkg), and Xcode Command Line Tools (pkgbuild).
#
# Usage (from inside NodeHost/):
#   npm run compile:mac-arm64
#
# Output: src/YouTubeDiscordPresence-mac-arm64-<version>.pkg
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODEHOST_DIR="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$NODEHOST_DIR/src"
BINARY_SRC="$SRC_DIR/YTDPmac-arm64"

# Cleanup trap to remove build directory on exit
BUILD_DIR="$NODEHOST_DIR/.build_mac"
trap 'rm -rf "$BUILD_DIR"' EXIT

# ── 1. Verify binary exists ──────────────────────────────────────────────────
if [ ! -f "$BINARY_SRC" ]; then
    echo "Error: Binary not found at $BINARY_SRC" >&2
    echo "Please run the compile step first (handled by npm run compile:mac-arm64)" >&2
    exit 1
fi

# We use the package.json version here (instead of version.json, which is used for Windows) for *.*.*-style versioning
VERSION=$(node -p "require('$NODEHOST_DIR/package.json').version")

echo "YouTubeDiscordPresence — macOS .pkg builder"
echo "============================================"
echo "Version : $VERSION"
echo "Binary  : $BINARY_SRC"
echo ""

# ── 2. Prepare staging directories ───────────────────────────────────────────
PAYLOAD_DIR="$BUILD_DIR/payload"
SCRIPTS_DIR="$BUILD_DIR/scripts"

# Fixed install paths (system-wide, requires admin)
INSTALL_RELATIVE="Library/Application Support/YouTubeDiscordPresence"

mkdir -p "$PAYLOAD_DIR/$INSTALL_RELATIVE"
mkdir -p "$SCRIPTS_DIR"

# ── 3. Stage binary ───────────────────────────────────────────────────────────
cp "$BINARY_SRC" "$PAYLOAD_DIR/$INSTALL_RELATIVE/YTDPmac-arm64"
chmod 755 "$PAYLOAD_DIR/$INSTALL_RELATIVE/YTDPmac-arm64"

# ── 4. Write postinstall script ───────────────────────────────────────────────
# This runs as root after the pkg installs the files, registering the native
# messaging host manifest for Chrome and other Chromium-based browsers.
cat > "$SCRIPTS_DIR/postinstall" << 'POSTINSTALL_EOF'
#!/bin/bash
set -euo pipefail

BINARY_PATH="/Library/Application Support/YouTubeDiscordPresence/YTDPmac-arm64"
MANIFEST_NAME="com.ytdp.discord.presence.json"

# Ensure the binary is executable and not quarantined
chmod 755 "$BINARY_PATH"
xattr -d com.apple.quarantine "$BINARY_PATH" 2>/dev/null || true

# Native messaging host manifest content
MANIFEST_CONTENT='{
    "name": "com.ytdp.discord.presence",
    "description": "Component of the YouTubeDiscordPresence extension that allows the usage of native messaging.",
    "path": "/Library/Application Support/YouTubeDiscordPresence/YTDPmac-arm64",
    "type": "stdio",
    "allowed_origins": [
        "chrome-extension://hnmeidgkfcbpjjjpmjmpehjdljlaeaaa/"
    ]
}'

# System-wide manifest locations for each supported browser
declare -a NMH_DIRS=(
    "/Library/Google/Chrome/NativeMessagingHosts"
    "/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts"
    "/Library/Application Support/Microsoft/Edge/NativeMessagingHosts"
)

for NMH_DIR in "${NMH_DIRS[@]}"; do
    mkdir -p "$NMH_DIR"
    printf '%s\n' "$MANIFEST_CONTENT" > "$NMH_DIR/$MANIFEST_NAME"
    chmod 644 "$NMH_DIR/$MANIFEST_NAME"
done

exit 0
POSTINSTALL_EOF

chmod 755 "$SCRIPTS_DIR/postinstall"

# ── 5. Build the .pkg ─────────────────────────────────────────────────────────
OUTPUT="$SRC_DIR/YouTubeDiscordPresence-mac-arm64-${VERSION}.pkg"

echo "Building package..."
pkgbuild \
    --root "$PAYLOAD_DIR" \
    --scripts "$SCRIPTS_DIR" \
    --identifier "com.ytdp.discord.presence" \
    --version "$VERSION" \
    --install-location "/" \
    "$OUTPUT"

# ── 6. Success message ────────────────────────────────────────────────────────
echo ""
echo "Installer created successfully:"
echo "  $OUTPUT"
echo ""