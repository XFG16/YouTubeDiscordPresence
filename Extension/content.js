/*
Copyright (c) 2022-2023 Michael Ren
Licensing and distribution info can be found at the GitHub repository
https://github.com/XFG16/YouTubeDiscordPresence
*/

// MAIN VARIABLE INITIALIZATION

const LOGGING = false;

const VIDEO_ID_SEPARATOR_KEY = "v=";
const PLAYLIST_SEPRATOR_KEY = "&";
const NORMAL_MESSAGE_DELAY = 1000;

const AD_SELECTOR = "div.ytp-ad-player-overlay-instream-info"; // DOCUMENT; THIS HAS TO BE DONE BECAUSE IF AN AD PLAYS IN THE MIDDLE OF A VIDEO, THEN GETPLAYERSTATE WILL STILL RETURN 1
const LIVESTREAM_ELEMENT_SELECTOR = "div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div.ytp-time-display.notranslate.ytp-live > button"; // VIDEO PLAYER
const MINIPLAYER_ELEMENT_SELECTOR = "div.ytp-miniplayer-ui"; // VIDEO PLAYER
const MAIN_LIVESTREAM_TITLE_SELECTOR = "div.ytp-chrome-top > div.ytp-title > div.ytp-title-text > a.ytp-title-link"; // VIDEO PLAYER
const MAIN_LIVESTREAM_AUTHOR_SELECTOR = "#upload-info > #channel-name > #container > #text-container > #text > a"; // DOCUMENT HTML
const MINIPLAYER_LIVESTREAM_AUTHOR_SELECTOR = "#video-container #info-bar #owner-name"; // DOCUMENT HTML
const NO_MINIPLAYER_ATTRIBUTE = "display: none;";
const YES_MINIPLAYER_ATRRIBUTE = "";
const LIVESTREAM_TIME_ID = -1;

let documentData = new Object();
let videoPlayer = document.getElementById("movie_player");
let shouldSendData = 0;

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
    const data = response.json();
    return data;
}

// DOCUMENT SCANNING IF VIDEO IS LIVESTREAM OR OEMBED DOESN'T WORK (https://developers.google.com/youtube/iframe_api_reference)
// ALSO SEE (https://stackoverflow.com/questions/9515704/use-a-content-script-to-access-the-page-context-letiables-and-functions)

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
            documentData.channelUrl = authorHTML.href;
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
            documentData.channelUrl = authorHTML.href;
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
        console.log("Unable to get timestamp data for YouTubeDiscordPresence");
    }
}

// SEPARATE FUNCTION FOR COMMUNICATION TO PREVENT ASYNC FROM CAUSING WRONG DATA TO GET SENT

function sendDocumentData() {
    if (documentData.title && documentData.author && documentData.timeLeft) {
        if (documentData.author.endsWith(" - Topic")) {
            documentData.author = documentData.author.slice(0, -8);
        }
        let messageEvent = new CustomEvent("SendToLoader", { detail: documentData });
        window.dispatchEvent(messageEvent);
    }
}

// SEPARATE FUNCTION FOR LIVESTREAM DATA OR MINIPLAYERS THAT INCLUDE THE AUTHOR

function handleYouTubeData() {
    let livestreamHTML = videoPlayer.querySelector(LIVESTREAM_ELEMENT_SELECTOR);
    documentData.videoId = getVideoId(videoPlayer.getVideoUrl());
    documentData.applicationType = window.location.href.includes("music.youtube") ? "youtubeMusic" : "youtube";

    if (documentData.applicationType == "youtubeMusic") { // GRABS YT MUSIC ALBUM THUMBNAIL
        let thumbnail = document.querySelector("#song-image #thumbnail #img");
        if (thumbnail && "src" in thumbnail && thumbnail.src.startsWith("https://lh3.googleusercontent.com/")) {
            documentData.thumbnailUrl = thumbnail.src;
        }
        else {
            documentData.thumbnailUrl = `https://i.ytimg.com/vi/${documentData.videoId}/hqdefault.jpg`;
        }
    }
    else {
        documentData.thumbnailUrl = `https://i.ytimg.com/vi/${documentData.videoId}/hqdefault.jpg`;
    }

    if (!livestreamHTML) {
        getOEmbedJSON(documentData.videoId).then(data => { // TRY USING OEMBED FIRST
            documentData.title = data.title;
            documentData.author = data.author_name;
            documentData.channelUrl = data.author_url;
            getTimeData();
            sendDocumentData();
        }).catch(error => { // IF THAT DOESN'T WORK, USE SELECTORS
            getLivestreamData();
            getTimeData();
            sendDocumentData();
            console.error(error);
        });
    }
    else { // ALWAYS USE SELECTORS FOR LIVESTREAMS
        getLivestreamData();
        documentData.timeLeft = LIVESTREAM_TIME_ID;
        sendDocumentData();
    }
}

// SENDER OF DATA TO CONTENT_LOADER.JS FOR REDIRECTION TO BACKGROUND.JS

setInterval(function () {
    if (!videoPlayer) {
        videoPlayer = document.getElementById("movie_player");
    }
    if (videoPlayer && videoPlayer.getPlayerState() == 1 && document.querySelector(AD_SELECTOR) == null) {
        handleYouTubeData();
    }
}, NORMAL_MESSAGE_DELAY);