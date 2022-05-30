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
 - The **MSI installer** is located under `Host/YTDPwin/YTDPsetup/Release`
    - It's gonna say Windows **blocked an unknown app** because the publisher is unknown. Sorry, I'm broke and can't afford a digital certificate, at least for now. Just click more info and run anyway.
    - If you run this through VirusTotal, there are gonna be several **false positives**. Sorry, but my word is the only thing I can really offer here.
    - Otherwise, you can just **build** the whole thing yourself with **Visual Studio 2022**. Just open the `YTDPwin.sln` file under `Host/YTDPwin`, link the libraries and `main.cpp`, and you should be set.
 - After loading the extension in, you might need to **change the Chrome Extension ID** in ```main.json``` on different computers (located in the ```YouTubeDiscordPresence``` folder in ```Program Files``` if you installed it with the default path) until the extension somehow gets **uploaded to the Chrome Web Store**.

# YouTubeDiscordPresence for Windows (x64)
## General Notes 
 - This is an extension used to create a **detailed rich presence** for YouTube videos and livestreams on Discord.
 - Currently, the application only runs on **Windows** that have a **64-bit** processor
 - Supports both **normal** and **livestream/premiere** videos on YouTube as well as **YouTube Music**
 - On a more **technical note**, it works similar to the **Spotify rich presence**—it only appears **when a video is playing** and **disappears when there is no video or the video is paused**. In addition, it only displays the presence for videos. Idling and searching are **not displayed**.
 - There are **two** components:
   - Chrome Extension (`Extension`)
   - Desktop Application (`Host`)
 - To turn this application **on or off**, just go to `chrome://extensions` and **toggle the switch** for the extension
 - If Discord is closed while the extension is running, just switch the extension off and back on, and the presence should reappear on your profile

## Known Issues
 - Not that big of an issue, but if you go from one livestream to another, the elapsed time continues without restarting from zero
 - The appearance and disappearance of the rich presence on your profile can be delayed because Discord limits the processing of rich presence update requests to 15 seconds
 - The rich presence can also randomly disappear and reappear within a few seconds because Chrome forcibly unloads and reloads the `background.js` as part of Manifest V3

## Other Notes
 - REMEMBER TO **TURN OFF LOGGING** FOR RELEASE VERSIONS
 - Press `Alt` + `Enter` to show properties in Visual Studio
 - For linking the Discord SDK to Visual Studio, go to `[PROJECT NAME ON EXPLORER] > Properties > Linker > Input > Additional Dependencies` and add the exact path to the `.lib` file associated with the `.dll` file
 - Maybe add a feature to stop the presence from disappearing when no video is playing; instead, just make the rich presence display idle (let the user choose between original or this)
 - If the extension gets published to the Chrome Web Store, the Extension ID needs to get permanently updated
 - Maybe have presence display a different icon for YouTube Music