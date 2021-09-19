var port = chrome.runtime.connect({name: "document-data-pipe"});

var documentData = new Object();

function getYouTubeData() {
    documentData.titleElement = document.querySelector("#container > h1 > yt-formatted-string");
    documentData.authorElement = document.querySelector("#container > #top-row > ytd-video-owner-renderer > #upload-info > #channel-name > #container > #text-container > #text > a");
    documentData.adElement = document.querySelector("div.ytp-ad-player-overlay-instream-info");
    documentData.videoTimeElement = document.querySelector("#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div.ytp-time-display.notranslate > span.ytp-time-current");
    documentData.videoDurationElement = document.querySelector("#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div.ytp-time-display.notranslate > span.ytp-time-duration");
}

setInterval(function() {
    if (document.readyState !== "complete") {
        return;
    }
    if (document.URL.startsWith("https://www.youtube.com/watch?v=")) {
        getYouTubeData();
        if (documentData.titleElement !== null && documentData.authorElement !== null && documentData.adElement === null) {
            port.postMessage({
                title: documentData.titleElement.innerText,
                author: documentData.authorElement.innerText,
                videoTime: documentData.videoTimeElement.innerText,
                videoDuration: documentData.videoDurationElement.innerText
            });
            console.log("Data was sent by content.js to background.js")
        }
    }
}, 1000);