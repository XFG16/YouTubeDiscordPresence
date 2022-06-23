// MAIN VARIABLE INITIALIZATION

const LOGGING = false;

const VIDEO_ID_SEPARATOR_KEY = "v=";
const PLAYLIST_SEPRATOR_KEY = "&";
const NORMAL_MESSAGE_DELAY = 1000;

const LIVESTREAM_ELEMENT_SELECTOR = "div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div.ytp-time-display.notranslate.ytp-live > button"; // VIDEO PLAYER
const MINIPLAYER_ELEMENT_SELECTOR = "div.ytp-miniplayer-ui"; // VIDEO PLAYER
const MAIN_LIVESTREAM_TITLE_SELECTOR = "div.ytp-chrome-top > div.ytp-title > div.ytp-title-text > a.ytp-title-link"; // VIDEO PLAYER
const MAIN_LIVESTREAM_AUTHOR_SELECTOR = "#upload-info > #keyword-name > #container > #text-container > #text > a"; // DOCUMENT HTML
const MINIPLAYER_LIVESTREAM_AUTHOR_SELECTOR = "#info-bar > div.metadata.style-scope.ytd-miniplayer > div.keyword.style-scope.ytd-miniplayer > yt-formatted-string"; // DOCUMENT HTML
const NO_MINIPLAYER_ATTRIBUTE = "display: none;";
const YES_MINIPLAYER_ATRRIBUTE = "";
const LIVESTREAM_TIME_ID = -1;

var documentData = new Object();
var videoPlayer = document.getElementById("movie_player");
var shouldSendData = 0;

// LOGGING

if (LOGGING) {
    console.log("YouTubeDiscordPresence - content.js created");
}

// GET VIDEO ID FROM LINK FROM videoPlayer.getVideoUrl()

function getVideoId(url) {
    if (url.includes(VIDEO_ID_SEPARATOR_KEY)) {
        return url.split(VIDEO_ID_SEPARATOR_KEY)[1]
    }
    return null;
}

// WEB REQUEST FOR VIDEO DATA (https://stackoverflow.com/questions/2499567/how-to-make-a-json-call-to-an-url/2499647#2499647)
// ALSO SEE OEMBED DETAILS: (https://stackoverflow.com/questions/30084140/youtube-video-title-with-api-v3-without-api-key)

const getOEmbedJSON = async videoId => {
    const response = await fetch("https://www.youtube.com/oembed?url=http%3A//youtube.com/watch%3Fv%3D" + videoId + "&format=json");
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const data = response.json()
    return data;
}

// DOCUMENT SCANNING IF VIDEO IS LIVESTREAM OR OEMBED DOESN'T WORK (https://developers.google.com/youtube/iframe_api_reference)
// ALSO SEE (https://stackoverflow.com/questions/9515704/use-a-content-script-to-access-the-page-context-variables-and-functions)

function getLivestreamData() {
    let miniplayerHTML = videoPlayer.querySelector(MINIPLAYER_ELEMENT_SELECTOR);
    if (!miniplayerHTML || (miniplayerHTML && miniplayerHTML.getAttribute("style") == NO_MINIPLAYER_ATTRIBUTE)) {
        let titleHTML = videoPlayer.querySelector(MAIN_LIVESTREAM_TITLE_SELECTOR);
        let authorHTML = document.querySelector(MAIN_LIVESTREAM_AUTHOR_SELECTOR);
        if (titleHTML) {
            documentData.title = titleHTML.innerText;
        }
        else {
            documentData.title = null;
        }
        if (authorHTML) {
            documentData.author = authorHTML.innerText;
        }
        else {
            documentData.author = null;
        }
    }
    else if (miniplayerHTML && miniplayerHTML.getAttribute("style") == YES_MINIPLAYER_ATRRIBUTE) {
        let titleHTML = videoPlayer.querySelector(MAIN_LIVESTREAM_TITLE_SELECTOR);
        let authorHTML = document.querySelector(MINIPLAYER_LIVESTREAM_AUTHOR_SELECTOR);
        if (titleHTML) {
            documentData.title = titleHTML.innerText;
        }
        else {
            documentData.title = null;
        }
        if (authorHTML) {
            documentData.author = authorHTML.innerText;
        }
        else {
            documentData.author = null;
        }
    }
}

// SEPARATE FUNCTION FOR GETTING VIDEO TIMES
// HAS TO BE A SEPARATE FUNCTION BECAUSE THE OEMBED REQUEST IS ASYNCHRONOUS, WHICH CAN CAUSE THE PRESENCE TO DISPLAY THE WRONG TIME IF PUT INTO THE MAIN FUNCTION DIRECTLY

function getTimeData() {
    if (videoPlayer.getDuration() && videoPlayer.getCurrentTime()) {
        documentData.timeLeft = videoPlayer.getDuration() - videoPlayer.getCurrentTime();
        if (documentData.timeLeft < 0) {
            documentData.timeLeft = null;
        }
    }
    else {
        documentData.timeLeft = null;
    }
}

// SEPARATE FUNCTION FOR COMMUNICATION TO PREVENT ASYNC FROM CAUSING WRONG DATA TO GET SENT

function sendDocumentData() {
    if (documentData.title && documentData.author && documentData.timeLeft) {
        messageData = {title: documentData.title, author: documentData.author, timeLeft: documentData.timeLeft, videoId: documentData.videoId};
        var messageEvent = new CustomEvent("SendToLoader", {detail: messageData});
        window.dispatchEvent(messageEvent);
    }
}

// SEPARATE FUNCTION FOR LIVESTREAM DATA OR MINIPLAYERS THAT INCLUDE THE AUTHOR

function handleYouTubeData() {
    let livestreamHTML = videoPlayer.querySelector(LIVESTREAM_ELEMENT_SELECTOR);
    documentData.videoId = getVideoId(videoPlayer.getVideoUrl());
    if (documentData.videoId && !livestreamHTML) {
        getOEmbedJSON(documentData.videoId).then(data => {
            documentData.title = data.title;
            documentData.author = data.author_name;
            getTimeData();
            sendDocumentData();
        }).catch(error => {
            getLivestreamData();
            getTimeData();
            sendDocumentData();
            console.error(error);
        });
    }
    else {
        getLivestreamData();
        documentData.timeLeft = LIVESTREAM_TIME_ID;
        sendDocumentData();
    }
}

// SENDER OF DATA TO CONTENT_LOADER.JS FOR REDIRECTION TO BACKGROUND.JS

var transmitterInterval = setInterval(function() {
    if (!videoPlayer) {
        videoPlayer = document.getElementById("movie_player");
    }
    if (videoPlayer && videoPlayer.getPlayerState() == 1) {
        handleYouTubeData();
    }
}, NORMAL_MESSAGE_DELAY);