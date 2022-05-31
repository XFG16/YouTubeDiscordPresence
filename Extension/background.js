// MAIN VARIABLE INITIALIZATION

const LOGGING = true;

const NMF = { // NMF = NATIVE_MESSAGE_FORMAT
    TITLE: ":TITLE001:",
    AUTHOR: ":AUTHOR002:",
    TIME_LEFT: ":TIMELEFT003:",
    END: ":END004:",
    IDLE: "#*IDLE*#"
}

const IDLE_TIME_REQUIREMENT = 4000;
const LIVESTREAM_TIME_ID = -1;

var nativePort = chrome.runtime.connectNative("com.ytdp.discord.presence");
var lastUpdated = 0;
var currentMessage = new Object();
var prevMessage = new Object()

// LOGGING

if (LOGGING) {
    console.log("background.js created");
}

// LISTENER FOR DATA FROM CONTENT_LOADER.JS
// SELECTION ON WHICH TAB TO DISPLAY IS PURELY BASED ON WHICH ONE IS CLOSER TO THE UPDATE TIME (2 SECONDS)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.title && message.author && message.timeLeft) {
        currentMessage.title = message.title;
        currentMessage.author = message.author;
        currentMessage.timeLeft = message.timeLeft;
        sendResponse(null);
        lastUpdated = new Date().getTime();
    }
});

// NATIVE MESSAGING HANDLER

var pipeInterval = setInterval(function() {
    if (new Date().getTime() - lastUpdated > IDLE_TIME_REQUIREMENT + 500) {
        if (LOGGING) {
            console.log("Idle data sent: " + NMF.TITLE + NMF.IDLE + NMF.AUTHOR + NMF.IDLE + NMF.TIME_LEFT + NMF.IDLE + NMF.END);
        }
        nativePort.postMessage(NMF.TITLE + NMF.IDLE + NMF.AUTHOR + NMF.IDLE + NMF.TIME_LEFT + NMF.IDLE + NMF.END);
    }
    else if (new Date().getTime() - lastUpdated < IDLE_TIME_REQUIREMENT + 500 && (currentMessage.timeLeft == LIVESTREAM_TIME_ID || (!(prevMessage.title == currentMessage.title && prevMessage.author == currentMessage.author && (prevMessage.timeLeft == currentMessage.timeLeft || prevMessage.timeLeft == currentMessage.timeLeft - 1))))) {
        if (LOGGING) {
            console.log("[CURRENTMESSAGE] SENT BY BACKGROUND.JS: ['" + currentMessage.title + "', '" + currentMessage.author + "', '" + currentMessage.timeLeft + "']");
        }
        nativePort.postMessage(NMF.TITLE + currentMessage.title + NMF.AUTHOR + currentMessage.author + NMF.TIME_LEFT + currentMessage.timeLeft + NMF.END);
        prevMessage.title = currentMessage.title;
        prevMessage.author = currentMessage.author;
        prevMessage.timeLeft = currentMessage.timeLeft;
    }
}, IDLE_TIME_REQUIREMENT / 2);