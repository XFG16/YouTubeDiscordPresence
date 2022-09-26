// Node.js version of YouTubeDiscordPresence (buttons and no watermark!)
// MAIN VARIABLE INITIALIZATION

var rpc = require("discord-rpc");
const client = new rpc.Client({ transport: "ipc" });

const IDLE_MESSAGE = "#*IDLE*#";
const LIVESTREAM_TIME_ID = -1;

var presenceReady = false;

// PRESENCE HANDLERS

function updatePresence(title, author, timeLeft, videoUrl) {
    if (!presenceReady) {
        return;
    }
    let stateData = "by " + author;
    let assetsData = {
        large_image: "youtube3",
        large_text: title.substring(0, 128)
    };
    let timeStampsData = {
        end: Date.now() + (timeLeft * 1000)
    };
    if (timeLeft == LIVESTREAM_TIME_ID) {
        stateData = "[LIVE] on " + author;
        assetsData.large_image = "youtubelive1";
        timeStampsData = {
            start: Date.now()
        };
    }
    client.request("SET_ACTIVITY", {
        pid: process.pid,
        activity: {
            details: title.substring(0, 128),
            state: stateData.substring(0, 128),
            assets: assetsData,
            timestamps: timeStampsData,
            buttons: [
                {
                    label : "Watch Video",
                    url : videoUrl
                }
            ]
        } 
    });
}

function clearPresence() {
    if (!presenceReady) {
        return;
    }
    client.request("SET_ACTIVITY", {
        pid: process.pid
    });
}

// CLIENT CONNECTION

client.on("ready", () => {
    presenceReady = true;
});

client.login({ clientId : "847682519214456862" }).catch(console.error);

// READING DATA FROM BROWSER EXTENSION
// REFERENCED FROM: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#app_side

let payloadSize = null;
let chunks = [];

const sizeHasBeenRead = () => Boolean(payloadSize);
const flushChunksQueue = () => {
    payloadSize = null;
    chunks.splice(0);
};
const processData = () => {
    const stringData = Buffer.concat(chunks);
    if (!sizeHasBeenRead()) {
        payloadSize = stringData.readUInt32LE(0);
    }
    if (stringData.length >= (payloadSize + 4)) {
        const contentWithoutSize = stringData.slice(4, (payloadSize + 4));
        flushChunksQueue();
        const json = JSON.parse(contentWithoutSize);
        if (json.jsTitle == IDLE_MESSAGE) {
            clearPresence();
        }
        else {
            updatePresence(json.jsTitle, json.jsAuthor, json.jsTimeLeft, json.jsVideoUrl);
        }
    }
};

process.stdin.on("readable", () => {
    let chunk = null;
    while ((chunk = process.stdin.read()) !== null) {
        chunks.push(chunk);
    }
    processData();
});