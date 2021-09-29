var port = chrome.runtime.connect({name: "document-data-pipe"});

var justCreated = true;
var documentData = new Object();

function getYouTubeData() {
    documentData.adElement = document.querySelector("div.ytp-ad-player-overlay-instream-info");
    documentData.titleElement = document.querySelector("#container > h1 > yt-formatted-string");
    documentData.authorElement = document.querySelector("#container > #top-row > ytd-video-owner-renderer > #upload-info > #channel-name > #container > #text-container > #text > a");
    documentData.videoElement = document.getElementsByClassName('video-stream')[0];
    documentData.playingElement = document.querySelector("#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > button");
}

setInterval(function() {
    if (document.URL.startsWith("https://www.youtube.com/watch?v=")) {
        getYouTubeData();
        if (documentData.adElement == null && documentData.titleElement != null && documentData.authorElement != null && documentData.videoElement != null && documentData.playingElement != null) {
            port.postMessage({
                title: documentData.titleElement.innerText,
                author: documentData.authorElement.innerText,
                videoTime: parseInt(documentData.videoElement.currentTime),
                videoDuration: parseInt(documentData.videoElement.duration),
                playing: (documentData.playingElement.title == "Pause (k)")
            });
            console.log("Data was sent by content.js to background.js")
        }
    }
}, 1000);