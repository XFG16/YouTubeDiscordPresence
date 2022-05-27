# YouTubeDiscordPresnce for Windows
 - This is now the main branch that I'll probably use and clear up later (macOS is a bit annoying)
 - Editing the extension and ```main.cpp``` can be done in VSCode directly
 - Compiling ```main.cpp``` and creating the installer should be done in Visual Studio
## TODO
 - How to handle multiple tabs (```DONE!```)
 - Error with quotation marks (NOT JUST QUOTATION MARKS, BUT ALL SPECIAL CHARACTERS) in video title and author (appears as ```\"``` instead of ```"```) (```DONE!```)
 - Livestream and premeire support (```DONE! for livestream at least, idk about premiere```)
 - Not that big of an issue, but if someone goes from one livestream to another, the elapsed time continues without restarting from zero
## Instructions for Committing From a Terminal
 - Run ```git status``` to check if anything needs to be uploaded
 - Run ```git add .``` to prepare all the files for uploading
 - Run ```git commit -m [description]``` to describe the commit
 - Run ```git push``` to push the files into the repository
## Other Notes
 - Press ```Alt``` + ```Enter``` to show properties in Visual Studio
 - For linking the Discord SDK DLL to Visual Studio, go to ```[PROJECT NAME ON EXPLORER] > Properties > Linker > Input > Additional Dependencies``` and add the EXACT path to the .lib file associated with the DLL
 - The appearance and disappearance of the rich presence on your profile can be delayed because Discord limits the processing of rich presence update requests to 15 seconds
 - Files ending with ```save_copy``` can probably be ignored and even removed later on
 - Maybe add a feature to stop the presence from disappearing when no video is playing; instead, just make the rich presence display idle (let the user choose between original or this)