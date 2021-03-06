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
const UPDATE_PRESENCE_MESSAGE = "UPDATE_PRESENCE_DATA";

var nativePort = chrome.runtime.connectNative("com.ytdp.discord.presence");
var currentMessage = new Object();
var previousMessage = new Object();
var lastUpdated = 0;
var isIdle = true;

var extensionEnabled = true;
var tabEnabledList = new Object();

var exclusionsEnabled = false;
var videoExclusionsList = new Array();
var keywordExclusionsList = new Array();

var inclusionsEnabled = false;
var videoInclusionsList = new Array();
var keywordInclusionsList = new Array();

// LOGGING

if (LOGGING) {
    console.log("background.js created");
}

// CLEANER CODE

function saveStorageKey(key, value) {
    let saveObject = new Object();
    saveObject[key] = value;
    chrome.storage.sync.set(saveObject);
}

// PARSE YOUTUBE URLS (https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url)

function getVideoId(url){
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : null;
}

// CHECK WHETHER OR NOT VIDEO/CHANNEL TITLE OR VIDEO ID IS EXCLUDED

function isExcluded(title, author, videoId) {
    if (exclusionsEnabled == false) {
        return false;
    }
    for (let i = 0; i < videoExclusionsList.length; ++i) {
        excludedVideoId = getVideoId(videoExclusionsList[i]);
        if (excludedVideoId && videoId == excludedVideoId) {
            return true;
        }
        if (title == videoExclusionsList[i] || author == videoExclusionsList[i]) {
            return true;
        }
    }
    for (let i = 0; i < keywordExclusionsList.length; ++i) {
        let keyword = keywordExclusionsList[i].toLowerCase();
        if (title.toLowerCase().includes(keyword) || author.toLowerCase().includes(keyword)) {
            return true;
        }
    }
    return false;
}

// CHECK WHETHER OR NOT VIDEO/CHANNEL TITLE OR VIDEO ID IS INCLUDED

function isIncluded(title, author, videoId) {
    if (inclusionsEnabled == false) {
        return true;
    }
    for (let i = 0; i < videoInclusionsList.length; ++i) {
        includedVideoId = getVideoId(videoInclusionsList[i]);
        if (includedVideoId && videoId == includedVideoId) {
            return true;
        }
        if (title == videoInclusionsList[i] || author == videoInclusionsList[i]) {
            return true;
        }
    }
    for (let i = 0; i < keywordInclusionsList.length; ++i) {
        let keyword = keywordInclusionsList[i].toLowerCase();
        if (title.toLowerCase().includes(keyword) || author.toLowerCase().includes(keyword)) {
            return true;
        }
    }
    return false;
}

// STORAGE INITIALIZER WHEN CHROME IS INSTALLED FOR POPUP.JS

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        saveStorageKey("enabled", true);
        saveStorageKey("enableOnStartup", true);
        saveStorageKey("enableExclusions", false);
        saveStorageKey("enableInclusions", false);
        saveStorageKey("tabEnabledList", new Object());
        saveStorageKey("videoExclusionsList", new Array());
        saveStorageKey("keywordExclusionsList", new Array());
        saveStorageKey("videoInclusionsList", new Array());
        saveStorageKey("keywordInclusionsList", new Array());
    }
});

// STORAGE INITIALIZER WHEN CHROME IS OPENED FOR POPUP.JS

chrome.runtime.onStartup.addListener(function() {
    chrome.storage.sync.get("enableOnStartup", function(result) {
        saveStorageKey("enableOnStartup", result.enableOnStartup == undefined || result.enableOnStartup == true);
        saveStorageKey("enabled", result.enableOnStartup == undefined || result.enableOnStartup == true);
        extensionEnabled = (result.enableOnStartup == undefined || result.enableOnStartup == true);
    });
    chrome.storage.sync.get("tabEnabledList", function(result) {
        saveStorageKey("tabEnabledList", new Object());
        tabEnabledList = new Object();
    });
});

// MUST RUN EVERY TIME BACKGROUND.JS STARTS - INITIALIZES KEYS JUST IN CASE THEY WEREN'T INITIALIZED BEFORE

