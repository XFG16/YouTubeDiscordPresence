var nativePort = chrome.runtime.connectNative("com.ytdp.staller");

chrome.runtime.onConnect.addListener(function(port){
    console.assert(port.name == "data");
    port.onMessage.addListener(function(msg){
        console.log("received by background.js: " + msg.title + " and more");
        port.postMessage({status: "received by background.js: " + msg.title + " and more"});
        if (msg.title != "" && msg.author != "" && msg.link != "") {
            nativePort.postMessage({
                data: "*$TITLE%*" + msg.title + "*$AUTHOR%*" + msg.author + "*$AD%*" + msg.ad + "*$LINK%*" + msg.link + "*$END%*"
            });
        }
    });
});