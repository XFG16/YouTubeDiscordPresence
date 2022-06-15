// MAIN VARIABLE INITIALIZATION

const LOGGING = false;

const UPDATE_PRESENCE_MESSAGE = "UPDATE PRESENCE DATA";

// REDIRECTION OF DATA FROM INJECTED CONTENT.JS TO BACKGROUND.JS

window.addEventListener("SendToLoader", function(message) {
    chrome.runtime.sendMessage({
        messageType: UPDATE_PRESENCE_MESSAGE,
        title: message.detail.title,
        author: message.detail.author,
        timeLeft: message.detail.timeLeft
    }, (response) => {
        if (LOGGING) {
            console.log("Data was sent by content_loader.js and received by background.js: ['" + message.detail.title + "', '" + message.detail.author + "', '" + message.detail.timeLeft + "']");
        }
    });
}, false);

// INJECTION OF CONTENT.JS INTO MAIN DOM

var mainScript = document.createElement("script");
mainScript.src = chrome.runtime.getURL("content.js");
(document.head || document.documentElement).appendChild(mainScript);
mainScript.onload = function() {
    this.remove();
};