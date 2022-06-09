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
 1. Download the `YTDPsetup.msi` file in the [**<ins>releases</ins>**](https://github.com/XFG16/YouTubeDiscordPresence/releases/tag/1.2) section of this repository and run it on your computer
    - It's gonna say Windows **blocked an unknown app** because the publisher is unknown. Just click more info and run anyway. If you run it through **VirusTotal**, there will be several **false positives**, so my word is really the only thing I can offer for now, until I find an alternative.
    - Otherwise, you can just **build** the whole thing yourself with **Visual Studio 2022**. Just download the `Host` directory from this repository and open `YTDPwin.sln` under `Host/YTDPwin` in Visual Studio. Also, make sure to have the **Microsoft Visual Studio Installer Project** extension installed
  2. Add the [<ins>**Chrome Extension**</ins>](https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa) from the **Chrome Web Store** and turn it on **after installing the desktop component.** If you installed the extension before installing the desktop component, just turn it **off and back on** after the desktop component is installed
  3. You should be all set and ready to go! To turn this application **on or off**, just go to `chrome://extensions` and **toggle the switch** for the extension. It would be **greatly appreciated** if you could leave a **rating and review** describing your experience on the Chrome Web Store! It would also help a lot if you could **recommend** this to others! Thank you for your consideration and enjoy the extension to its fullest!

# YouTubeDiscordPresence for Windows (x64)
## General Notes 
 - This is an extension used to create a **detailed rich presence** for YouTube videos and livestreams on Discord.
 - Currently, the application only supports **Windows**, although more operating systems will be supported in the future
 - Supports both **normal** and **livestream/premiere** videos on YouTube as well as **YouTube Music** songs
 - No, this is not a bootleg copy of PreMiD. The way it displays the rich presence and what it decides to display are **different** from PreMiD and everything here was written from scratch. Look at the next note below. Also, the desktop component of PreMiD is built on **Node.js** and several other libraries, while YouTubeDiscordPresence uses **C++** and the [<ins>**Discord Game SDK**</ins>](https://discord.com/developers/docs/game-sdk/sdk-starter-guide), which means that **no additional libraries** are required for building.
 - On a more **technical note**, it works similar to the **Spotify rich presence**—it only appears **when a video is playing** and **disappears when there is no video or the video is paused**. In addition, it only displays the presence for videos. Idling and searching are **not displayed**.
 - There are **two** components:
   - Chrome Extension ( Source code [v1.3]: `Extension` | Release [v1.2]: [<ins>**Chrome Web Store**</ins>](https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa) )
   - Desktop Application ( Source code [v1.2]: `Host` | Release [v1.2]: [**<ins>Releases</ins>**](https://github.com/XFG16/YouTubeDiscordPresence/releases/tag/1.2) )

## Troubleshooting/Known Issues
 - It only works alongside the **desktop application** of Discord, not the browser version. Also, make sure to have `Display current activity as status message` in your Discord settings **on.**
 - If Discord is closed and reopened **while the extension is running**, just switch the extension **off and back on**, and the presence should **reappear** on your profile
 - The appearance and disappearance of the rich presence on your profile can be delayed because Discord limits the processing of rich presence update requests to 15 seconds
 - The rich presence can also randomly disappear and reappear within a few seconds because Chrome forcibly unloads and reloads the `background.js` in Manifest v3
 - If you enable and disable the extension too much within a short period of time through the pop-up interface, it will overload the Discord refresh limit and the extension will be prevented by Discord from displaying. To fix this, reload your Discord and turn the extension off and back on

## Other Notes/Suggestions
 - Press `Alt` + `Enter` to show properties in Visual Studio
 - Maybe add a feature to stop the presence from disappearing when no video is playing; instead, just make the rich presence display idle (let the user choose between original or this)
 - Maybe have presence display a different icon for YouTube Music