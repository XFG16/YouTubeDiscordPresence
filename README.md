# YouTubeDiscordPresence for macOS
## Important notes
 - This is a work in progress. Expect messiness and dumb code, like bruh I'm literally not even in high school yet.
 - This folder should be loaded into ```chrome://extensions```.
 - From the ```NativeApp``` folder, move the file named ```com.ytdp.staller.json``` to ```~/Library/Application Support/Google/Chrome/NativeMessagingHosts```.
 - Make sure to compile ```staller.cpp```, located in the ```Native App``` folder. Name the compiled file ```staller``` with no file extension.
   - Create ```~/.zshrc``` under the ```~``` folder if the file does not exist.
   - Open ```~/.zshrc``` and type this:
     - ```export DYLD_LIBRARY_PATH=$DYLD_LIBRARY_PATH:~/Documents/Repositories/YouTubeDiscordPresence/NativeApp/lib```.
   - To allow the Discord ```dylib``` to be runnable from macOS, type this:
   ```sudo xattr -r -d com.apple.quarantine ~/Documents/Repositories/YouTubeDiscordPresence/NativeApp/lib```.
   - Run ```make staller``` in the ```NativeApp``` folder to compile the source code.
 - Make sure to run over ```com.ytdp.staller.json``` and check if the exectuable file path, ```allowed_origins```, and the Chrome extension ID are correct.
 - For this extension to work, you must have a tab with a video on Youtube open.
 - Exact path may vary for file paths. Make sure you have the right path. This is just the path for my device.
## Instructions on committing from a terminal
 - Run ```git status``` to check if anything needs to be uploaded.
 - Run ```git add .``` to prepare all the files for uploading.
 - Run ```git commit -m [description]``` to describe the commit.
 - Run ```git push``` to push the files into the repository, successfully uploading the files.