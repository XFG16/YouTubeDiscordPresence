<p align="center">
  <img width="100%" height="5" src="https://raw.githubusercontent.com/XFG16/YouTubeDiscordPresence/main/Screenshots/ytdpScreenshot1.png?raw=true">
</p>
<div align="center">
  <img width="49%" height="auto" src="https://raw.githubusercontent.com/XFG16/YouTubeDiscordPresence/main/Screenshots/ytdpScreenshot1.png?raw=true?raw=true">
  <img width="49%" height="auto" src="https://raw.githubusercontent.com/XFG16/YouTubeDiscordPresence/main/Screenshots/ytdpScreenshot3.png?raw=true?raw=true">
</div>
<div align="center">
  <img width="100%" height="5" src="https://raw.githubusercontent.com/XFG16/YouTubeDiscordPresence/main/Screenshots/ytdpScreenshot1.png?raw=true">
</div>

# Installation
 1. Download the latest `YTDPsetup.msi` file in the [**<ins>releases</ins>**](https://github.com/XFG16/YouTubeDiscordPresence/releases/tag/1.3.2) section of this repository and run it on your computer
    - If Windows SmartScreen appears, then simply click `More Info` and continue the installation from there
 2. Add the [<ins>**Chrome Extension**</ins>](https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa) from the **Chrome Web Store** and turn it on **after installing the desktop component.** If you installed the extension before installing the desktop component, just turn it **off and back on** after the desktop component is installed
  3. You should be all set and ready to go! To access the **personalization** page, you need to click on the small icon on the **top right of the browser** under the **extensions icon**. It would also be easier to access if you **pinned** the extension. It would be **greatly appreciated** if you could leave a **rating and review** describing your experience on the Chrome Web Store! It would also help a lot if you could **recommend** this to others! Thank you for your consideration and enjoy the extension to its fullest!

# YouTubeDiscordPresence for Windows (x64)

<p align="left">
    <a href="https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa" alt="Chrome Extension">
        <img src="https://img.shields.io/badge/Chrome%20Web%20Store-400%2B%20Users-critical" /></a>
    <a href="https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa" alt="Category: Social & Communication">
        <img src="https://img.shields.io/badge/Category-Social%20%26%20Communication-blueviolet" /></a>
    <a href="https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa" alt="Listing: Featured">
        <img src="https://img.shields.io/badge/Listing-Featured-blue" /></a>
    <a href="https://github.com/XFG16/YouTubeDiscordPresence#license" alt="MIT License">
        <img src="https://img.shields.io/badge/License-MIT-yellow" /></a>
</p>

## General Notes 
 - This is an extension used to create a **detailed rich presence** for YouTube videos and livestreams on Discord. It is a project that I decided to take on towards the end of my freshman year
 - This extension seems appears to work on the Opera web browser
 - Currently, the application only supports **Windows**, although more operating systems will be supported in the future
 - Supports both **normal** and **livestream/premiere** videos on YouTube as well as **YouTube Music** songs
 - No, this is not a bootleg copy of PreMiD. In fact, on a more **technical note**, it works similar to the **Spotify rich presence**—it only appears **when a video is playing** and **disappears when there is no video or the video is paused**. In addition, it only displays the presence for videos. Idling and searching are **not displayed**.
 - There are **two** components:
   - Chrome Extension << Source code [v1.5.0]: `Extension` || Release [v1.4.2]: [<ins>**Chrome Web Store**</ins>](https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa) >>
   - Desktop Application << Source code [v1.4.0]: `Host` || Release [v1.3.2]: [**<ins>Releases</ins>**](https://github.com/XFG16/YouTubeDiscordPresence/releases/tag/1.3.2) >>

## Detailed Installation Instructions

 1. Building the installer from scratch:
    - For C++ version: you can **build** the whole thing yourself with **Visual Studio 2022**. Just download the `Host` directory from this repository and open `YTDPwin.sln` under `Host/YTDPwin` in Visual Studio. Also, make sure to have the **Microsoft Visual Studio Installer Project** extension installed
    - For NodeJS version: download the `NodeHost` directory and use [**<ins>pkg</ins>**](https://github.com/vercel/pkg) to compile the code into an executable. However, you have to link the Chrome extension to the compiled executable manually, which can be done by following [**<ins>this guide</ins>**](https://developer.chrome.com/docs/apps/nativeMessaging/)
2. Add the [<ins>**Chrome Extension**</ins>](https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa) from the **Chrome Web Store**
    - If you want to load the extension without the Chrome Web Store or make edits, download the `Extension` directory, compress it into a zip, and load it onto your browser manually. Make sure that the `"allowed_origins"` key in the JSON file involved in [**<ins>native messaging</ins>**](https://developer.chrome.com/docs/apps/nativeMessaging/) contains the extension's ID.

## Troubleshooting/Known Issues
 - It only works alongside the **desktop application** of Discord, not the browser version. Also, make sure to have `Display current activity as status message` in your Discord settings **on.**
 - The appearance and disappearance of the rich presence on your profile **can be delayed** because Discord limits the processing of rich presence update requests to once every 15 seconds
 - If the presence gets stuck at some video at `00:00 left`, then go to `chrome://extensions` and switch the extension off and back on. This is simply a problem with the client socket API that occurs randomly.
 - The rich presence can also randomly disappear and reappear within a few seconds because Chrome forcibly unloads and reloads the `background.js` in Manifest v3
 - If you enable and disable the extension too much within a short period of time through the pop-up interface (please don't do this), it will overload the Discord refresh limit and the extension will be prevented by Discord from displaying. To fix this, reload your Discord and turn the extension off and back on in `chrome://extensions`
 - Don't hesistate to open an issue if there's something wrong with YouTubeDiscordPresence. In fact, you should also open one if you have any suggestions for a new feature to be added.

## Miscellaneous
 - Press `Alt` + `Enter` to show properties in Visual Studio
 - **[WIP]** Maybe have presence display a different icon for YouTube Music
 - **[WIP]** Maybe add a feature to stop the presence from disappearing when no video is playing; instead, just make the rich presence display idle (let the user choose between original or this)

## License
Licensed under the [MIT](https://github.com/XFG16/YouTubeDiscordPresence/blob/main/LICENSE.txt) license.