chrome.storage.sync.get("enabled", function(result) {
    if (result.enabled == undefined) {
        saveStorageKey("enabled", true);
        extensionEnabled = true;
    }
    else {
        extensionEnabled = result.enabled;
    }
});
chrome.storage.sync.get("enableExclusions", function(result) {
    if (result.enableExclusions == undefined) {
        saveStorageKey("enableExclusions", false);
        exclusionsEnabled = false;
    }
    else {
        exclusionsEnabled = result.enableExclusions;
    }
});
chrome.storage.sync.get("enableInclusions", function(result) {
    if (result.enableInclusions == undefined) {
        saveStorageKey("enableInclusions", false);
        inclusionsEnabled = false;
    }
    else {
        inclusionsEnabled = result.enableInclusions;
    }
});
chrome.storage.sync.get("tabEnabledList", function(result) {
    if (result == undefined) {
        saveStorageKey("tabEnabledList", new Object());
        tabEnabledList = new Object();
    }
    else {
        tabEnabledList = result.tabEnabledList;
    }
});
chrome.storage.sync.get("videoExclusionsList", function(result) {
    if (result.videoExclusionsList == undefined) {
        saveStorageKey("videoExclusionsList", new Array());
        videoExclusionsList = new Array();
    }
    else {
        videoExclusionsList = result.videoExclusionsList;
    }
});
chrome.storage.sync.get("keywordExclusionsList", function(result) {
    if (result.keywordExclusionsList == undefined) {
        saveStorageKey("keywordExclusionsList", new Array());
        keywordExclusionsList = new Array();
    }
    else {
        keywordExclusionsList = result.keywordExclusionsList;
    }
});
chrome.storage.sync.get("videoInclusionsList", function(result) {
    if (result.videoInclusionsList == undefined) {
        saveStorageKey("videoInclusionsList", new Array());
        videoInclusionsList = new Array();
    }
    else {
        videoInclusionsList = result.videoInclusionsList;
    }
});
chrome.storage.sync.get("keywordInclusionsList", function(result) {
    if (result.keywordInclusionsList == undefined) {
        saveStorageKey("keywordInclusionsList", new Array());
        keywordInclusionsList = new Array();
    }
    else {
        keywordInclusionsList = result.keywordInclusionsList;
    }
});

// REMOVE ENABLEONTHISTAB WHEN TAB IS CLOSED

chrome.tabs.onRemoved.addListener(function(tab) {
    chrome.storage.sync.get("tabEnabledList", function(result) {
        let newTabEnabledList = result.tabEnabledList;
        if (tab in newTabEnabledList) {
            delete newTabEnabledList[tab];
        }
        saveStorageKey("tabEnabledList", newTabEnabledList);
    });
});

// // INITIALIZE EXTENSIONENABLED EVERYTIME BACKGROUND.JS IS LOADED

// chrome.storage.sync.get("enabled", function(result) {
//     extensionEnabled = typeof result.enabled == "undefined" || result.enabled == true;
// });

// DETECT CHANGE IN ENABLED SETTING

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (LOGGING) {
            console.log("the key {", key, "} has been changed from", oldValue, "to", newValue)
        }
        if (key == "enabled") {
            extensionEnabled = newValue;
        }
        else if (key == "tabEnabledList") {
            tabEnabledList = newValue;
        }
        else if (key == "enableExclusions") {
            exclusionsEnabled = newValue;
        }
        else if (key == "enableInclusions") {
            inclusionsEnabled = newValue;
        }
        else if (key == "videoExclusionsList") {
            videoExclusionsList = newValue;
        }
        else if (key == "keywordExclusionsList") {
            keywordExclusionsList = newValue;
        }
        else if (key == "videoInclusionsList") {
            videoInclusionsList = newValue;
        }
        else if (key == "keywordInclusionsList") {
            keywordInclusionsList = newValue;
        }
    }
});

// LISTENER FOR DATA FROM CONTENT_LOADER.JS
// SELECTION ON WHICH TAB TO DISPLAY IS BASED ON WHICH ONE IS LOADED FIRST BY SETTING CURRENTMESSAGE.SCRIPTID TO NULL

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.messageType == UPDATE_PRESENCE_MESSAGE && (sender.tab.id == currentMessage.scriptId || currentMessage.scriptId == null) && !isExcluded(message.title, message.author, message.videoId) && isIncluded(message.title, message.author, message.videoId)) {
        if (!(sender.tab.id in tabEnabledList)) {
            tabEnabledList[sender.tab.id] = true;
        }
        if (tabEnabledList[sender.tab.id]) {
            currentMessage.scriptId = sender.tab.id;    
            currentMessage.title = message.title;
            currentMessage.author = message.author;
            currentMessage.timeLeft = message.timeLeft;
            lastUpdated = new Date().getTime();
            sendResponse(null);
        }
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