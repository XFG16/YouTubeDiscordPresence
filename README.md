<p align="center">
  <img width="100%" height="5" src="https://github.com/XFG16/YouTubeDiscordPresence/blob/YouTubeDiscordPresenceWin/Screenshots/ytdpScreenshot1.png?raw=true">
</p>
<p align="center">
  <img width="49%" height="auto" src="https://github.com/XFG16/YouTubeDiscordPresence/blob/YouTubeDiscordPresenceWin/Screenshots/ytdpScreenshot1.png?raw=true">
  <img width="49%" height="auto" src="https://github.com/XFG16/YouTubeDiscordPresence/blob/YouTubeDiscordPresenceWin/Screenshots/ytdpScreenshot2.png?raw=true">
</p>
<p align="center">
  <img width="100%" height="5" src="https://github.com/XFG16/YouTubeDiscordPresence/blob/YouTubeDiscordPresenceWin/Screenshots/ytdpScreenshot1.png?raw=true">
</p>

# Installation (no need to download additional libraries)
 1. Download the `YTDPsetup.msi` file in the [**<ins>releases section</ins>**](https://github.com/XFG16/YouTubeDiscordPresence/releases/tag/1.0) and run it on your computer
    - It's gonna say Windows **blocked an unknown app** because the publisher is unknown. Sorry, I'm broke and can't afford a digital certificate, at least for now. Just click more info and run anyway.
    - If you run this through VirusTotal, there are gonna be several **false positives**. Sorry, but my word is the only thing I can really offer here.
    - Otherwise, you can just **build** the whole thing yourself with **Visual Studio 2022**. Just open the `YTDPwin.sln` file under `Host/YTDPwin` and link the Discord Game SDK,  `main.cpp`, and `main.json`, and you should be set. See below for more details on linking the Discord Game SDK.
  2. Add the [<ins>**Chrome Extension**</ins>](https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa) from the **Chrome Web Store** and turn it on **after installing the desktop component.** If you installed the extension before installing the desktop component, just turn it **off and back on** after the desktop component is installed.
  3. You should be all set and ready to go! To turn this application **on or off**, just go to `chrome://extensions` and **toggle the switch** for the extension


# YouTubeDiscordPresence for Windows (x64)
## General Notes 
 - This is an extension used to create a **detailed rich presence** for YouTube videos and livestreams on Discord.
 - Currently, the application only runs on **Windows** that have a **64-bit** processor
 - Supports both **normal** and **livestream/premiere** videos on YouTube as well as **YouTube Music**
 - On a more **technical note**, it works similar to the **Spotify rich presence**—it only appears **when a video is playing** and **disappears when there is no video or the video is paused**. In addition, it only displays the presence for videos. Idling and searching are **not displayed**.
 - There are **two** components:
   - Chrome Extension ( Source code: `Extension` | Release: [<ins>**Chrome Web Store**</ins>](https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa) )
   - Desktop Application ( Source code: `Host` | Release: [**<ins>Releases</ins>**](https://github.com/XFG16/YouTubeDiscordPresence/releases/tag/1.0))
 - If Discord is closed **while the extension is running**, just switch the extension **off and back on**, and the presence should **reappear** on your profile

## Known Issues
 - If you go from one livestream to another, the elapsed time continues without restarting from zero
   - Caused because the `LIVESTREAM_TIME_ID` is constant
 - Sometimes, if you switch from one video to another after a pause (or from a livestream to a video), the presence will display the previous video/livestream for a split second before returning to normal
   - Caused because content.js might accidentally read the data of the previous video right after a new video starts
 - The appearance and disappearance of the rich presence on your profile can be delayed because Discord limits the processing of rich presence update requests to 15 seconds
 - The rich presence can also randomly disappear and reappear within a few seconds because Chrome forcibly unloads and reloads the `background.js` as part of Manifest V3
   - Will also cause the elapsed time for livestreams to restart

## Other Notes/Suggestions
 - REMEMBER TO **TURN OFF LOGGING** FOR RELEASE VERSIONS
 - Press `Alt` + `Enter` to show properties in Visual Studio
 - Maybe add a feature to stop the presence from disappearing when no video is playing; instead, just make the rich presence display idle (let the user choose between original or this)
 - Maybe have presence display a different icon for YouTube Music
 - For linking the Discord Game SDK to Visual Studio, go to `[PROJECT NAME ON EXPLORER] > Properties > Linker > Input > Additional Dependencies` and add the exact path to the `.lib` file associated with the `.dll` file
