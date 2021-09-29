// https://github.com/discord/discord-rpc

var nativePort = chrome.runtime.connectNative("com.ytdp.discord.presence");
var lastUpdated = 0;

chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === "document-data-pipe");
    port.onMessage.addListener(function(message) {
        if (message.title != null && message.author != null && message.videoTime != null && message.videoDuration != null && message.playing) {
            nativePort.postMessage({contents: ":TITLE001:" + message.title + ":AUTHOR002:" + message.author + ":END003:"});
            console.log("Data was received by background.js: ['" + message.title + "', '" + message.author + "', '" + message.videoTime + "', '" + message.videoDuration + "']");
            lastUpdated = new Date().getTime();
        }
    });
});

setInterval(function() {
    if ((new Date().getTime()) - lastUpdated > 1500) {
        nativePort.postMessage({contents: ":TITLE001:#*IDLE*#:AUTHOR002:#*IDLE*#:END003:"});
        console.log("Discord presence will be idling");
    }
}, 1000);