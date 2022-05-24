// MAIN VARIABLE INITIALIZATION

const LOGGING = true;

const SCRIPT_ID = toString(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));

var port = chrome.runtime.connect({name: "document-data-pipe"});

window.addEventListener("SendToLoader", function(message) {
    if (LOGGING) {
        console.log("Data was received by content_loader.js and sent to background.js: ['" + SCRIPT_ID + "', '" + message.detail.title + "', '" + message.detail.author + "', '" + message.detail.timeLeft + "']");
    }
    port.postMessage({
        scriptId: SCRIPT_ID,
        title: message.detail.title,
        author: message.detail.author,
        timeLeft: message.detail.timeLeft
    });
}, false);

var mainScript = document.createElement("script");
mainScript.src = chrome.runtime.getURL("content.js");
(document.head || document.documentElement).appendChild(mainScript);
mainScript.onload = function() {
    this.remove();
};