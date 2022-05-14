// MAIN VARIABLE INITIALIZATION

const LOGGING = false;

var port = chrome.runtime.connect({name: "document-data-pipe"});

window.addEventListener("SendToLoader", function(message) {
    if (LOGGING) {
        console.log("Data was received by content_loader.js and sent to background.js: ['" + message.detail.title + "', '" + message.detail.author + "', '" + message.detail.timeLeft + "']");
    }
    port.postMessage({
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