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

// DISABLE ENABLE ON THIS TAB

function disableEnableOnThisTab(enableOnThisTabLabel) {
    let status = enableOnThisTabLabel.querySelector("span.switchStatus");
    status.innerHTML = "NOT AVAILABLE";
    status.style.color = "#545454";

    let statusSwitchLabel = enableOnThisTabLabel.querySelector("label.switch")
    enableOnThisTabLabel.style.color = "#545454";
    statusSwitchLabel.style.display = "none";
}

// SET KNOWN VALUES WHEN POP.JS IS OPENED

function handelDocumentLoading(tab) {
    let enabledLabel = document.getElementById("enabledLabel");
    chrome.storage.sync.get("enabled", function(result) {
        let status = enabledLabel.querySelector("span.switchStatus");
        let statusSwitch = enabledLabel.querySelector("label.switch > input");
        if (result.enabled) {
            statusSwitch.checked = "checked";
        }
        handleOnOffDisplay(result.enabled, status, null);
    });

    let enableOnStartupLabel = document.getElementById("enableOnStartupLabel");
    chrome.storage.sync.get("enableOnStartup", function(result) {
        let status = enableOnStartupLabel.querySelector("span.switchStatus");
        let statusSwitch = enableOnStartupLabel.querySelector("label.switch > input");
        if (result.enableOnStartup) {
            statusSwitch.checked = "checked";
        }
        handleOnOffDisplay(result.enableOnStartup, status, null);
    });

    let enableOnThisTabLabel = document.getElementById("enableOnThisTabLabel");
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
        disableEnableOnThisTab(enableOnThisTabLabel);
    }

    let enableExclusionsLabel = document.getElementById("enableExclusionsLabel");
    chrome.storage.sync.get("enableExclusions", function(result) {
        let status = enableExclusionsLabel.querySelector("span.switchStatus");
        let statusSwitch = enableExclusionsLabel.querySelector("label.switch > input");
        if (result.enableExclusions) {
            statusSwitch.checked = "checked";
        }
        handleOnOffDisplay(result.enableExclusions, status, null);
    });
}

// HANDLE AN USER INTERACTIONS

function handleMainChanges(tab) {
    let enabledLabel = document.getElementById("enabledLabel");
    enabledLabel.querySelector("label.switch").addEventListener("change", function() {
        chrome.storage.sync.get("enabled", function(result) {
            let status = enabledLabel.querySelector("span.switchStatus");
            handleOnOffDisplay(status.innerHTML == "OFF", status, "enabled");
        });
    });

    let enableOnStartupLabel = document.getElementById("enableOnStartupLabel");
    enableOnStartupLabel.querySelector("label.switch").addEventListener("change", function() {
        chrome.storage.sync.get("enableOnStartup", function(result) {
            let status = enableOnStartupLabel.querySelector("span.switchStatus");
            handleOnOffDisplay(status.innerHTML == "OFF", status, "enableOnStartup");
        });
    });

    let enableOnThisTabLabel = document.getElementById("enableOnThisTabLabel");
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
                    console.log("Message sent from popup.js to background.js [value]: ", status.innerHTML == "OFF");
                }
            })
            handleOnOffDisplay(status.innerHTML == "OFF", status, storageKey);
        });
    }
}

// CHECK IF ITEM IS ALREADY EXCLUDED

function alreadyExcluded(text) {
    let exclusionsList = document.getElementById("titleExclusionsBody").querySelector("ul");
    for (let i = 0; i < exclusionsList.children.length; ++i) {
        for (let j = 0; j < exclusionsList.children[i].childNodes.length; ++j) {
            if (exclusionsList.children[i].childNodes[j].nodeType == Node.TEXT_NODE && text == exclusionsList.children[i].childNodes[j].textContent) {
                return true;
            }
        }
    }
    return false;
}

// HANDLE EXCLUSIONS CHANGES

