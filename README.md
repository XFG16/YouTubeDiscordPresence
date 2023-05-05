<p align="center">
  <img width="100%" height="5" src="https://raw.githubusercontent.com/XFG16/YouTubeDiscordPresence/main/Screenshots/ytdpScreenshot1.png?raw=true">
</p>
<div align="center">
  <img width="49%" height="auto" src="https://raw.githubusercontent.com/XFG16/YouTubeDiscordPresence/main/Screenshots/ytdpScreenshot1.png?raw=true?">
  <img width="49%" height="auto" src="https://raw.githubusercontent.com/XFG16/YouTubeDiscordPresence/main/Screenshots/ytdpScreenshot4.png?raw=true">
</div>
<div align="center">
  <img width="100%" height="5" src="https://raw.githubusercontent.com/XFG16/YouTubeDiscordPresence/main/Screenshots/ytdpScreenshot1.png?raw=true">
</div>

# Installation
  1. Add the [<ins>**Chrome Extension**</ins>](https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa) from the **Chrome Web Store**
  2. **Download** the latest `YTDPsetup.msi` file in the [**<ins>releases</ins>**](https://github.com/XFG16/YouTubeDiscordPresence/releases/tag/1.4.2) section of this repository **and run it on your device** to install the secondary desktop component

You should be all set and ready to go! To access the **personalization** page, you need to click on the small icon on the **top right of the browser** under the **extensions icon**. It would also be easier to access if you **pinned** the extension. It would be **greatly appreciated** if you could leave a **rating and review** describing your experience on the Chrome Web Store! It would also help a lot if you could **recommend** this to others! Thank you for your consideration and enjoy the extension to its fullest!

# YouTubeDiscordPresence for Windows (x64)

<p align="left">
    <a href="https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa" alt="Chrome Extension">
        <img src="https://img.shields.io/badge/Chrome%20Web%20Store-600%2B%20Users-critical" /></a>
    <a href="https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa" alt="Category: Social & Communication">
        <img src="https://img.shields.io/badge/Category-Social%20%26%20Communication-blueviolet" /></a>
    <a href="https://github.com/XFG16/YouTubeDiscordPresence#license" alt="MIT License">
        <img src="https://img.shields.io/badge/License-MIT-yellow" /></a>
</p>

## General Notes 
 - This is an extension used to create a **detailed rich presence** for YouTube and YouTube Music on Discord. It is a project that I decided to take on towards the end of my freshman year.
 - Currently, the application only supports **Windows**, although more operating systems will be supported in the future. Stay tuned!
 - Creates a rich presence for both **normal** and **livestream/premiere** videos on YouTube, as well as **YouTube Music** songs. Includes an **album cover** feature for the currently playing YouTube Music song (if detectable) and an optional **thumbnail** feature for YouTube as well.
 - There are **two** components:
   - Chrome Extension << Source code [v1.5.4]: `Extension` || Release [v1.5.4]: [<ins>**Chrome Web Store**</ins>](https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa) >>
   - Desktop Application << Source code [v1.4.2]: `Host` || Release [v1.4.2]: [**<ins>Releases</ins>**](https://github.com/XFG16/YouTubeDiscordPresence/releases/tag/1.4.2) >>

## Troubleshooting/Known Issues
 - It only works alongside the **desktop application** of Discord, not the browser version. Also, make sure to have `Display current activity as status message` in your Discord settings **on.**
 - The appearance and disappearance of the rich presence on your profile **can be delayed** because Discord limits the processing of rich presence update requests to once every 15 seconds.
  - The rich presence can also randomly disappear and reappear within a few seconds because Chrome forcibly unloads and reloads the `background.js` in Manifest v3

Otherwise, this is the first thing **you should always do:** head to `chrome://extensions` and turn the extension off. Then, close your browser, reopen the browser, and turn the extension back on, especially...
  - If the extension is **not appearing** even after you installed the desktop application...
    - In this case, your Discord client is likely ratelimiting YouTubeDiscordPresence. To fix this, **do not simply just reload Discord. Go to your system tray or task manager and quit Discord before relaunching it.**
  - If the presence **gets stuck** at some video at `00:00 left`...
    - This is simply a problem with the client socket API in the way that Discord handles presence update requests. Currently, there is no easy solution around it.
  - If **two or more instances of the rich presence** appear on your profile... 
    - Again, this is an error with the socket implementation Discord currently has and there is currently no easy way around it.
## Opening a GitHub Issue
 - If you need more details and have the ability to open an issue, then before that, please head to `chrome://extensions`, **turn on developer mode**, and click **"inspect views <ins>service worker</ins>"**. This should open a developer window. From there, head to the **console** section and describe what the debug log shows.
 - Don't hesistate to open an issue if there's something wrong with YouTubeDiscordPresence. In fact, you should also open one if you have any suggestions for a new feature to be added.

## Detailed Installation Instructions

 1. Building the installer from scratch:
    - For NodeJS version: download the `NodeHost` directory and use [**<ins>pkg</ins>**](https://github.com/vercel/pkg) to compile `app.js` into an executable. However, you have to link the Chrome extension to the compiled executable manually, which can be done by following [**<ins>this guide</ins>**](https://developer.chrome.com/docs/apps/nativeMessaging/)
      - Note that in `node_modules/discord-rpc/src/client.js`, the `RPC_CONNECTION_TIMEOUT` was changed from `10e3` to `2000`
    - For C++ version: you can **build** the whole thing yourself with **Visual Studio 2022**. Just download the `Host` directory from this repository and open `YTDPwin.sln` under `Host/YTDPwin` in Visual Studio. Also, make sure to have the **Microsoft Visual Studio Installer Project** extension installed
2. Add the [<ins>**Chrome Extension**</ins>](https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa) from the **Chrome Web Store**
    - If you want to load the extension without the Chrome Web Store or make edits, download the `Extension` directory, compress it into a zip, and load it onto your browser manually. 
    - Make sure that the `"allowed_origins"` key in the JSON file involved in [**<ins>native messaging</ins>**](https://developer.chrome.com/docs/apps/nativeMessaging/) contains the extension's ID. This file can be found in the location you installed YouTubeDiscordPresence, which is usually `C:\Program Files\YouTubeDiscordPresence` as `main.json`

## Miscellaneous
 - Press `Alt` + `Enter` to show properties in Visual Studio

**DISCLAIMER:** this is not a bootleg copy of PreMiD. On a more technical note, it works similar to the Spotify rich presence—it only appears **when a video is playing** and **disappears when there is no video or the video is paused**. In addition, it only displays the presence for videos. Idling and searching are **not displayed**. Features such as exclusions, fully customizable details, and thumbnail coverage are **unique and original** to YouTubeDiscordPresence. YouTubeDiscordPresence has not referenced nor is affiliated with PreMiD in any way whatsoever.

## License
Licensed under the [MIT](https://github.com/XFG16/YouTubeDiscordPresence/blob/main/LICENSE.txt) license.

<p align="center">
  <img width="100%" height="5" src="https://raw.githubusercontent.com/XFG16/YouTubeDiscordPresence/main/Screenshots/ytdpScreenshot1.png?raw=true">
</p>
<div align="center">
  <img width="49%" height="auto" src="https://raw.githubusercontent.com/XFG16/YouTubeDiscordPresence/main/Screenshots/ytdpScreenshot2.png?raw=true?">
  <img width="49%" height="auto" src="https://raw.githubusercontent.com/XFG16/YouTubeDiscordPresence/main/Screenshots/ytdpScreenshot3.png?raw=true">
</div>
<div align="center">
  <img width="100%" height="5" src="https://raw.githubusercontent.com/XFG16/YouTubeDiscordPresence/main/Screenshots/ytdpScreenshot1.png?raw=true">
</div>
