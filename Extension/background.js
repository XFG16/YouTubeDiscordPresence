// https://github.com/discord/discord-rpc
// MAIN VARIABLE INITIALIZATION

const LOGGING = true;

const NMF = { // NMF = NATIVE_MESSAGE_FORMAT
    TITLE: ":TITLE001:",
    AUTHOR: ":AUTHOR002:",
    TIME_LEFT: ":TIMELEFT003:",
    END: ":END004:",
    IDLE: "#*IDLE*#"
}

const IDLE_TIME_REQUIREMENT = 1900;

var nativePort = chrome.runtime.connectNative("com.ytdp.discord.presence");
var scriptQueue = [];
var lastUpdated = new Map();
var currentMessage = new Object();

// LISTENER FOR CONTENT.JS AND PIPE TO NATIVE APP

chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === "document-data-pipe");
    port.onMessage.addListener(function(message) {
        if (message.title && message.author && message.timeLeft) {
            if (scriptQueue.indexOf(message.scriptId) == -1) {
                scriptQueue.push(message.scriptId);
            }
            lastUpdated.set(message.scriptId, new Date().getTime());
            if (message.scriptId == scriptQueue[0]) {
                currentMessage.title = message.title;
                currentMessage.author = message.author;
                currentMessage.timeLeft = message.timeLeft;
            }
        }
    });
});

// IDLE HANDLER

if (LOGGING) {
    console.log("background.js created");
}

var pipeInterval = setInterval(function() {
    for (const element of lastUpdated[Symbol.iterator]()) {
        if ((new Date().getTime()) - element[1] >= IDLE_TIME_REQUIREMENT) {
            lastUpdated.delete(element[0]);
            scriptQueue.splice(scriptQueue.indexOf(element[0], 1))
        }
    }
    if (lastUpdated.size > 0) {
        if (LOGGING) {
            console.log("[CURRENTMESSAGE] SENT BY BACKGROUND.JS: ['" + currentMessage.title + "', '" + currentMessage.author + "', '" + currentMessage.timeLeft + "']");
        }
        nativePort.postMessage(NMF.TITLE + currentMessage.title + NMF.AUTHOR + currentMessage.author + NMF.TIME_LEFT + currentMessage.timeLeft + NMF.END);
    }
    else {
        if (LOGGING) {
            console.log("Idle data sent: " + NMF.TITLE + NMF.IDLE + NMF.AUTHOR + NMF.IDLE + NMF.TIME_LEFT + NMF.IDLE + NMF.END);
        }
        nativePort.postMessage(NMF.TITLE + NMF.IDLE + NMF.AUTHOR + NMF.IDLE + NMF.TIME_LEFT + NMF.IDLE + NMF.END);
    }
}, 1000);