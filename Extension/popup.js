// ==================================
// SECTION 1: VARIABLE INITIALIZATION
// ==================================

// CONSTANTS/LOGGING

const LOGGING = true;

const YOUTUBE_MAIN_URL = "https://www.youtube.com/";
const YOUTUBE_MUSIC_URL = "https://music.youtube.com/";

const VIDEO_EXCLUSION_KEY = "videoExclusion_";
const VIDEO_EXCLUSION_REMOVE_KEY = "removeVideoExclusion_";
const KEYWORD_EXCLUSION_KEY = "keywordExclusion_";
const KEYWORD_EXCLUSION_REMOVE_KEY = "removeKeywordExclusion_";

const VIDEO_INCLUSION_KEY = "videoInclusion_";
const VIDEO_INCLUSION_REMOVE_KEY = "removeVideoInclusion_";
const KEYWORD_INCLUSION_KEY = "keywordInclusion_";
const KEYWORD_INCLUSION_REMOVE_KEY = "removeKeywordInclusion_";

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

// CHECK IF ITEM IS ALREADY EXCLUDED OR INCLUDED

function isAlreadyInList(text, key) {
    let ieList = document.getElementById(key);
    for (let i = 0; i < ieList.children.length; ++i) {
        for (let j = 0; j < ieList.children[i].childNodes.length; ++j) {
            if (ieList.children[i].childNodes[j].nodeType == Node.TEXT_NODE && text == ieList.children[i].childNodes[j].textContent) {
                return true;
            }
        }
    }
    return false;
}

// CREATE INCLUSION/EXCLUSION HTML

function createListHtml(text, mainKey, removeKey) {
    let entry = document.createElement("li");
    let removeButton = document.createElement("div");

    removeButton.appendChild(document.createTextNode("REMOVE"));
    removeButton.classList.add("removeIeButton");
    removeButton.setAttribute("id", removeKey + text);    

    entry.setAttribute("id", mainKey + text);
    entry.appendChild(document.createTextNode(text));
    entry.appendChild(removeButton);

    return entry;
}

// ADD INCLUSION OR EXCLUSION FUNCTION

function addIeElement(text, key, isDocumentInitializing) {
    let ieList = document.getElementById(key);
    if (key == "videoExclusionsList") {
        ieList.appendChild(createListHtml(text, VIDEO_EXCLUSION_KEY, VIDEO_EXCLUSION_REMOVE_KEY));
    }
    else if (key == "keywordExclusionsList") {
        ieList.appendChild(createListHtml(text, KEYWORD_EXCLUSION_KEY, KEYWORD_EXCLUSION_REMOVE_KEY));
    }
    else if (key == "videoInclusionsList") {
        ieList.appendChild(createListHtml(text, VIDEO_INCLUSION_KEY, VIDEO_INCLUSION_REMOVE_KEY));
    }
    else if (key == "keywordInclusionsList") {
        ieList.appendChild(createListHtml(text, KEYWORD_INCLUSION_KEY, KEYWORD_INCLUSION_REMOVE_KEY));
    }
    if (!isDocumentInitializing) {
        chrome.storage.sync.get(key, function(result) {
            let newIeList = result[key];
            if (newIeList && newIeList.indexOf(text) == -1) {
                newIeList.push(text);
                saveStorageKey(key, newIeList);
            }
        });
    }
}

