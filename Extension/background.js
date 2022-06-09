// MAIN VARIABLE INITIALIZATION

const LOGGING = true;

const NMF = { // NMF = NATIVE_MESSAGE_FORMAT (FOR HANDLING BY YTDPwin.exe)
    TITLE: ":TITLE001:",
    AUTHOR: ":AUTHOR002:",
    TIME_LEFT: ":TIMELEFT003:",
    END: ":END004:",
    IDLE: "#*IDLE*#"
}

const IDLE_TIME_REQUIREMENT = 3000;
const NORMAL_MESSAGE_DELAY = 1000;
const LIVESTREAM_TIME_ID = -1;

var nativePort = chrome.runtime.connectNative("com.ytdp.discord.presence");
var currentMessage = new Object();
var previousMessage = new Object();
var extensionEnabled = true;
var lastUpdated = 0;
var isIdle = true;

// LOGGING

if (LOGGING) {
    console.log("background.js created");
}

// CLEANER CODE

function saveKey(key, value) {
    let saveObject = new Object();
    saveObject[key] = value;
    chrome.storage.sync.set(saveObject, function() {
        if (LOGGING) {
            console.log(key + " (saved): ", value);
        }
    });
}

// STORAGE INITIALIZER FOR POPUP.JS

chrome.runtime.onStartup.addListener(function() {
    chrome.storage.sync.get("enableOnStartup", function(result) {
        saveKey("enableOnStartup", typeof result.enableOnStartup == "undefined");
        saveKey("enabled", typeof result.enableOnStartup == "undefined" || result.enableOnStartup == true);
    });
});

// INITIALIZE EXTENSIONENABLED

chrome.storage.sync.get("enabled", function(result) {
    extensionEnabled = typeof result.enabled == "undefined" || result.enabled == true;
});

// DETECT CHANGE IN ENABLED SETTING

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key == "enabled") {
            extensionEnabled = newValue;
        }
    }
});

// LISTENER FOR DATA FROM CONTENT_LOADER.JS
// SELECTION ON WHICH TAB TO DISPLAY IS BASED ON WHICH ONE IS LOADED FIRST BY SETTING CURRENTMESSAGE.SCRIPTID TO NULL

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.scriptId == currentMessage.scriptId || currentMessage.scriptId == null) {
        currentMessage.scriptId = message.scriptId;
        currentMessage.title = message.title;
        currentMessage.author = message.author;
        currentMessage.timeLeft = message.timeLeft;
        lastUpdated = new Date().getTime();
        sendResponse(null);
    }
});

// NATIVE MESSAGING HANDLER

var pipeInterval = setInterval(function() {
    let delaySinceUpdate = new Date().getTime() - lastUpdated;
    if (nativePort && !isIdle && !extensionEnabled) {
        if (LOGGING) {
            console.log("Idle data sent: " + NMF.TITLE + NMF.IDLE + NMF.AUTHOR + NMF.IDLE + NMF.TIME_LEFT + NMF.IDLE + NMF.END);
        }
        nativePort.postMessage(NMF.TITLE + NMF.IDLE + NMF.AUTHOR + NMF.IDLE + NMF.TIME_LEFT + NMF.IDLE + NMF.END);
        isIdle = true;
    }
    else if (nativePort && delaySinceUpdate <= NORMAL_MESSAGE_DELAY + 500 && extensionEnabled) {
        let skipMessage = false;
        if (previousMessage.timeLeft >= currentMessage.timeLeft && ((previousMessage.timeLeft - currentMessage.timeLeft < NORMAL_MESSAGE_DELAY / 1000 + 0.5) || (previousMessage.timeLeft == LIVESTREAM_TIME_ID && currentMessage.timeLeft != LIVESTREAM_TIME_ID))) {
            skipMessage = true;
        }
        if (isIdle || !(previousMessage.title == currentMessage.title && previousMessage.author == currentMessage.author && skipMessage)) {
            if (LOGGING) {
                console.log("MESSAGE SENT BY BACKGROUND.JS: ['" + currentMessage.title + "', '" + currentMessage.author + "', '" + Math.round(currentMessage.timeLeft) + "']");
            }
            nativePort.postMessage(NMF.TITLE + currentMessage.title + NMF.AUTHOR + currentMessage.author + NMF.TIME_LEFT + Math.round(currentMessage.timeLeft) + NMF.END);
        }
        previousMessage.title = currentMessage.title;
        previousMessage.author = currentMessage.author;
        previousMessage.timeLeft = currentMessage.timeLeft;
        isIdle = false;
    }
    else if (delaySinceUpdate <= 2 * NORMAL_MESSAGE_DELAY + 500) {
        currentMessage.scriptId = null;
    }
    else if (nativePort && delaySinceUpdate >= IDLE_TIME_REQUIREMENT + 500 && !isIdle) {
        if (LOGGING) {
            console.log("Idle data sent: " + NMF.TITLE + NMF.IDLE + NMF.AUTHOR + NMF.IDLE + NMF.TIME_LEFT + NMF.IDLE + NMF.END);
        }
        nativePort.postMessage(NMF.TITLE + NMF.IDLE + NMF.AUTHOR + NMF.IDLE + NMF.TIME_LEFT + NMF.IDLE + NMF.END);
        isIdle = true;
    }
}, NORMAL_MESSAGE_DELAY);