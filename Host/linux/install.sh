#!/usr/bin/env bash
# Installs the YouTubeDiscordPresence desktop component for the current user on Linux (x64).
# No root is needed: the binary goes into ~/.local/share/YouTubeDiscordPresence and a native messaging
# manifest is registered with every supported browser that has a profile on this account.
#
# Usage (from the extracted release folder):
#   ./install.sh              install or update
#   ./install.sh --uninstall  remove the desktop component and its browser registrations
set -euo pipefail

HOST_NAME="com.ytdp.discord.presence"
BINARY_NAME="YTDPlinux-x64"
CHROME_EXTENSION_ORIGIN="chrome-extension://hnmeidgkfcbpjjjpmjmpehjdljlaeaaa/"
FIREFOX_EXTENSION_ID="@youtubediscordpresence"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
INSTALL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/YouTubeDiscordPresence"
BINARY_PATH="$INSTALL_DIR/$BINARY_NAME"

# Browser profile directory -> where that browser looks for per-user native messaging manifests
CHROMIUM_BROWSERS=(
    "$CONFIG_HOME/google-chrome"
    "$CONFIG_HOME/google-chrome-beta"
    "$CONFIG_HOME/google-chrome-unstable"
    "$CONFIG_HOME/chromium"
    "$CONFIG_HOME/BraveSoftware/Brave-Browser"
    "$CONFIG_HOME/BraveSoftware/Brave-Browser-Beta"
    "$CONFIG_HOME/BraveSoftware/Brave-Browser-Nightly"
    "$CONFIG_HOME/microsoft-edge"
    "$CONFIG_HOME/microsoft-edge-beta"
    "$CONFIG_HOME/microsoft-edge-dev"
    "$CONFIG_HOME/vivaldi"
    "$CONFIG_HOME/vivaldi-snapshot"
    "$CONFIG_HOME/thorium"
)
# Firefox 147+ keeps new profiles in ~/.config/mozilla, but still only reads manifests from ~/.mozilla/native-messaging-hosts
FIREFOX_BROWSERS=(
    "$HOME/.mozilla:$HOME/.mozilla/native-messaging-hosts"
    "$CONFIG_HOME/mozilla:$HOME/.mozilla/native-messaging-hosts"
    "$HOME/.librewolf:$HOME/.librewolf/native-messaging-hosts"
)

write_manifest() { # <manifest dir> <"allowed_origins" or "allowed_extensions"> <allowed id>
    mkdir -p "$1"
    cat > "$1/$HOST_NAME.json" << EOF
{
    "name": "$HOST_NAME",
    "description": "Component of the YouTubeDiscordPresence extension that allows the usage of native messaging.",
    "path": "$BINARY_PATH",
    "type": "stdio",
    "$2": [
        "$3"
    ]
}
EOF
    chmod 644 "$1/$HOST_NAME.json"
    echo "  registered: $1/$HOST_NAME.json"
}

remove_manifest() { # <manifest dir>
    if [ -f "$1/$HOST_NAME.json" ]; then
        rm -f "$1/$HOST_NAME.json"
        echo "  removed: $1/$HOST_NAME.json"
    fi
}

uninstall() {
    echo "Uninstalling YouTubeDiscordPresence..."
    local profile_dir entry
    for profile_dir in "${CHROMIUM_BROWSERS[@]}"; do
        remove_manifest "$profile_dir/NativeMessagingHosts"
    done
    for entry in "${FIREFOX_BROWSERS[@]}"; do
        remove_manifest "${entry#*:}"
    done
    rm -rf "$INSTALL_DIR"
    echo "  removed: $INSTALL_DIR"
    echo "Done."
}

install() {
    if [ "$EUID" -eq 0 ]; then
        echo "Error: run this script as your normal user (without sudo); it installs for the current user only." >&2
        exit 1
    fi
    if [ "$(uname -s)" != "Linux" ] || [ "$(uname -m)" != "x86_64" ]; then
        echo "Error: this build of YouTubeDiscordPresence only runs on Linux (x64)." >&2
        exit 1
    fi
    if [ ! -f "$SCRIPT_DIR/$BINARY_NAME" ]; then
        echo "Error: $BINARY_NAME was not found next to this script." >&2
        exit 1
    fi

    echo "Installing YouTubeDiscordPresence..."
    mkdir -p "$INSTALL_DIR"
    # Copy then rename so a running copy (started by an open browser) is replaced instead of overwritten in place
    cp "$SCRIPT_DIR/$BINARY_NAME" "$BINARY_PATH.new"
    chmod 755 "$BINARY_PATH.new"
    mv -f "$BINARY_PATH.new" "$BINARY_PATH"
    echo "  installed: $BINARY_PATH"

    local -A registered=()
    local profile_dir entry
    for profile_dir in "${CHROMIUM_BROWSERS[@]}"; do
        if [ -d "$profile_dir" ]; then
            write_manifest "$profile_dir/NativeMessagingHosts" "allowed_origins" "$CHROME_EXTENSION_ORIGIN"
            registered["$profile_dir/NativeMessagingHosts"]=1
        fi
    done
    for entry in "${FIREFOX_BROWSERS[@]}"; do
        if [ -d "${entry%%:*}" ] && [ -z "${registered["${entry#*:}"]:-}" ]; then
            write_manifest "${entry#*:}" "allowed_extensions" "$FIREFOX_EXTENSION_ID"
            registered["${entry#*:}"]=1
        fi
    done

    if [ "${#registered[@]}" -eq 0 ]; then
        echo "Warning: no supported browser profile was found. Open your browser once, then run this script again." >&2
        exit 1
    fi
    echo "Done. Restart your browser to finish setting up YouTubeDiscordPresence."
}

case "${1:-}" in
    "") install ;;
    --uninstall) uninstall ;;
    *)
        echo "Usage: $0 [--uninstall]" >&2
        exit 1
        ;;
esac
