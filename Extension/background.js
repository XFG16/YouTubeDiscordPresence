var nativePort = chrome.runtime.connectNative("com.ytdp.discord.presence");
var lastUpdated = 0;

chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === "document-data-pipe");
    port.onMessage.addListener(function(message) {
        nativePort.postMessage({contents: ":TITLE001:" + message.title + ":AUTHOR002:" + message.author + ":END003:"});
        lastUpdated = new Date() / 1000;
        port.postMessage({contents: "Data was received by background.js: ['" + message.title + "', '" + message.author + "']"});
    });
});

// function handleIdle() {
//     if ((new Date() / 1000) - lastUpdated >= 2) {
//         // nativePort.postMessage({contents: ":TITLE001:IDLE:AUTHOR002:IDLE:END003:"});
//     }
// }

// setInterval(handleIdle(), 1000);