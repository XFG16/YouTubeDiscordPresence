// Node.js version of YouTubeDiscordPresence (buttons and no watermark!)
// MAIN VARIABLE INITIALIZATION

var rpc = require("discord-rpc");
var client = new rpc.Client({ transport: "ipc" });

const LOGGING = true;

const APPLICATION_ID = "847682519214456862";
const IDLE_MESSAGE = "#*IDLE*#";
const LIVESTREAM_TIME_ID = -1;

// SEND MESSAGE

function sendExtensionMessage(msg) {
    if (!LOGGING) {
        return;
    }

    let dataObject = {"data": msg};
    let buffer = Buffer.from(JSON.stringify(dataObject));
    let header = Buffer.alloc(4);

    header.writeUInt32LE(buffer.length, 0);
    let data = Buffer.concat([header, buffer]);
    process.stdout.write(data);
};

// PRESENCE HANDLERS

async function updatePresence(title, author, timeLeft, videoUrl, layer) {
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

    let result = null;
    setTimeout(() => {
        if (result == null) {
            presenceReady = false;
            sendExtensionMessage("CLIENT_ERROR");
            client = new rpc.Client({ transport: "ipc" });
            client.login({ clientId : APPLICATION_ID }).then(() => {
                if (layer == 0) {
                    updatePresence(title, author, timeLeft, videoUrl, 1);
                }
            }).catch((err) => {
                console.error(err);
                sendExtensionMessage("CLIENT_ERROR");
            });
        }
        else {
            sendExtensionMessage("PRESENCE_UPDATED");
        }
        return;
    }, 1000);
    result = await client.request("SET_ACTIVITY", {
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
    client.request("SET_ACTIVITY", {
        pid: process.pid
    });
    sendExtensionMessage("PRESENCE_CLEARED");
}

// CLIENT CONNECTION

client.on("ready", () => {
    sendExtensionMessage("CLIENT_READY");
});

client.login({ clientId : APPLICATION_ID }).catch((err) => {
    console.error(err);
    sendExtensionMessage("CLIENT_ERROR");
});

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
            updatePresence(json.jsTitle, json.jsAuthor, json.jsTimeLeft, json.jsVideoUrl, 0);
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