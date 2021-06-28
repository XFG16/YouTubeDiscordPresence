# YouTube Discord Presence for macOS
## Important Notes
 - This is a work in progress. It is most definitely not finished yet. Expect messiness and dumb code, like bruh I'm literally not even in high school yet.
 - Obviously, you must have a YouTube tab open for this extension to work.
 - Exact file paths may vary based on the device. Make sure you have the right file paths in the code and change them if you must. The file paths in the instructions and the code are all file paths specifically for the device this code was written on. Also, make sure that the extension information for ```allowed_origins``` in ```com.ytdp.installer.json``` is correct.
## Instructions for Setup
 - This folder should be loaded into ```chrome://extensions```.
 - From the ```NativeApp``` folder, move the file named ```com.ytdp.staller.json``` to ```~/Library/Application Support/Google/Chrome/NativeMessagingHosts```.
 - Navigate to the `~` folder. Hit `command` + `shift` + `.` to show hidden files. Create a file named ```.zshrc``` under the ```~``` folder if the file does not exist. Open ```.zshrc``` and write ```export DYLD_LIBRARY_PATH=$DYLD_LIBRARY_PATH:~/Documents/Repositories/YouTubeDiscordPresence/NativeApp/lib``` into the file.
 - To allow the Discord ```dylib``` to be runnable on macOS, type ```sudo xattr -r -d com.apple.quarantine ~/Documents/Repositories/YouTubeDiscordPresence/NativeApp/lib``` into a terminal and execute it.
 - Run ```make staller``` in the ```NativeApp``` folder to compile the source code. Make sure that the executable file for ```staller.cpp``` is ```staller``` with no file extension.
## Instructions for Committing From a Terminal
 - Run ```git status``` to check if anything needs to be uploaded.
 - Run ```git add .``` to prepare all the files for uploading.
 - Run ```git commit -m [description]``` to describe the commit.
 - Run ```git push``` to push the files into the repository, successfully uploading the files.