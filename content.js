var port = chrome.runtime.connect({name: "data"});

port.onMessage.addListener(function(msg){
    console.log(msg.status);
});

setInterval(function() {
    if (document.URL.startsWith("https://www.youtube.com/watch?v=") && document.readyState == "complete") {
        port.postMessage({
            title: document.querySelector("#container > h1 > yt-formatted-string").innerText,
            author: document.querySelector("#container > #top-row > ytd-video-owner-renderer > #upload-info > #channel-name > #container > #text-container > #text > a").innerText,
            ad: document.querySelector("div.ytp-ad-player-overlay-instream-info") != null,
            link: document.URL
        });
        console.log("message was sent by content.js");
    }
}, 2500); // set this to 15000 due to Discord limitations