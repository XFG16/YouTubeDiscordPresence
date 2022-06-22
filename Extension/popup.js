// ==================================
// SECTION 1: VARIABLE INITIALIZATION
// ==================================

// CONSTANTS/LOGGING

const LOGGING = true;

const YOUTUBE_MAIN_URL = "https://www.youtube.com/";
const YOUTUBE_MUSIC_URL = "https://music.youtube.com/";

// ==================
// SECTION 2: MODULES
// ==================

// GET CURRENT TAB BASED ON WHERE THE POPUP WAS OPENED

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    if (LOGGING) {
        console.log(tab);
    }
    return tab;
}

// HANDLE STORAGE KEY SAVING

function saveStorageKey(key, value) {
    let saveObject = new Object();
    saveObject[key] = value;
    chrome.storage.sync.set(saveObject, function() {
        if (LOGGING) {
            console.log(key + " (saved): ", value);
        }
    });
}

// HANDLE ON/OFF DISPLAY CHANGES FOR SWITCHES

function handleSwitchStatusAndStorage(state, status, key) {
    if (state) { // STATE IS EITHER TRUE (THIS SETTING GOT ENABLED) OR FALSE (THIS SETTING GOT DISABLED)
        status.innerHTML = "ON";
        status.style.color = "#21db46";
    }
    else {
        status.innerHTML = "OFF";
        status.style.color = "#ff0000";
    }
    if (key != null) {
        saveStorageKey(key, state);
    }
}

// CHECK IF ITEM IS ALREADY EXCLUDED

function isAlreadyExcluded(text) {
    let titleExclusionsList = document.getElementById("titleExclusionsBody").querySelector("ul");
    for (let i = 0; i < titleExclusionsList.children.length; ++i) {
        for (let j = 0; j < titleExclusionsList.children[i].childNodes.length; ++j) {
            if (titleExclusionsList.children[i].childNodes[j].nodeType == Node.TEXT_NODE && text == titleExclusionsList.children[i].childNodes[j].textContent) {
                return true;
            }
        }
    }
    return false;
}

// ADD VIDEO EXCLUSION FUNCTION

function addVideoExclusion(text, isDocumentInitializing) {
    let entry = document.createElement("li");
    let removeButton = document.createElement("div");
    let titleExclusionsList = document.getElementById("titleExclusionsBody").querySelector("ul");

    entry.appendChild(document.createTextNode(text));
    entry.setAttribute("id", "exclusion_" + text);
    removeButton.appendChild(document.createTextNode("REMOVE"));
    removeButton.classList.add("removeExclusionButton");
    removeButton.setAttribute("id", "removeExclusion_" + text);
        
    entry.appendChild(removeButton);
    titleExclusionsList.appendChild(entry);

    if (!isDocumentInitializing) {
        chrome.storage.sync.get("titleExclusionsList", function(result) {
            let newExclusionsList = result.titleExclusionsList;
            if (newExclusionsList && newExclusionsList.indexOf(text) == -1) {
                newExclusionsList.push(text);
                saveStorageKey("titleExclusionsList", newExclusionsList);
            }
        });
    }
}

// =======================================
// SECTION 3: DOCUMENT DISPLAY/INTERACTION
// =======================================

// SET KNOWN VALUES WHEN POP.JS IS INITIALIZED