// ==================================================
// SECTION 3: DOCUMENT INITIALIZATION AND INTERACTION
// ==================================================

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

    // ENABLE VIDEO/KEYWORD EXCLUSIONS
    let enableExclusionsLabel = document.getElementById("enableExclusionsLabel");
    chrome.storage.sync.get("enableExclusions", function(result) {
        let status = enableExclusionsLabel.querySelector("span.switchStatus");
        let statusSwitch = enableExclusionsLabel.querySelector("label.switch > input");
        if (result.enableExclusions) {
            statusSwitch.checked = "checked";
        }
        handleSwitchStatusAndStorage(result.enableExclusions, status, null);
    });

    // ENABLE VIDEO/KEYWORD INCLUSIONS
    let enableInclusionsLabel = document.getElementById("enableInclusionsLabel");
    chrome.storage.sync.get("enableInclusions", function(result) {
        let status = enableInclusionsLabel.querySelector("span.switchStatus");
        let statusSwitch = enableInclusionsLabel.querySelector("label.switch > input");
        if (result.enableInclusions) {
            statusSwitch.checked = "checked";
        }
        handleSwitchStatusAndStorage(result.enableInclusions, status, null);
    });

    // LIST VIDEO EXCLUSIONS
    chrome.storage.sync.get("videoExclusionsList", function(result) {
        for (let i = 0; i < result.videoExclusionsList.length; ++i) {
            addIeElement(result.videoExclusionsList[i], "videoExclusionsList", true);
        }
    });

    // LIST KEYWORD EXCLUSIONS
    chrome.storage.sync.get("keywordExclusionsList", function(result) {
        for (let i = 0; i < result.keywordExclusionsList.length; ++i) {
            addIeElement(result.keywordExclusionsList[i], "keywordExclusionsList", true);
        }
    })

    // LIST VIDEO INCLUSIONS
    chrome.storage.sync.get("videoInclusionsList", function(result) {
        for (let i = 0; i < result.videoInclusionsList.length; ++i) {
            addIeElement(result.videoInclusionsList[i], "videoInclusionsList", true);
        }
    });

    // LIST KEYWORD INCLUSIONS
    chrome.storage.sync.get("keywordInclusionsList", function(result) {
        for (let i = 0; i < result.keywordInclusionsList.length; ++i) {
            addIeElement(result.keywordInclusionsList[i], "keywordInclusionsList", true);
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
        let status = enableExclusionsLabel.querySelector("span.switchStatus");
        handleSwitchStatusAndStorage(status.innerHTML == "OFF", status, "enableExclusions");
    });

    // X BUTTON TO RETURN BACK TO MAIN PAGE FROM EXCLUSIONS
    let returnFromExclusionsLabel = document.getElementById("returnFromExclusionsLabel");
    returnFromExclusionsLabel.onclick = function() {
        ytdpSettingsOutside.style.display = "flex";
        exclusionsOutside.style.display = "none";
    }

    // ADD VIDEO EXCLUSION BUTTON COLOR HANDLING
    let root = document.querySelector(":root");
    let videoExclusionsInputForm = document.getElementById("videoExclusionsInput");
    let videoExclusionsInputField = videoExclusionsInputForm.querySelector("input");
    videoExclusionsInputField.addEventListener("input", function(temp) {
        if (videoExclusionsInputField.value && !isAlreadyInList(videoExclusionsInputField.value, "videoExclusionsList")) {
            root.style.setProperty("--videoExclusionsInputButtonBackgroundColor", "rgb(35, 155, 77)");
            root.style.setProperty("--videoExclusionsInputButtonTextColor", "rgb(210, 210, 210)");
            root.style.setProperty("--videoExclusionsInputButtonBackgroundColorHover", "rgb(35, 180, 77)");
        }
        else {
            root.style.setProperty("--videoExclusionsInputButtonBackgroundColor", "rgb(60, 60, 60)");
            root.style.setProperty("--videoExclusionsInputButtonTextColor", "rgb(90, 90, 90)");
            root.style.setProperty("--videoExclusionsInputButtonBackgroundColorHover", "rgb(60, 60, 60)");
        }
    });

    // ADD VIDEO EXCLUSION WHEN ADD BUTTON IS CLICKED
    let videoExclusionsInputButton = videoExclusionsInputForm.querySelector("span");
    videoExclusionsInputButton.onclick = function() {
        if (!videoExclusionsInputField.value || isAlreadyInList(videoExclusionsInputField.value, "videoExclusionsList")) {
            return;
        };
        addIeElement(videoExclusionsInputField.value, "videoExclusionsList", false);
        videoExclusionsInputField.value = "";
        root.style.setProperty("--videoExclusionsInputButtonBackgroundColor", "rgb(60, 60, 60)");
        root.style.setProperty("--videoExclusionsInputButtonTextColor", "rgb(90, 90, 90)");
        root.style.setProperty("--videoExclusionsInputButtonBackgroundColorHover", "rgb(60, 60, 60)");
    }

    // HANDLE ANY VIDEO EXCLUSION REMOVALS
    let videoExclusionsList = document.getElementById("videoExclusionsList");
    videoExclusionsList.addEventListener("click", function(element) {
        if (element.target.className == "removeIeButton") {
            let exclusion = element.target.id.substring(VIDEO_EXCLUSION_REMOVE_KEY.length);
            chrome.storage.sync.get("videoExclusionsList", function(result) {
                let newExclusionsList = result.videoExclusionsList;
                let exclusionIndex = newExclusionsList.indexOf(exclusion);
                if (exclusionIndex > -1) {
                    newExclusionsList.splice(exclusionIndex, 1);
                }
                saveStorageKey("videoExclusionsList", newExclusionsList);
            });
            let entry = document.getElementById(VIDEO_EXCLUSION_KEY + exclusion);
            entry.remove();
        }
    });

    // ADD KEYWORD EXCLUSION BUTTON COLOR HANDLING
    let keywordExclusionsInputForm = document.getElementById("keywordExclusionsInput");
    let keywordExclusionsInputField = keywordExclusionsInputForm.querySelector("input");
    keywordExclusionsInputField.addEventListener("input", function(temp) {
        if (keywordExclusionsInputField.value && !isAlreadyInList(keywordExclusionsInputField.value, "keywordExclusionsList")) {
            root.style.setProperty("--keywordExclusionsInputButtonBackgroundColor", "rgb(35, 155, 77)");
            root.style.setProperty("--keywordExclusionsInputButtonTextColor", "rgb(210, 210, 210)");
            root.style.setProperty("--keywordExclusionsInputButtonBackgroundColorHover", "rgb(35, 180, 77)");
        }
        else {
            root.style.setProperty("--keywordExclusionsInputButtonBackgroundColor", "rgb(60, 60, 60)");
            root.style.setProperty("--keywordExclusionsInputButtonTextColor", "rgb(90, 90, 90)");
            root.style.setProperty("--keywordExclusionsInputButtonBackgroundColorHover", "rgb(60, 60, 60)");
        }
    });

    // ADD KEYWORD EXCLUSION WHEN ADD BUTTON IS CLICKED
    let keywordExclusionsInputButton = keywordExclusionsInputForm.querySelector("span");
    keywordExclusionsInputButton.onclick = function() {
        if (!keywordExclusionsInputField.value || isAlreadyInList(keywordExclusionsInputField.value, "keywordExclusionsList")) {
            return;
        };
        addIeElement(keywordExclusionsInputField.value, "keywordExclusionsList", false);
        keywordExclusionsInputField.value = "";
        root.style.setProperty("--keywordExclusionsInputButtonBackgroundColor", "rgb(60, 60, 60)");
        root.style.setProperty("--keywordExclusionsInputButtonTextColor", "rgb(90, 90, 90)");
        root.style.setProperty("--keywordExclusionsInputButtonBackgroundColorHover", "rgb(60, 60, 60)");
    }

    // HANDLE ANY KEYWORD EXCLUSION REMOVALS
    let keywordExclusionsList = document.getElementById("keywordExclusionsList");
    keywordExclusionsList.addEventListener("click", function(element) {
        if (element.target.className == "removeIeButton") {
            let exclusion = element.target.id.substring(KEYWORD_EXCLUSION_REMOVE_KEY.length);
            chrome.storage.sync.get("keywordExclusionsList", function(result) {
                let newExclusionsList = result.keywordExclusionsList;
                let exclusionIndex = newExclusionsList.indexOf(exclusion);
                if (exclusionIndex > -1) {
                    newExclusionsList.splice(exclusionIndex, 1);
                }
                saveStorageKey("keywordExclusionsList", newExclusionsList);
            });
            let entry = document.getElementById(KEYWORD_EXCLUSION_KEY + exclusion);
            entry.remove();
        }
    });
}

