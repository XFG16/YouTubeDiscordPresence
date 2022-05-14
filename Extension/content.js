// TODO: TRY REDUCING NUMBER OF REQUESTS, MAKE A QUEUE THAT PRIORITIZES CERTAIN TABS OVER OTHERS, FIX FORMATTING ERROR WHEN VIDEO TITLE HAS QUOTATION MARKS
// MAIN VARIABLE INITIALIZATION
// document.getElementById("movie_player"); TRY MAKING USE OF THIS
// ADD LIVESTREAM / PREMIERE SUPPORT
// MAKE SURE IT WORKS FOR YOUTUBE MUSIC

// document.querySelector("#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div.ytp-time-display.notranslate.ytp-live > button")
// POSSIBLE QUERY SELECTOR FOR CHECKING LIVE STREAM^^
// EVEN BETTER:
// document.getElementById("movie_player").querySelector("div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div.ytp-time-display.notranslate.ytp-live > button")
// TITLE WITHOUT HTTP REQUEST:
// document.getElementById("movie_player").querySelector("div.ytp-chrome-top > div.ytp-title > div.ytp-title-text > a.ytp-title-link")
// might have to get author from HTML
// this can be done by "document.querySelector("#upload-info > #channel-name > #container > #text-container > #text > a")"

const LOGGING = false;

const MESSAGE_NULL = "(%NULL%)";
const YOUTUBE_MAIN_URL = "https://www.youtube.com";
const YOUTUBE_MUSIC_URL = "https://music.youtube.com";
const LINK_SEPARATOR_KEY = "&v=";

const LIVESTREAM_ELEMENT_SELECTOR = "div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div.ytp-time-display.notranslate.ytp-live > button"; // VIDEO PLAYER
const MINIPLAYER_ELEMENT_SELECTOR = "div.ytp-miniplayer-ui"; // VIDEO PLAYER
const MAIN_LIVESTREAM_TITLE_SELECTOR = "div.ytp-chrome-top > div.ytp-title > div.ytp-title-text > a.ytp-title-link"; // VIDEO PLAYER
const MAIN_LIVESTREAM_AUTHOR_SELECTOR = "#upload-info > #channel-name > #container > #text-container > #text > a"; // DOCUMENT HTML
const MINIPLAYER_LIVESTREAM_AUTHOR_SELECTOR = "#info-bar > div.metadata.style-scope.ytd-miniplayer > div.channel.style-scope.ytd-miniplayer > yt-formatted-string"; // DOCUMENT HTML
const NO_MINIPLAYER_ATTRIBUTE = "display: none;";
const YES_MINIPLAYER_ATRRIBUTE = "";
const LIVESTREAM_TIME_ID = -999;

var documentData = new Object();
var videoPlayer = document.getElementById("movie_player");

// LOGGING

if (LOGGING) {
    console.log("YouTubeDiscordPresence - content.js created");
}

// GET YOUTUBE OEMBED JSON DATA (https://stackoverflow.com/questions/30084140/youtube-video-title-with-api-v3-without-api-key)

function getVideoOEmbed(link) {
    separatorIndex = link.indexOf(LINK_SEPARATOR_KEY);
    if (link.indexOf(LINK_SEPARATOR_KEY) > -1) {
        link = link.substring(separatorIndex + LINK_SEPARATOR_KEY.length, link.length);
        if (LOGGING) {
            console.log(link);
        }
        return ("https://www.youtube.com/oembed?url=http%3A//youtube.com/watch%3Fv%3D" + link + "   ");
    }
    return null;
}

// DATA REQUEST (https://stackoverflow.com/questions/2499567/how-to-make-a-json-call-to-an-url/2499647#2499647)

const getJSON = async url => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const data = response.json()
    return data;
}

// DOCUMENT SCANNING (https://developers.google.com/youtube/iframe_api_reference)
// (https://stackoverflow.com/questions/9515704/use-a-content-script-to-access-the-page-context-variables-and-functions)

function secondarySelection() {
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

function getYouTubeData() {
    let livestreamHTML = videoPlayer.querySelector(LIVESTREAM_ELEMENT_SELECTOR);
    if (videoPlayer.getVideoUrl() && !livestreamHTML) {
        let formattedLink = getVideoOEmbed(videoPlayer.getVideoUrl());
        if (formattedLink) {
            getJSON(formattedLink).then(data => {
                if (LOGGING) {
                    console.log(data);
                }
                documentData.title = data.title;
                documentData.author = data.author_name;
            }).catch(error => {
                secondarySelection();
                console.error(error);
            });
        }
    }
    else {
        secondarySelection();
    }

    if (livestreamHTML) {
        documentData.timeLeft = LIVESTREAM_TIME_ID;
    }
    else if (videoPlayer.getDuration()) {
        documentData.timeLeft = videoPlayer.getDuration() - videoPlayer.getCurrentTime();
        if (documentData.timeLeft < 0) {
            documentData.timeLeft = 0;
        }
    }
    else {
        documentData.timeLeft = null;
    }
}

// COMMUNICATOR WITH CONTENT LOADER

var transmitterInterval = setInterval(function() {
    if (!videoPlayer) {
        videoPlayer = document.getElementById("movie_player");
    }
    if ((document.URL.startsWith(YOUTUBE_MAIN_URL) || document.URL.startsWith(YOUTUBE_MUSIC_URL)) && videoPlayer && videoPlayer.getPlayerState() == 1) {
        getYouTubeData();
        if (documentData.title && documentData.author && documentData.timeLeft) {
            messageData = {title: documentData.title, author: documentData.author, timeLeft: parseInt(documentData.timeLeft)};
            var messageEvent = new CustomEvent("SendToLoader", {detail: messageData});
            window.dispatchEvent(messageEvent);
            if (LOGGING) {
                console.log("Data was sent by content.js to the content_loader.js")
                console.log(documentData.title);
                console.log(documentData.author)
                console.log(documentData.timeLeft);
            }
        }
    }
}, 1000);