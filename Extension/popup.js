// MAIN VARIABLE INITIALIZATION

const LOGGING = true;

const TAB_SETTINGS_MESSAGE = "ENABLE ON THIS TAB";
const YOUTUBE_MAIN_URL = "https://www.youtube.com/";
const YOUTUBE_MUSIC_URL = "https://music.youtube.com/";

// GET CURRENT TAB

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    if (LOGGING) {
        console.log(tab);
    }
    return tab;
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

// HANDLE ON/OFF DISPLAY CHANGES

function handleOnOffDisplay(state, status, key) {
    if (state) {
        status.innerHTML = "ON";
        status.style.color = "#21db46";
    }
    else {
        status.innerHTML = "OFF";
        status.style.color = "#ff0000";
    }
    if (key != null) {
        saveKey(key, state);
    }
}

// SET KNOWN VALUES WHEN POP.JS IS OPENED

function handelDocumentLoading(tab) {
    let enabledLabel = document.getElementById("enabledLabel");
    let enableOnStartupLabel = document.getElementById("enableOnStartupLabel");
    let enableOnThisTabLabel = document.getElementById("enableOnThisTabLabel");
    chrome.storage.sync.get("enabled", function(result) {
        let status = enabledLabel.querySelector("span.switchStatus");
        let statusSwitch = enabledLabel.querySelector("label.switch > input");
        if (result.enabled) {
            statusSwitch.checked = "checked";
        }
        handleOnOffDisplay(result.enabled, status, null);
    });
    chrome.storage.sync.get("enableOnStartup", function(result) {
        let status = enableOnStartupLabel.querySelector("span.switchStatus");
        let statusSwitch = enableOnStartupLabel.querySelector("label.switch > input");
        if (result.enableOnStartup) {
            statusSwitch.checked = "checked";
        }
        handleOnOffDisplay(result.enableOnStartup, status, null);
    });
    if (tab.url.startsWith(YOUTUBE_MAIN_URL) || tab.url.startsWith(YOUTUBE_MUSIC_URL)) {
        let storageKey = "enableOnThisTab".concat(tab.id.toString());
        chrome.storage.sync.get(storageKey, function(result) {
            let status = enableOnThisTabLabel.querySelector("span.switchStatus");
            let statusSwitch = enableOnThisTabLabel.querySelector("label.switch > input");
            if (typeof result[storageKey] == "undefined" || result[storageKey] == true) {
                statusSwitch.checked = "checked";
                handleOnOffDisplay(true, status, storageKey);
            }
        });
    }
    else {
        let status = enableOnThisTabLabel.querySelector("span.switchStatus");
        let statusSwitchSpan = enableOnThisTabLabel.querySelector("label.switch");
        status.innerHTML = "DISABLED";
        status.style.color = "#545454";
        enableOnThisTabLabel.style.color = "#545454";
        enableOnThisTabLabel.removeChild(statusSwitchSpan);
    }
}

// HANDLE AN USER INTERACTIONS

function handleDocumentChanges(tab) {
    let enabledLabel = document.getElementById("enabledLabel");
    let enableOnStartupLabel = document.getElementById("enableOnStartupLabel");
    let enableOnThisTabLabel = document.getElementById("enableOnThisTabLabel");
    enabledLabel.querySelector("label.switch").addEventListener("change", function() {
        chrome.storage.sync.get("enabled", function(result) {
            let status = enabledLabel.querySelector("span.switchStatus");
            handleOnOffDisplay(status.innerHTML == "OFF", status, "enabled");
        });
    });
    enableOnStartupLabel.querySelector("label.switch").addEventListener("change", function() {
        chrome.storage.sync.get("enableOnStartup", function(result) {
            let status = enableOnStartupLabel.querySelector("span.switchStatus");
            handleOnOffDisplay(status.innerHTML == "OFF", status, "enableOnStartup");
        });
    });
    enableOnThisTabSwitchSpan = enableOnThisTabLabel.querySelector("label.switch");
    if (enableOnThisTabSwitchSpan) {
        enableOnThisTabSwitchSpan.addEventListener("change", function() {
            let status = enableOnThisTabLabel.querySelector("span.switchStatus");
            let storageKey = "enableOnThisTab".concat(tab.id.toString());
            chrome.runtime.sendMessage({
                messageType: TAB_SETTINGS_MESSAGE,
                tabId: tab.id,
                value: status.innerHTML == "OFF"
            }, (response) => {
                if (LOGGING) {
                    console.log("Message sent from popup.js to background.js");
                }
            })
            handleOnOffDisplay(status.innerHTML == "OFF", status, storageKey);
        });
    }
}

// PROGRAM ENTRY

window.onload = function() {
    getCurrentTab().then(tab => { 
        if (LOGGING) {
            console.log(tab.id);
            console.log(tab.url);
        } 
        let ytdpSettingsOutside = document.getElementById("ytdpSettingsOutside");
        let exclusionsOutside = document.getElementById("exclusionsOutside");
        let addExclusionsLabel = document.getElementById("addExclusionsLabel");
        let inclusionsOutside = document.getElementById("inclusionsOutside");
        let addInclusionsLabel = document.getElementById("addInclusionsLabel");
        handelDocumentLoading(tab);
        handleDocumentChanges(tab);
        addExclusionsLabel.onclick = function() {
            ytdpSettingsOutside.style.display = "none";
            exclusionsOutside.style.display = "flex";
        }
        addInclusionsLabel.onclick = function() {
            ytdpSettingsOutside.style.display = "none";
            inclusionsOutside.style.display = "flex";
        }
    }).catch(error => {
        console.error(error);
    });
}