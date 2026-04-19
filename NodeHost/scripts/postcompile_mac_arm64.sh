#!/usr/bin/env bash
# Builds a macOS .pkg installer for YouTubeDiscordPresence (arm64).
# Requires: macOS, Node.js, npm (for pkg), and Xcode Command Line Tools (pkgbuild).
#
# Usage (from inside NodeHost/):
#   npm run build-installer:mac
#
# Output: src/YouTubeDiscordPresence-mac-arm64-<version>.pkg
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODEHOST_DIR="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$NODEHOST_DIR/src"
BINARY_SRC="$SRC_DIR/YTDPmac-arm64"

# ── 1. Compile arm64 binary if not already built ─────────────────────────────
if [ ! -f "$BINARY_SRC" ]; then
    echo "Binary not found — compiling arm64 binary..."
    cd "$NODEHOST_DIR"
    node scripts/precompile.js
    npx pkg -t node18-macos-arm64 . -o "$BINARY_SRC"
    echo ""
fi

VERSION=$(node -e "console.log(require('$NODEHOST_DIR/package.json').version)")

echo "YouTubeDiscordPresence — macOS .pkg builder"
echo "============================================"
echo "Version : $VERSION"
echo "Binary  : $BINARY_SRC"
echo ""

# ── 2. Prepare staging directories ───────────────────────────────────────────
BUILD_DIR="$NODEHOST_DIR/.build_mac"
PAYLOAD_DIR="$BUILD_DIR/payload"
SCRIPTS_DIR="$BUILD_DIR/scripts"

# Fixed install paths (system-wide, requires admin — same as Windows MSI)
INSTALL_RELATIVE="Library/Application Support/YouTubeDiscordPresence"
INSTALL_ABS="/$INSTALL_RELATIVE"
BINARY_DEST="$INSTALL_ABS/YTDPmac"

rm -rf "$BUILD_DIR"
mkdir -p "$PAYLOAD_DIR/$INSTALL_RELATIVE"
mkdir -p "$SCRIPTS_DIR"

# ── 3. Stage binary ───────────────────────────────────────────────────────────
cp "$BINARY_SRC" "$PAYLOAD_DIR/$INSTALL_RELATIVE/YTDPmac"
chmod +x "$PAYLOAD_DIR/$INSTALL_RELATIVE/YTDPmac"

# ── 4. Write postinstall script ───────────────────────────────────────────────
# This runs as root after the pkg installs the files, registering the native
# messaging host manifest for Chrome and any other detected Chromium browsers.
cat > "$SCRIPTS_DIR/postinstall" << 'POSTINSTALL_EOF'
#!/usr/bin/env bash
set -e

BINARY_PATH="/Library/Application Support/YouTubeDiscordPresence/YTDPmac"
MANIFEST_NAME="com.ytdp.discord.presence.json"

# Ensure the binary is executable and not quarantined
chmod +x "$BINARY_PATH"
xattr -d com.apple.quarantine "$BINARY_PATH" 2>/dev/null || true

# Native messaging host manifest content (path is hardcoded to the install location)
MANIFEST_CONTENT='{
    "name": "com.ytdp.discord.presence",
    "description": "Component of the YouTubeDiscordPresence extension that allows the usage of native messaging.",
    "path": "/Library/Application Support/YouTubeDiscordPresence/YTDPmac",
    "type": "stdio",
    "allowed_origins": [
        "chrome-extension://hnmeidgkfcbpjjjpmjmpehjdljlaeaaa/"
    ]
}'

# System-wide manifest locations for each supported browser
for NMH_DIR in \
    "/Library/Google/Chrome/NativeMessagingHosts" \
    "/Library/Application Support/Chromium/NativeMessagingHosts" \
    "/Library/BraveSoftware/Brave-Browser/NativeMessagingHosts" \
    "/Library/Microsoft/Edge/NativeMessagingHosts"
do
    mkdir -p "$NMH_DIR"
    printf '%s\n' "$MANIFEST_CONTENT" > "$NMH_DIR/$MANIFEST_NAME"
done

exit 0
POSTINSTALL_EOF

chmod +x "$SCRIPTS_DIR/postinstall"

# ── 5. Build the .pkg ─────────────────────────────────────────────────────────
OUTPUT="$SRC_DIR/YouTubeDiscordPresence-mac-arm64-${VERSION}.pkg"

pkgbuild \
    --root "$PAYLOAD_DIR" \
    --scripts "$SCRIPTS_DIR" \
    --identifier "com.ytdp.discord.presence" \
    --version "$VERSION" \
    --install-location "/" \
    "$OUTPUT"

# ── 6. Clean up staging area ──────────────────────────────────────────────────
rm -rf "$BUILD_DIR"

echo ""
echo "Installer created:"
echo "  $OUTPUT"
echo ""
echo "Users double-click the .pkg and follow the macOS installer wizard."
echo "Chrome/Brave/Edge/Chromium native messaging hosts are registered system-wide."
echo ""
echo "Note: the binary is unsigned. If Gatekeeper blocks the pkg, right-click it"
echo "and choose Open, or run: sudo spctl --master-disable (re-enable after install)."
