// TODO: TRY REDUCING NUMBER OF REQUESTS, MAKE A QUEUE THAT PRIORITIZES CERTAIN TABS OVER OTHERS, FIX FORMATTING ERROR WHEN VIDEO TITLE HAS QUOTATION MARKS
// MAIN VARIABLE INITIALIZATION
// document.getElementById("movie_player"); TRY MAKING USE OF THIS
// ADD LIVESTREAM / PREMIERE SUPPORT
// MAKE SURE IT WORKS FOR YOUTUBE MUSIC

const LOGGING = false;

const MUSIC_JS_PATHS = {
    AD: "div.ytp-ad-player-overlay-instream-info",
    PLAYING: "#play-pause-button"
};

const MESSAGE_NULL = "(%NULL%)";
const VIDEO_STREAM = "video-stream";
const YOUTUBE_MAIN_URL = "https://www.youtube.com";
const YOUTUBE_MUSIC_URL = "https://music.youtube.com";
const YOUTUBE_MAIN_PAUSE = "Pause (k)";
const YOUTUBE_MUSIC_PAUSE = "Pause";
const YOUTUBE_MAIN_WATCH_URL = "https://www.youtube.com/watch?v=";
const YOUTUBE_MUSIC_WATCH_URL = "https://music.youtube.com/watch?v=";
const LINK_SEPARATOR_KEY = "&v=";

var documentData = new Object(); // a key with the name "element" in it indicates it is stored in here as a raw HTML object, not as an immediately usable text or integer value
var videoPlayer = document.getElementById("movie_player");

// LOGGING

if (LOGGING) {
    console.log("YouTubeDiscordPresence - content.js created");
}

// GET YOUTUBE OEMBED JSON DATA (https://stackoverflow.com/questions/30084140/youtube-video-title-with-api-v3-without-api-key)

function getVideoOEmbed(link) {
    separatorIndex = link.indexOf(LINK_SEPARATOR_KEY) + LINK_SEPARATOR_KEY.length;
    link = link.substring(separatorIndex, link.length);
    if (LOGGING) {
        console.log(link);
    }
    return ("https://www.youtube.com/oembed?url=http%3A//youtube.com/watch%3Fv%3D" + link + "&format=json");
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

function getYouTubeData() {
    getJSON(getVideoOEmbed(videoPlayer.getVideoUrl())).then(data => {
        if (LOGGING) {
            console.log(data);
        }
        documentData.title = data.title;
        documentData.author = data.author_name;
    }).catch(error => {
        console.error(error);
    });
    documentData.timeLeft = videoPlayer.getDuration() - videoPlayer.getCurrentTime();
}

// COMMUNICATOR WITH CONTENT LOADER

var transmitterInterval = setInterval(function() {
    if (!videoPlayer) {
        videoPlayer = document.getElementById("movie_player");
    }
    if (document.URL.startsWith(YOUTUBE_MAIN_URL) || document.URL.startsWith(YOUTUBE_MUSIC_URL) && videoPlayer && videoPlayer.getPlayerState() == 1) {
        getYouTubeData();
        if (documentData.title && documentData.author && documentData.timeLeft) {
            messageData = {title: documentData.title, author: documentData.author, timeLeft: documentData.timeLeft};
            var messageEvent = new CustomEvent("PassToBackground", {detail: messageData});
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