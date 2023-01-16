// MAIN VARIABLE INITIALIZATION

const LOGGING = true;

const NMF = Object.freeze({ // NMF = NATIVE_MESSAGE_FORMAT (FOR HANDLING BY YTDPwin.exe)
    TITLE: ":TITLE001:",
    AUTHOR: ":AUTHOR002:",
    TIME_LEFT: ":TIMELEFT003:",
    END: ":END004:",
    IDLE: "#*IDLE*#"
});

const NORMAL_MESSAGE_DELAY = 1000;
const LIVESTREAM_TIME_ID = -1;
const UPDATE_PRESENCE_MESSAGE = "UPDATE_PRESENCE_DATA";

let nativePort = chrome.runtime.connectNative("com.ytdp.discord.presence");
let currentMessage = new Object();
let previousMessage = new Object();
let lastUpdated = 9007199254740991;
let isIdle = true;

let settings = {
    enabled: true,
    enableOnStartup: true,
    tabEnabledList: new Object(),

    enableExclusions: false,
    videoExclusionsList: new Array(),
    keywordExclusionsList: new Array(),

    enableInclusions: false,
    videoInclusionsList: new Array(),
    keywordInclusionsList: new Array(),

    enableVideoButton: true,
    enableChannelButton: false,
    enablePlayingIcon: false,
    addByAuthor: true
}

// START MESSAGE

if (LOGGING) {
    console.log("background.js created");
}

// STORAGE SAVING HANDLER

function saveStorageKey(key, value) {
    let saveObject = new Object();
    saveObject[key] = value;
    chrome.storage.sync.set(saveObject);
}

// PARSE YOUTUBE URLS (https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url)

function getVideoId(url) {
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : null;
}

// CHECK WHETHER OR NOT VIDEO/CHANNEL TITLE OR VIDEO ID IS EXCLUDED

function isExcluded(title, author, videoUrl) {
    if (settings.enableExclusions == false) {
        return false;
    }
    for (let i = 0; i < settings.videoExclusionsList.length; ++i) {
        excludedVideoId = getVideoId(settings.videoExclusionsList[i]);
        if (excludedVideoId && getVideoId(videoUrl) == excludedVideoId) {
            return true;
        }
        if (title == settings.videoExclusionsList[i] || author == settings.videoExclusionsList[i]) {
            return true;
        }
    }
    for (let i = 0; i < settings.keywordExclusionsList.length; ++i) {
        let keyword = settings.keywordExclusionsList[i].toLowerCase();
        if (title.toLowerCase().includes(keyword) || author.toLowerCase().includes(keyword)) {
            return true;
        }
    }
    return false;
}

// CHECK WHETHER OR NOT VIDEO/CHANNEL TITLE OR VIDEO ID IS INCLUDED

function isIncluded(title, author, videoUrl) {
    if (settings.enableInclusions == false) {
        return true;
    }
    for (let i = 0; i < settings.videoInclusionsList.length; ++i) {
        includedVideoId = getVideoId(settings.videoInclusionsList[i]);
        if (includedVideoId && getVideoId(videoUrl) == includedVideoId) {
            return true;
        }
        if (title == settings.videoInclusionsList[i] || author == settings.videoInclusionsList[i]) {
            return true;
        }
    }
    for (let i = 0; i < settings.keywordInclusionsList.length; ++i) {
        let keyword = settings.keywordInclusionsList[i].toLowerCase();
        if (title.toLowerCase().includes(keyword) || author.toLowerCase().includes(keyword)) {
            return true;
        }
    }
    return false;
}

// MUST RUN EVERY TIME BACKGROUND.JS STARTS - INITIALIZES KEYS JUST IN CASE THEY WEREN'T INITIALIZED BEFORE

for (const key of Object.keys(settings)) {
    chrome.storage.sync.get(key, function (result) {
        if (result[key] == undefined) {
            saveStorageKey(key, settings[key]);
        }
        else {
            settings[key] = result[key];
        }
    });
}

// STORAGE INITIALIZER WHEN CHROME IS OPENED

chrome.runtime.onStartup.addListener(function () {
    chrome.storage.sync.get("enableOnStartup", function (result) {
        saveStorageKey("enableOnStartup", result.enableOnStartup == undefined || result.enableOnStartup == true);
        saveStorageKey("enabled", result.enableOnStartup == undefined || result.enableOnStartup == true);
        settings.enabled = (result.enableOnStartup == undefined || result.enableOnStartup == true);
    });
    saveStorageKey("tabEnabledList", new Object());
    settings.tabEnabledList = new Object();
});

// REMOVE ENABLEONTHISTAB WHEN TAB IS CLOSED

chrome.tabs.onRemoved.addListener(function (tab) {
    chrome.storage.sync.get("tabEnabledList", function (result) {
        let newTabEnabledList = result.tabEnabledList;
        if (tab in newTabEnabledList) {
            delete newTabEnabledList[tab];
        }
        saveStorageKey("tabEnabledList", newTabEnabledList);
    });
});

// DETECT CHANGE IN ENABLED SETTING

chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (LOGGING) {
            console.log("the key {", key, "} has been changed from", oldValue, "to", newValue)
        }
        settings[key] = newValue;
    }
});

