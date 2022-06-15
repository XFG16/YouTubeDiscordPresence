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
const UPDATE_PRESENCE_MESSAGE = "UPDATE PRESENCE DATA";
const UPDATE_TAB_SETTINGS_MESSAGE = "ENABLE ON THIS TAB";

var nativePort = chrome.runtime.connectNative("com.ytdp.discord.presence");
var currentMessage = new Object();
var previousMessage = new Object();
var tabEnabledSettings = new Object();
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
    chrome.storage.sync.set(saveObject);
}

// STORAGE INITIALIZER WHEN CHROME IS INSTALLED FOR POPUP.JS

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        chrome.storage.sync.get("enableOnStartup", function(result) {
            saveKey("enableOnStartup", true);
            saveKey("enabled", true);
        });
        chrome.storage.sync.get("enableExclusions", function(result) {
            saveKey("enableExclusions", false);
        });
    }
});

// STORAGE INITIALIZER WHEN CHROME IS OPENED FOR POPUP.JS

chrome.runtime.onStartup.addListener(function() {
    chrome.storage.sync.get("enableOnStartup", function(result) {
        saveKey("enableOnStartup", typeof result.enableOnStartup == "undefined" || result.enableOnStartup == true);
        saveKey("enabled", typeof result.enableOnStartup == "undefined" || result.enableOnStartup == true);
    });
    chrome.storage.sync.get("enableExclusions", function(result) {
        if (result == "undefined") {
            saveKey("enableExclusions", false);
        }
        else {
            saveKey("enableExclusions", result.enableExclusions == true);
        }
    });
    chrome.storage.sync.get(null, function(items) { // REMOVE ALL ENABLE ON THIS TAB KEYS JUST IN CASE THEY HAVEN'T BEEN REMOVED ALREADY
        var allKeys = Object.keys(items);
        for (const key of allKeys) {
            if (key.startsWith("enableOnThisTab")) {
                chrome.storage.sync.remove(key);
            }
        }
    });
});

// REMOVE ENABLEONTHISTAB WHEN TAB IS CLOSED

chrome.tabs.onRemoved.addListener(function(tab) {
    let storageKey = "enableOnThisTab".concat(tab.toString());
    chrome.storage.sync.remove(storageKey);
});

// INITIALIZE EXTENSIONENABLED EVERYTIME BACKGROUND.JS IS LOADED

chrome.storage.sync.get("enabled", function(result) {
    extensionEnabled = typeof result.enabled == "undefined" || result.enabled == true;
});

// DETECT CHANGE IN ENABLED SETTING

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (LOGGING) {
            console.log("the key {", key, "} has been changed from", oldValue, "to", newValue)
        }
        if (key == "enabled") {
            extensionEnabled = newValue;
        }
    }
});

// LISTENER FOR DATA FROM CONTENT_LOADER.JS
// SELECTION ON WHICH TAB TO DISPLAY IS BASED ON WHICH ONE IS LOADED FIRST BY SETTING CURRENTMESSAGE.SCRIPTID TO NULL

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.messageType == UPDATE_PRESENCE_MESSAGE && (sender.tab.id == currentMessage.scriptId || currentMessage.scriptId == null)) {
        if (!(sender.tab.id in tabEnabledSettings)) {
            tabEnabledSettings[sender.tab.id] = true;
        }
        if (tabEnabledSettings[sender.tab.id]) {
            currentMessage.scriptId = sender.tab.id;    
            currentMessage.title = message.title;
            currentMessage.author = message.author;
            currentMessage.timeLeft = message.timeLeft;
            lastUpdated = new Date().getTime();
            sendResponse(null);
        }
    }
    else if (message.messageType == UPDATE_TAB_SETTINGS_MESSAGE) {
        tabEnabledSettings[message.tabId] = message.value;
        sendResponse(null);
    }
    return true;
});

// NATIVE MESSAGING HANDLER

var pipeInterval = setInterval(function() {
    let delaySinceUpdate = new Date().getTime() - lastUpdated;
    if (nativePort && !isIdle && !extensionEnabled) {
        if (LOGGING) {
            console.log("Idle data sent:", NMF.TITLE, NMF.IDLE, NMF.AUTHOR, NMF.IDLE, NMF.TIME_LEFT, NMF.IDLE, NMF.END);
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
                console.log("MESSAGE SENT BY BACKGROUND.JS: {TITLE}:", currentMessage.title, "{AUTHOR}:", currentMessage.author, "{TIME LEFT}:", Math.round(currentMessage.timeLeft));
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
            console.log("Idle data sent:", NMF.TITLE, NMF.IDLE, NMF.AUTHOR, NMF.IDLE, NMF.TIME_LEFT, NMF.IDLE, NMF.END);
        }
        nativePort.postMessage(NMF.TITLE + NMF.IDLE + NMF.AUTHOR + NMF.IDLE + NMF.TIME_LEFT + NMF.IDLE + NMF.END);
        isIdle = true;
    }
}, NORMAL_MESSAGE_DELAY);