function initializeDocument(tab) {
    // OVERALL EXTENSION ENABLED
    let enabledLabel = document.getElementById("enabledLabel");
    chrome.storage.sync.get("enabled", function(result) {
        let status = enabledLabel.querySelector("span.switchStatus");
        let statusSwitch = enabledLabel.querySelector("label.switch > input");
        if (result.enabled) {
            statusSwitch.checked = "checked";
        }
        handleSwitchStatusAndStorage(result.enabled, status, null);
    });

    // ENABLE EXTENSION ON STARTUP
    let enableOnStartupLabel = document.getElementById("enableOnStartupLabel");
    chrome.storage.sync.get("enableOnStartup", function(result) {
        let status = enableOnStartupLabel.querySelector("span.switchStatus");
        let statusSwitch = enableOnStartupLabel.querySelector("label.switch > input");
        if (result.enableOnStartup) {
            statusSwitch.checked = "checked";
        }
        handleSwitchStatusAndStorage(result.enableOnStartup, status, null);
    });

    // ENABLE EXTENSION ON CURRENT TAB
    let enableOnThisTabLabel = document.getElementById("enableOnThisTabLabel");
    if (tab.url.startsWith(YOUTUBE_MAIN_URL) || tab.url.startsWith(YOUTUBE_MUSIC_URL)) {
        chrome.storage.sync.get("tabEnabledList", function(result) {
            let status = enableOnThisTabLabel.querySelector("span.switchStatus");
            let statusSwitch = enableOnThisTabLabel.querySelector("label.switch > input");
            let newTabEnabledList = result.tabEnabledList;
            if (newTabEnabledList[tab.id] == undefined) {
                newTabEnabledList[tab.id] = true;
            }
            if (newTabEnabledList[tab.id] == true) {
                statusSwitch.checked = "checked";
                handleSwitchStatusAndStorage(true, status, null);
                saveStorageKey("tabEnabledList", newTabEnabledList);
            }
        });
    }
    else { // REMOVE ABILITY TO INTERACT WITH [ENABLE ON THIS TAB] IF TAB IS NOT YOUTUBE OR YOUTUBE MUSIC
        let status = enableOnThisTabLabel.querySelector("span.switchStatus");
        status.innerHTML = "NOT AVAILABLE";
        status.style.color = "#545454";
        let statusSwitchLabel = enableOnThisTabLabel.querySelector("label.switch")
        enableOnThisTabLabel.style.color = "#545454";
        statusSwitchLabel.style.display = "none";
    }

    // ENABLE VIDEO/CHANNEL EXCLUSIONS
    let enableExclusionsLabel = document.getElementById("enableExclusionsLabel");
    chrome.storage.sync.get("enableExclusions", function(result) {
        let status = enableExclusionsLabel.querySelector("span.switchStatus");
        let statusSwitch = enableExclusionsLabel.querySelector("label.switch > input");
        if (result.enableExclusions) {
            statusSwitch.checked = "checked";
        }
        handleSwitchStatusAndStorage(result.enableExclusions, status, null);
    });

    // LIST TITLE EXCLUSIONS
    chrome.storage.sync.get("titleExclusionsList", function(result) {
        for (let i = 0; i < result.titleExclusionsList.length; ++i) {
            addVideoExclusion(result.titleExclusionsList[i], true);
        }
    });
}

// HANDLE USER INTERACTIONS ON MAIN PAGE

function handleMainChanges(tab) {
    // OVERALL EXTENSION ENABLED
    let enabledLabel = document.getElementById("enabledLabel");
    enabledLabel.querySelector("label.switch").addEventListener("change", function() {
        chrome.storage.sync.get("enabled", function(result) {
            let status = enabledLabel.querySelector("span.switchStatus");
            handleSwitchStatusAndStorage(status.innerHTML == "OFF", status, "enabled");
        });
    });

    // ENABLE EXTENSION ON STARTUP
    let enableOnStartupLabel = document.getElementById("enableOnStartupLabel");
    enableOnStartupLabel.querySelector("label.switch").addEventListener("change", function() {
        chrome.storage.sync.get("enableOnStartup", function(result) {
            let status = enableOnStartupLabel.querySelector("span.switchStatus");
            handleSwitchStatusAndStorage(status.innerHTML == "OFF", status, "enableOnStartup");
        });
    });

    // ENABLE EXTENSION ON CURRENT TAB
    let enableOnThisTabLabel = document.getElementById("enableOnThisTabLabel");
    enableOnThisTabLabel.querySelector("label.switch").addEventListener("change", function() {
        chrome.storage.sync.get("tabEnabledList", function(result) {
            let status = enableOnThisTabLabel.querySelector("span.switchStatus");
            let newTabEnabledList = result.tabEnabledList;
            newTabEnabledList[tab.id] = (status.innerHTML == "OFF"); // THIS FUNCTION HAS TO COME FIRST, BECAUSE handleSwitchStatusAndStorage CHANGES THE INNERHTML
            saveStorageKey("tabEnabledList", newTabEnabledList);
            handleSwitchStatusAndStorage(status.innerHTML == "OFF", status, null);
        });
    });
}

// HANDLE CHANGES TO EXCLUSIONS SECTION

