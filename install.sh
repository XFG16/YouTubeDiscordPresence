#!/bin/bash

set -e

echo "If the message at the end reads \"Installation successful\", then you are good to go.
If even a single error is thrown after this statement unless otherwise indicated, 
this application will not work and there may be something wrong with the directories of your computer.
"

if ! command -v g++ &> /dev/null
then
echo "GNU G++ Compiler (REQUIRED) is not installed. To install command line tools, run \"xcode-select --install\" in a terminal."
exit
fi
if ! command -v make &> /dev/null
then
echo "GNU Make (REQUIRED) is not installed. To install command line tools, run \"xcode-select --install\" in a terminal."
exit
fi

cd Host
make main
cd ..
echo "    ^^not an error"

user=$(id -un)
cpath=$(pwd)

if [ -d "/Users/${user}/Library/Application Support/YouTubeDiscordPresence" -a "${cpath}" != "/Users/${user}/Library/Application Support/YouTubeDiscordPresence" ]
then
rm -r /Users/${user}/Library/Application\ Support/YouTubeDiscordPresence
echo "Old installation removed.
    ^^not an error"
fi

if [ ! -d "/Users/${user}/Library/Application Support/YouTubeDiscordPresence" ]
then
cp -R ${cpath}/Host /Users/${user}/Library/Application\ Support/
mv /Users/${user}/Library/Application\ Support/Host /Users/${user}/Library/Application\ Support/YouTubeDiscordPresence
echo "New installation completed.
    ^^not an error"
else
echo "Installation already exists.
    ^^not an error"
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

echo "Native messaging host manifest file updated.
    ^^not an error
"

echo "Installation successful."