// MAIN VARIABLE INITIALIZATION

const LOGGING = true;

// HANDLE ON/OFF DISPLAY CHANGES

function handleOnOffDisplay(state, status, saveKey) {
    if (state) { // either true (on) or false (off)
        status.innerHTML = "ON";
        status.style.color = "#21db46";
    }
    else {
        status.innerHTML = "OFF";
        status.style.color = "#ff0000";
    }
    if (saveKey != null) {
        let saveObject = new Object();
        saveObject[saveKey] = state;
        chrome.storage.sync.set(saveObject, function() {
            if (LOGGING) {
                console.log(saveKey + " (saved): ", state);
            }
        });
    }
}

// SET KNOWN VALUES WHEN POP.JS IS OPENED

function handelDocumentLoading(enabledLabel, enableOnStartupLabel) {
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
}

// HANDLE AN USER INTERACTIONS

function handleDocumentChanges(enabledLabel, enableOnStartupLabel) {
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
}

// PROGRAM ENTRY

window.onload = function() {
    let enabledLabel = document.getElementById("enabledLabel");
    let enableOnStartupLabel = document.getElementById("enableOnStartupLabel");
    handelDocumentLoading(enabledLabel, enableOnStartupLabel);
    handleDocumentChanges(enabledLabel, enableOnStartupLabel);
}