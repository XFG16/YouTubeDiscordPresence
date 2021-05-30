# YouTubeDiscordPresence for macOS
## Important notes
 - This folder should be loaded into ```chrome://extensions```
 - From the ```NativeApp``` folder, move the file named ```com.ytdp.staller.json``` to ```~/Library/Application Support/Google/Chrome/NativeMessagingHosts```
 - Make sure to compile ```staller.cpp```, located in the ```Native App``` folder. Name the compiled file ```staller``` with no file extension
 - Make sure to run over ```com.ytdp.staller.json``` and check if the exectuable file path and the Chrome extension ID are correct
 - For this extension to work, you must have a tab with a video on Youtube open
## Instructions on committing from a terminal
 - Run ```git status``` to check if anything needs to be uploaded
 - Run ```git add .``` to prepare all the files for uploading
 - Run ```git commit -m [description]``` to describe the commit
 - Run ```git push``` to push the files into the repository, successfully uploading the files