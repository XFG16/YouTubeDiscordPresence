# YouTubeDiscordPresnce for Windows (x64)
 - This is now the main branch that I'll probably use and clear up later (macOS is a bit annoying)
 - Editing the extension and ```main.cpp``` can be done in VSCode directly
 - Compiling ```main.cpp``` and creating the installer should be done in Visual Studio
## Installation
 - MSI installer is located under ```YouTubeDiscordPresence/tree/YouTubeDiscordPresenceWin/Host/YTDPwin/YTDPsetup/Release```
    - It's gonna say Windows blocked an unknown app because the publisher is unknown (I'm a broke high schooler and can't afford a digital certificate). Just click more info and run anyway
    - If you're scared, just scan the file with VirusTotal or something
 - You might need to change the Chrome Extension ID in ```main.json``` on different computers (located in the ```YouTubeDiscordPresence``` folder in ```Program Files``` if you installed it with the default path) until the extension somehow gets uploaded to the Chrome Web Store
## Issues
 - ~~How to handle multiple tabs~~ **[DONE]**
 - ~~Error with quotation marks (NOT JUST QUOTATION MARKS, BUT ALL SPECIAL CHARACTERS) in video title and author (appears as ```\"``` instead of ```"```)~~ **[DONE]**
    - There might be a problem if the video has multiple backslashes in a row though
 - ~~Livestream and premeire support~~ **[DONE for livestream at least, don't about premiere because I haven't gotten to test it yet]**
 - Not that big of an issue, but if someone goes from one livestream to another, the elapsed time continues without restarting from zero
## Instructions for Committing From a Terminal
 - Run ```git status``` to check if anything needs to be uploaded
 - Run ```git add .``` to prepare all the files for uploading
 - Run ```git commit -m [description]``` to describe the commit
 - Run ```git push``` to push the files into the repository
## Other Notes
 - Press ```Alt``` + ```Enter``` to show properties in Visual Studio
 - For linking the Discord SDK DLL to Visual Studio, go to ```[PROJECT NAME ON EXPLORER] > Properties > Linker > Input > Additional Dependencies``` and add the exact path to the .lib file associated with the DLL
 - The appearance and disappearance of the rich presence on your profile can be delayed because Discord limits the processing of rich presence update requests to 15 seconds
 - Files ending with ```save_copy``` can probably be ignored and even removed later on
 - Maybe add a feature to stop the presence from disappearing when no video is playing; instead, just make the rich presence display idle (let the user choose between original or this)