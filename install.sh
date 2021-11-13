#!/bin/bash

echo "If even a single error is thrown, this application will not work and there is something wrong with the directories of your computer."

user=$(id -un)
cpath=$(pwd)

if [ -d "/Users/${user}/Library/Application Support/YouTubeDiscordPresence" -a "${cpath}" != "/Users/${user}/Library/Application Support/YouTubeDiscordPresence" ]
then
    rm -r /Users/${user}/Library/Application\ Support/YouTubeDiscordPresence
    echo "Old installation removed."
fi

if [ ! -d "/Users/${user}/Library/Application Support/YouTubeDiscordPresence" ]
then
    cp -R $cpath/Host /Users/${user}/Library/Application\ Support/
    mv /Users/${user}/Library/Application\ Support/Host /Users/${user}/Library/Application\ Support/YouTubeDiscordPresence
    echo "New installation completed."
else
    echo "Installation already exists (this is not an error)."
fi

cd ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts

echo "{
    \"name\": \"com.ytdp.discord.presence\",
    \"description\": \"Component of the YouTube Discord Presence extension that allows the usage of native messaging.\",
    \"path\": \"/Users/${user}/Library/Application Support/YouTubeDiscordPresence/main\",
    \"type\": \"stdio\",
    \"allowed_origins\": [
        \"chrome-extension://goaakjjblbjlmdiapmbcolnlgilhblio/\"
    ]
}" > com.ytdp.discord.presence.json

echo "Native messaging host manifest file updated."