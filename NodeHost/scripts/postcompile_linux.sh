#!/usr/bin/env bash
# Bundles the Linux (x64) binary and its installer into a release archive for YouTubeDiscordPresence.
#
# Usage (from inside NodeHost/):
#   npm run compile:linux-x64
#
# Output: src/YouTubeDiscordPresence-linux-x64-<version>.tar.gz
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODEHOST_DIR="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$NODEHOST_DIR/src"
BINARY_SRC="$SRC_DIR/YTDPlinux-x64"
INSTALLER_SRC="$NODEHOST_DIR/../Host/linux/install.sh"

if [ ! -f "$BINARY_SRC" ]; then
    echo "Error: Binary not found at $BINARY_SRC" >&2
    echo "Please run the compile step first (handled by npm run compile:linux-x64)" >&2
    exit 1
fi

# We use the package.json version here (instead of version.json, which is used for Windows) for *.*.*-style versioning
VERSION=$(node -p "require('$NODEHOST_DIR/package.json').version")
PACKAGE_NAME="YouTubeDiscordPresence-linux-x64-${VERSION}"
OUTPUT="$SRC_DIR/$PACKAGE_NAME.tar.gz"

BUILD_DIR="$NODEHOST_DIR/.build_linux"
trap 'rm -rf "$BUILD_DIR"' EXIT
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/$PACKAGE_NAME"

install -m 755 "$BINARY_SRC" "$BUILD_DIR/$PACKAGE_NAME/YTDPlinux-x64"
install -m 755 "$INSTALLER_SRC" "$BUILD_DIR/$PACKAGE_NAME/install.sh"

tar -czf "$OUTPUT" -C "$BUILD_DIR" --owner=0 --group=0 "$PACKAGE_NAME"

echo "Archive created successfully:"
echo "  $OUTPUT"
