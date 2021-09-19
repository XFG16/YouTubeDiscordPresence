var nativePort = chrome.runtime.connectNative("com.ytdp.discord.presence");
var lastUpdated = 0;

chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === "document-data-pipe");
    port.onMessage.addListener(function(message) {
        nativePort.postMessage({contents: ":TITLE001:" + message.title + ":AUTHOR002:" + message.author + ":END003:"});
        console.log("Data was received by background.js: ['" + message.title + "', '" + message.author + "', '" + message.videoTime + "', '" + message.videoDuration + "']");
        lastUpdated = new Date().getTime() / 1000;
    });
});

setInterval(function() {
    if ((new Date().getTime() / 1000) - lastUpdated > 2) {
        nativePort.postMessage({contents: ":TITLE001:#*IDLE*#:AUTHOR002:#*IDLE*#:END003:"});
        console.log("Discored presence will be idling");
    }
}, 1000);