function handleExclusionsChanges() {
    // CHANGE PAGE FROM MAIN TO EXCLUSIONS WHEN CLICKED
    let ytdpSettingsOutside = document.getElementById("ytdpSettingsOutside");
    let exclusionsOutside = document.getElementById("exclusionsOutside");
    let addExclusionsLabel = document.getElementById("addExclusionsLabel");
    addExclusionsLabel.onclick = function() {
        ytdpSettingsOutside.style.display = "none";
        exclusionsOutside.style.display = "flex";
    }

    // EXCLUSIONS ENABLING
    let enableExclusionsLabel = document.getElementById("enableExclusionsLabel");
    enableExclusionsLabel.querySelector("label.switch").addEventListener("change", function() {
        chrome.storage.sync.get("enableExclusionsLabel", function(result) {
            let status = enableExclusionsLabel.querySelector("span.switchStatus");
            handleSwitchStatusAndStorage(status.innerHTML == "OFF", status, "enableExclusions");
        });
    });

    // X BUTTON TO RETURN BACK TO MAIN PAGE
    let returnFromExclusionsLabel = document.getElementById("returnFromExclusionsLabel");
    returnFromExclusionsLabel.onclick = function() {
        ytdpSettingsOutside.style.display = "flex";
        exclusionsOutside.style.display = "none";
    }

    // ADD EXCLUSION BUTTON COLOR HANDLING
    let root = document.querySelector(":root");
    let titleExclusionsInputForm = document.getElementById("titleExclusionsInput");
    let titleExclusionsInputField = titleExclusionsInputForm.querySelector("input");
    titleExclusionsInputField.addEventListener("input", function(temp) {
        if (titleExclusionsInputField.value && !isAlreadyExcluded(titleExclusionsInputField.value)) {
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

    // ADD EXCLUSION WHEN ADD BUTTON IS CLICKED
    let titleExclusionsInputButton = titleExclusionsInputForm.querySelector("span");
    titleExclusionsInputButton.onclick = function() {
        if (!titleExclusionsInputField.value || isAlreadyExcluded(titleExclusionsInputField.value)) {
            return;
        };
        addVideoExclusion(titleExclusionsInputField.value, false);
        titleExclusionsInputField.value = "";
        root.style.setProperty("--titleExclusionsInputButtonBackgroundColor", "rgb(60, 60, 60)");
        root.style.setProperty("--titleExclusionsInputButtonTextColor", "rgb(90, 90, 90)");
        root.style.setProperty("--titleExclusionsInputButtonBackgroundColorHover", "rgb(60, 60, 60)");
    }

    // HANDLE ANY EXCLUSION REMOVALS
    let titleExclusionsList = document.getElementById("titleExclusionsBody").querySelector("ul");
    titleExclusionsList.addEventListener("click", function(element) {
        if (element.target.className == "removeExclusionButton") {
            let exclusion = element.target.id.substring(16);
            chrome.storage.sync.get("titleExclusionsList", function(result) {
                let newExclusionsList = result.titleExclusionsList;
                let exclusionIndex = newExclusionsList.indexOf(exclusion);
                if (exclusionIndex > -1) {
                    newExclusionsList.splice(exclusionIndex, 1);
                }
                saveStorageKey("titleExclusionsList", newExclusionsList);
            });
            let entry = document.getElementById("exclusion_" + exclusion);
            entry.remove();
        }
    });
}

// HANDLE CHANGES TO INCLUSIONS SECTION

function handleInclusionsChanges() {
    let ytdpSettingsOutside = document.getElementById("ytdpSettingsOutside");
    let inclusionsOutside = document.getElementById("inclusionsOutside");
    let addInclusionsLabel = document.getElementById("addInclusionsLabel");

    addInclusionsLabel.onclick = function() {
        ytdpSettingsOutside.style.display = "none";
        inclusionsOutside.style.display = "flex";
    }
}

// ========================
// SECTION 4: PROGRAM ENTRY
// ========================

// LOAD DOCUMENT WHEN ALL ELEMENTS ARE READY

window.onload = function() {
    getCurrentTab().then(tab => { 
        if (LOGGING) {
            console.log(tab.id);
            console.log(tab.url);
        } 
        initializeDocument(tab);
        handleMainChanges(tab);
        handleExclusionsChanges();
        handleInclusionsChanges();
    }).catch(error => {
        console.error(error);
    });
}