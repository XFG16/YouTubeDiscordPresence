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

<br>

# Installation

<p align="left">
    <a href="https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa" alt="Chrome Extension">
        <img src="https://img.shields.io/badge/Chrome%20Web%20Store-6%2C000%2B%20Users-critical" /></a>
    <a href="https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa" alt="Category: Social & Communication">
        <img src="https://img.shields.io/badge/Total%20Installs-21%2C000%2B-blue" /></a>
</p>

If you're here from the Chrome Web Store, **you can skip the first step.**

1. Add the [<ins>**Chrome Extension**</ins>](https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa) from the Chrome Web Store

   - To access the personalization page, click the small icon in the top right corner of the browser, located beneath the extensions icon. For easier access, consider pinning the extension.

2. **Download** the latest `YTDPsetup.msi` file in the [**<ins>releases</ins>**](https://github.com/XFG16/YouTubeDiscordPresence/releases/tag/1.4.2) section of this repository **and run it on your device** to install the secondary desktop component.
   - **NOTE: Only Windows x64 versions are currently supported.**

Still confused? Watch the **installation tutorial** on YouTube using [**<ins>this link</ins>**](https://www.youtube.com/watch?v=BWPNqPGFyL4).

<br>

# Announcements

Recently, Discord has been making major UI/UX changes that have impacted the usability of YouTubeDiscordPresence. **Here are a few things you should know:**

1. **Buttons:** Don't worry, Discord did not remove this feature. However, buttons on your profile will no longer show on your client. Instead, they will only show on other people's clients, so your friends and everyone else on Discord will still be able to click the buttons on your profile. If you want proof, simply ask a friend to take a screenshot after you start watching YouTube or YouTube Music.

    - Here's [**<ins>an example</ins>**](https://github.com/discordjs/RPC/issues/180#issuecomment-2313232518).

2. **Time Left:** For some reason, Discord seems to have changed the way RPC calls are made. Again, you might not see a timer on your client, but it will still be visible on everyone else's. This time, however, the time you've spent on a video will be displayed as elapsed time (how long you've been watching it for) instead of time left until the video ends. I will work on addressing this after Discord finalizes their client modifications.

    - An example profile with all the features with new UI/UX updates is shown below. **Again, note that while you might not see it, this is what everyone else using Discord would see.**

<br>

<div align="center">
  <img width="auto" height="400px" src="https://github.com/XFG16/YouTubeDiscordPresence/blob/main/Extension/Images/newUiExample.png?raw=true">
</div>

<br>

These issues are **not unique to YouTubeDiscordPresence.** For example, you can no longer see Spotify buttons on your own client either.

<br>

# YouTubeDiscordPresence for Windows (x64)

<p align="left">
    <a href="https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa" alt="Category: Social & Communication">
        <img src="https://img.shields.io/badge/Category-Social%20%26%20Communication-blueviolet" /></a>
    <a href="https://github.com/XFG16/YouTubeDiscordPresence#license" alt="MIT License">
        <img src="https://img.shields.io/badge/License-MIT-yellow" /></a>
</p>

- This is an extension used to create a **detailed rich presence** for YouTube and YouTube Music on Discord. It is a project that I decided to take on towards the end of my freshman year.

- Currently, the application only supports **Windows (x64)**, although more operating systems will be supported in the future. Stay tuned!

<br>

## Troubleshooting/Known Issues

If you're having problems with buttons or time left on videos, please see the **announcements (scroll up)** regarding recent Discord UI/UX changes.

## Otherwise...

- YouTubeDiscordPresence only works with the **desktop application** of Discord, not the browser version.

- Please ensure that `Display current activity as status message` in your Discord settings **on.**

- The appearance and disappearance of the rich presence on your profile **can be delayed** because Discord limits the processing of rich presence update requests to once every 15 seconds.

- The rich presence can also randomly disappear and reappear within a few seconds because Chrome forcibly unloads and reloads the `background.js` in Manifest v3

If none of these are the issue, then the first step you should always take is to go to `chrome://extensions` and disable the extension. Then, close and reopen your browser, and re-enable the extension, especially...

- If the extension is **not appearing** even after you installed the desktop application...

  - In this case, your Discord client is likely ratelimiting YouTubeDiscordPresence. To fix this, **do not simply just reload Discord. Go to your system tray or task manager and quit Discord before relaunching it.**

- If the presence **gets stuck** at some video at `00:00 left`...

  - This is simply a problem with the client socket API in the way that Discord handles presence update requests. Currently, there is no easy solution around it.

- If **two or more instances of the rich presence** appear on your profile...

  - Again, this is an error with the socket implementation Discord currently has and there is currently no easy way around it.

<br>

## Opening a GitHub Issue

- If you need more details and have the ability to open an issue, then before that, please head to `chrome://extensions`, **turn on developer mode**, and click **"inspect views <ins>service worker</ins>"**. This should open a developer window. From there, head to the **console** section and describe what the debug log shows.

- Don't hesistate to open an issue if there's something wrong with YouTubeDiscordPresence. In fact, you should also open one if you have any suggestions for a new feature to be added.

<br>

## Detailed Installation Instructions

1. Building the installer from scratch:

   - For NodeJS version: download the `NodeHost` directory and use [**<ins>pkg</ins>**](https://github.com/vercel/pkg) to compile `app.js` into an executable. However, you have to link the Chrome extension to the compiled executable manually, which can be done by following [**<ins>this guide</ins>**](https://developer.chrome.com/docs/apps/nativeMessaging/)

     - Note that in `node_modules/discord-rpc/src/client.js`, the `RPC_CONNECTION_TIMEOUT` was changed from `10e3` to `2000`

     - The `bundle.js` file contains the application IDs for the YouTube and YouTube Music rich presence that you have to create separately in the [**Discord Developer Portal**](https://discord.com/developers/applications). Make sure the image keys match the ones in `app.js`

   - For C++ version: you can **build** the whole thing yourself with **Visual Studio 2022**. Just download the `Host` directory from this repository and open `YTDPwin.sln` under `Host/YTDPwin` in Visual Studio. Also, make sure to have the **Microsoft Visual Studio Installer Project** extension installed

2. Add the [<ins>**Chrome Extension**</ins>](https://chrome.google.com/webstore/detail/youtubediscordpresence/hnmeidgkfcbpjjjpmjmpehjdljlaeaaa) from the **Chrome Web Store**

   - If you want to load the extension without the Chrome Web Store or make edits, download the `Extension` directory, compress it into a zip, and load it onto your browser manually.

   - Make sure that the `"allowed_origins"` key in the JSON file involved in [**<ins>native messaging</ins>**](https://developer.chrome.com/docs/apps/nativeMessaging/) contains the extension's ID. This file can be found in the location you installed YouTubeDiscordPresence, which is usually `C:\Program Files\YouTubeDiscordPresence` as `main.json`

<br>

## Miscellaneous

**DISCLAIMER:** this is not a bootleg copy of PreMiD. On a more technical note, it works similar to the Spotify rich presence—it only appears **when a video is playing** and **disappears when there is no video or the video is paused**. In addition, it only displays the presence for videos. Idling and searching are **not displayed**. Features such as exclusions, fully customizable details, and thumbnail coverage are **unique and original** to YouTubeDiscordPresence. YouTubeDiscordPresence has not referenced nor is affiliated with PreMiD in any way whatsoever.

<br>

## License

Licensed under the [MIT](https://github.com/XFG16/YouTubeDiscordPresence/blob/main/LICENSE.txt) license.

<br>

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