// HANDLE CHANGES TO INCLUSIONS SECTION

function handleInclusionsChanges() {
    // CHANGE PAGE FROM MAIN TO INCLUSIONS WHEN CLICKED
    let ytdpSettingsOutside = document.getElementById("ytdpSettingsOutside");
    let inclusionsOutside = document.getElementById("inclusionsOutside");
    let addInclusionsLabel = document.getElementById("addInclusionsLabel");
    addInclusionsLabel.onclick = function() {
        ytdpSettingsOutside.style.display = "none";
        inclusionsOutside.style.display = "flex";
    }

    // INCLUSIONS ENABLING
    let enableInclusionsLabel = document.getElementById("enableInclusionsLabel");
    enableInclusionsLabel.querySelector("label.switch").addEventListener("change", function() {
        let status = enableInclusionsLabel.querySelector("span.switchStatus");
        handleSwitchStatusAndStorage(status.innerHTML == "OFF", status, "enableInclusions");
    });

    // X BUTTON TO RETURN BACK TO MAIN PAGE FROM INCLUSIONS
    let returnFromInclusionsLabel = document.getElementById("returnFromInclusionsLabel");
    returnFromInclusionsLabel.onclick = function() {
        ytdpSettingsOutside.style.display = "flex";
        inclusionsOutside.style.display = "none";
    }

    // ADD VIDEO INCLUSION BUTTON COLOR HANDLING
    let root = document.querySelector(":root");
    let videoInclusionsInputForm = document.getElementById("videoInclusionsInput");
    let videoInclusionsInputField = videoInclusionsInputForm.querySelector("input");
    videoInclusionsInputField.addEventListener("input", function(temp) {
        if (videoInclusionsInputField.value && !isAlreadyInList(videoInclusionsInputField.value, "videoInclusionsList")) {
            root.style.setProperty("--videoInclusionsInputButtonBackgroundColor", "rgb(35, 155, 77)");
            root.style.setProperty("--videoInclusionsInputButtonTextColor", "rgb(210, 210, 210)");
            root.style.setProperty("--videoInclusionsInputButtonBackgroundColorHover", "rgb(35, 180, 77)");
        }
        else {
            root.style.setProperty("--videoInclusionsInputButtonBackgroundColor", "rgb(60, 60, 60)");
            root.style.setProperty("--videoInclusionsInputButtonTextColor", "rgb(90, 90, 90)");
            root.style.setProperty("--videoInclusionsInputButtonBackgroundColorHover", "rgb(60, 60, 60)");
        }
    });

    // ADD VIDEO INCLUSION WHEN ADD BUTTON IS CLICKED
    let videoInclusionsInputButton = videoInclusionsInputForm.querySelector("span");
    videoInclusionsInputButton.onclick = function() {
        if (!videoInclusionsInputField.value || isAlreadyInList(videoInclusionsInputField.value, "videoInclusionsList")) {
            return;
        };
        addIeElement(videoInclusionsInputField.value, "videoInclusionsList", false);
        videoInclusionsInputField.value = "";
        root.style.setProperty("--videoInclusionsInputButtonBackgroundColor", "rgb(60, 60, 60)");
        root.style.setProperty("--videoInclusionsInputButtonTextColor", "rgb(90, 90, 90)");
        root.style.setProperty("--videoInclusionsInputButtonBackgroundColorHover", "rgb(60, 60, 60)");
    }

    // HANDLE ANY VIDEO INCLUSION REMOVALS
    let videoInclusionsList = document.getElementById("videoInclusionsList");
    videoInclusionsList.addEventListener("click", function(element) {
        if (element.target.className == "removeIeButton") {
            let inclusion = element.target.id.substring(VIDEO_INCLUSION_REMOVE_KEY.length);
            chrome.storage.sync.get("videoInclusionsList", function(result) {
                let newInclusionsList = result.videoInclusionsList;
                let inclusionIndex = newInclusionsList.indexOf(inclusion);
                if (inclusionIndex > -1) {
                    newInclusionsList.splice(inclusionIndex, 1);
                }
                saveStorageKey("videoInclusionsList", newInclusionsList);
            });
            let entry = document.getElementById(VIDEO_INCLUSION_KEY + inclusion);
            entry.remove();
        }
    });

    // ADD KEYWORD INCLUSION BUTTON COLOR HANDLING
    let keywordInclusionsInputForm = document.getElementById("keywordInclusionsInput");
    let keywordInclusionsInputField = keywordInclusionsInputForm.querySelector("input");
    keywordInclusionsInputField.addEventListener("input", function(temp) {
        if (keywordInclusionsInputField.value && !isAlreadyInList(keywordInclusionsInputField.value, "keywordInclusionsList")) {
            root.style.setProperty("--keywordInclusionsInputButtonBackgroundColor", "rgb(35, 155, 77)");
            root.style.setProperty("--keywordInclusionsInputButtonTextColor", "rgb(210, 210, 210)");
            root.style.setProperty("--keywordInclusionsInputButtonBackgroundColorHover", "rgb(35, 180, 77)");
        }
        else {
            root.style.setProperty("--keywordInclusionsInputButtonBackgroundColor", "rgb(60, 60, 60)");
            root.style.setProperty("--keywordInclusionsInputButtonTextColor", "rgb(90, 90, 90)");
            root.style.setProperty("--keywordInclusionsInputButtonBackgroundColorHover", "rgb(60, 60, 60)");
        }
    });

    // ADD KEYWORD INCLUSION WHEN ADD BUTTON IS CLICKED
    let keywordInclusionsInputButton = keywordInclusionsInputForm.querySelector("span");
    keywordInclusionsInputButton.onclick = function() {
        if (!keywordInclusionsInputField.value || isAlreadyInList(keywordInclusionsInputField.value, "keywordInclusionsList")) {
            return;
        };
        addIeElement(keywordInclusionsInputField.value, "keywordInclusionsList", false);
        keywordInclusionsInputField.value = "";
        root.style.setProperty("--keywordInclusionsInputButtonBackgroundColor", "rgb(60, 60, 60)");
        root.style.setProperty("--keywordInclusionsInputButtonTextColor", "rgb(90, 90, 90)");
        root.style.setProperty("--keywordInclusionsInputButtonBackgroundColorHover", "rgb(60, 60, 60)");
    }

    // HANDLE ANY KEYWORD INCLUSION REMOVALS
    let keywordInclusionsList = document.getElementById("keywordInclusionsList");
    keywordInclusionsList.addEventListener("click", function(element) {
        if (element.target.className == "removeIeButton") {
            let inclusion = element.target.id.substring(KEYWORD_INCLUSION_REMOVE_KEY.length);
            chrome.storage.sync.get("keywordInclusionsList", function(result) {
                let newInclusionsList = result.keywordInclusionsList;
                let inclusionIndex = newInclusionsList.indexOf(inclusion);
                if (inclusionIndex > -1) {
                    newInclusionsList.splice(inclusionIndex, 1);
                }
                saveStorageKey("keywordInclusionsList", newInclusionsList);
            });
            let entry = document.getElementById(KEYWORD_INCLUSION_KEY + inclusion);
            entry.remove();
        }
    });
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