// LISTENER FOR DATA FROM CONTENT_LOADER.JS
// SELECTION ON WHICH TAB TO DISPLAY IS BASED ON WHICH ONE IS LOADED FIRST BY SETTING CURRENTMESSAGE.SCRIPTID TO NULL

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.messageType == UPDATE_PRESENCE_MESSAGE && (sender.tab.id == currentMessage.scriptId || currentMessage.scriptId == null) && !isExcluded(message.title, message.author, message.videoId) && isIncluded(message.title, message.author, message.videoId)) {
        if (!(sender.tab.id in settings.tabEnabledList)) {
            settings.tabEnabledList[sender.tab.id] = true;
        }
        if (settings.tabEnabledList[sender.tab.id]) {
            currentMessage.scriptId = sender.tab.id;
            currentMessage.title = message.title;
            currentMessage.author = message.author;
            currentMessage.timeLeft = message.timeLeft;
            currentMessage.videoUrl = "https://youtube.com/watch?v=" + message.videoId;
            currentMessage.channelUrl = message.channelUrl;
            currentMessage.applicationType = message.applicationType;
            lastUpdated = new Date().getTime();
            sendResponse(null);
        }
    }
    return true;
});

// NODE.JS APPLICATION LOGGER

const handleNativeMessage = (message) => {
    if (LOGGING) {
        console.log(`Received from application:\n    ${message.data}`);
    }
}
nativePort.onMessage.addListener(handleNativeMessage);

// NATIVE MESSAGING HANDLER

const IDLE_DATA_OBJECT = {
    "cppData": NMF.TITLE + NMF.IDLE + NMF.AUTHOR + NMF.IDLE + NMF.TIME_LEFT + NMF.IDLE + NMF.END,
    "jsTitle": NMF.IDLE,
    "jsAuthor": NMF.IDLE,
    "jsTimeLeft": NMF.IDLE,
    "jsVideoUrl": NMF.IDLE,
    "jsChannelUrl": NMF.IDLE,
    "jsPresenceSettings": NMF.IDLE,
    "jsApplicationType": NMF.IDLE
};

let pipeInterval = setInterval(function () {
    if (!nativePort) {
        return;
    }

    let inclusionExclusionStatus = false;
    if (!(Object.keys(currentMessage).length == 0) && (isExcluded(currentMessage.title, currentMessage.author, currentMessage.videoUrl) || !isIncluded(currentMessage.title, currentMessage.author, currentMessage.videoUrl))) {
        inclusionExclusionStatus = true;
    }
    let delaySinceUpdate = new Date().getTime() - lastUpdated;
    if (!settings.enabled || !(currentMessage.scriptId in settings.tabEnabledList) || delaySinceUpdate >= 3 * NORMAL_MESSAGE_DELAY || inclusionExclusionStatus) {
        if (!isIdle) {
            if (LOGGING) {
                console.log("Idle data sent:\n    #*IDLE*#");
            }
            nativePort.postMessage(IDLE_DATA_OBJECT);
            currentMessage.scriptId = null;
            previousMessage = {};
            isIdle = true;
        }
        return;
    }
    if (delaySinceUpdate >= 2 * NORMAL_MESSAGE_DELAY) {
        currentMessage.scriptId = null;
    }

    let skipMessage = false;
    if (previousMessage.timeLeft >= currentMessage.timeLeft && ((1000 * (previousMessage.timeLeft - currentMessage.timeLeft) < 2 * NORMAL_MESSAGE_DELAY) || (previousMessage.timeLeft == LIVESTREAM_TIME_ID && currentMessage.timeLeft != LIVESTREAM_TIME_ID))) {
        skipMessage = true;
    }
    if (!(previousMessage.title == currentMessage.title && previousMessage.author == currentMessage.author && skipMessage)) {
        let dataObject = {
            "cppData": NMF.TITLE + currentMessage.title + NMF.AUTHOR + currentMessage.author + NMF.TIME_LEFT + Math.round(currentMessage.timeLeft) + NMF.END,
            "jsTitle": currentMessage.title,
            "jsAuthor": currentMessage.author,
            "jsTimeLeft": currentMessage.timeLeft,
            "jsVideoUrl": currentMessage.videoUrl,
            "jsChannelUrl": currentMessage.channelUrl,
            "jsPresenceSettings": {
                "enableVideoButton": settings.enableVideoButton,
                "enableChannelButton": settings.enableChannelButton,
                "enablePlayingIcon": settings.enablePlayingIcon,
                "addByAuthor": settings.addByAuthor
            },
            "jsApplicationType": currentMessage.applicationType
        };
        if (LOGGING) {
            console.log("Presence data:", dataObject);
        }
        nativePort.postMessage(dataObject);
    }
    previousMessage.title = currentMessage.title;
    previousMessage.author = currentMessage.author;
    previousMessage.timeLeft = currentMessage.timeLeft;
    isIdle = false;

}, NORMAL_MESSAGE_DELAY);

// EXTENSION UPDATE HANDLER

chrome.runtime.onUpdateAvailable.addListener(function (details) {
    console.log(`YTDP IS updating to ${details.version}`);
    chrome.runtime.reload();
});
