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

const IDLE_TIME_REQUIREMENT = 2000;
const LIVESTREAM_TIME_ID = -1;

var nativePort = chrome.runtime.connectNative("com.ytdp.discord.presence");
var lastUpdated = 0;
var currentMessage = new Object();

// LISTENER FOR CONTENT.JS AND PIPE TO NATIVE APP

chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === "document-data-pipe");
    port.onMessage.addListener(function(message) {
        if (message.title && message.author && message.timeLeft) { // SELECTION ON WHICH TAB TO DISPLAY IS PURELY BASED ON WHICH ONE IS CLOSER TO THE UPDATE TIME (2 SECONDS)
            currentMessage.title = message.title;
            currentMessage.author = message.author;
            currentMessage.timeLeft = message.timeLeft;
            lastUpdated = new Date().getTime();
        }
    });
});

// IDLE HANDLER

if (LOGGING) {
    console.log("background.js created");
}

var pipeInterval = setInterval(function() {
    if (new Date().getTime() - lastUpdated < IDLE_TIME_REQUIREMENT) {
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
}, IDLE_TIME_REQUIREMENT);