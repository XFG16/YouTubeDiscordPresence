// MAIN VARIABLE INITIALIZATION

const LOGGING = true;

var port = chrome.runtime.connect({name: "document-data-pipe"});

port.onDisconnect.addListener(function() {
    port = chrome.runtime.connect({name: "document-data-pipe"});
});

window.addEventListener("SendToLoader", function(message) {
    chrome.runtime.sendMessage({
        title: message.detail.title,
        author: message.detail.author,
        timeLeft: message.detail.timeLeft
    }, (response) => {
        if (LOGGING) {
            console.log("Data was sent by content_loader.js and received by background.js: ['" + message.detail.title + "', '" + message.detail.author + "', '" + message.detail.timeLeft + "']");
        }
    });
}, false);

var mainScript = document.createElement("script");
mainScript.src = chrome.runtime.getURL("content.js");
(document.head || document.documentElement).appendChild(mainScript);
mainScript.onload = function() {
    this.remove();
};