function handleExclusionsChanges() {
    let ytdpSettingsOutside = document.getElementById("ytdpSettingsOutside");
    let exclusionsOutside = document.getElementById("exclusionsOutside");
    let addExclusionsLabel = document.getElementById("addExclusionsLabel");

    addExclusionsLabel.onclick = function() {
        ytdpSettingsOutside.style.display = "none";
        exclusionsOutside.style.display = "flex";
    }

    let enableExclusionsLabel = document.getElementById("enableExclusionsLabel");
    enableExclusionsLabel.querySelector("label.switch").addEventListener("change", function() {
        chrome.storage.sync.get("enableExclusionsLabel", function(result) {
            let status = enableExclusionsLabel.querySelector("span.switchStatus");
            handleOnOffDisplay(status.innerHTML == "OFF", status, "enableExclusions");
        });
    });

    let returnFromExclusionsLabel = document.getElementById("returnFromExclusionsLabel");
    returnFromExclusionsLabel.onclick = function() {
        ytdpSettingsOutside.style.display = "flex";
        exclusionsOutside.style.display = "none";
    }

    let root = document.querySelector(":root");
    let titleExclusionsInputForm = document.getElementById("titleExclusionsInput");
    let titleExclusionsInputField = titleExclusionsInputForm.querySelector("input");
    titleExclusionsInputField.addEventListener("input", function(temp) {
        if (titleExclusionsInputField.value && !alreadyExcluded(titleExclusionsInputField.value)) {
            root.style.setProperty("--titleExclusionsInputButtonBackgroundColor", "rgb(35, 155, 77)");
            root.style.setProperty("--titleExclusionsInputButtonTextColor", "rgb(210, 210, 210)");
            root.style.setProperty("--titleExclusionsInputButtonBackgroundColorHover", "rgb(35, 180, 77)");
        }
        else {
            root.style.setProperty("--titleExclusionsInputButtonBackgroundColor", "rgb(60, 60, 60)");
            root.style.setProperty("--titleExclusionsInputButtonTextColor", "rgb(90, 90, 90)");
            root.style.setProperty("--titleExclusionsInputButtonBackgroundColorHover", "rgb(60, 60, 60)");
        }
    });

    let titleExclusionsInputButton = titleExclusionsInputForm.querySelector("span");
    let exclusionsList = document.getElementById("titleExclusionsBody").querySelector("ul");
    titleExclusionsInputButton.onclick = function() {
        if (!titleExclusionsInputField.value || alreadyExcluded(titleExclusionsInputField.value)) {
            return;
        }

        let entry = document.createElement("li");
        let removeButton = document.createElement("div");
        entry.appendChild(document.createTextNode(titleExclusionsInputField.value));
        entry.setAttribute("id", "exclusion_" + titleExclusionsInputField.value);
        removeButton.appendChild(document.createTextNode("REMOVE"));
        removeButton.classList.add("removeExclusionButton");
        removeButton.setAttribute("id", "removeExclusion_" + titleExclusionsInputField.value);
        
        entry.appendChild(removeButton);
        exclusionsList.appendChild(entry);

        titleExclusionsInputField.value = "";
        root.style.setProperty("--titleExclusionsInputButtonBackgroundColor", "rgb(60, 60, 60)");
        root.style.setProperty("--titleExclusionsInputButtonTextColor", "rgb(90, 90, 90)");
        root.style.setProperty("--titleExclusionsInputButtonBackgroundColorHover", "rgb(60, 60, 60)");
    }

    exclusionsList.addEventListener("click", function(element) {
        if (element.target.className == "removeExclusionButton") {
            console.log(element.target.id.substring(16));
            let entry = document.getElementById("exclusion_" + element.target.id.substring(16));
            entry.remove();
        }
    });
}

// HANDLE INCLUSIONS CHANGES

function handleInclusionsChanges() {
    let ytdpSettingsOutside = document.getElementById("ytdpSettingsOutside");
    let inclusionsOutside = document.getElementById("inclusionsOutside");
    let addInclusionsLabel = document.getElementById("addInclusionsLabel");

    addInclusionsLabel.onclick = function() {
        ytdpSettingsOutside.style.display = "none";
        inclusionsOutside.style.display = "flex";
    }
}

// PROGRAM ENTRY

window.onload = function() {
    getCurrentTab().then(tab => { 
        if (LOGGING) {
            console.log(tab.id);
            console.log(tab.url);
        } 

        handelDocumentLoading(tab);
        handleMainChanges(tab);
        handleExclusionsChanges();
        handleInclusionsChanges();
    }).catch(error => {
        console.error(error);
    });
}