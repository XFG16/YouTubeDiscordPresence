// Node.js version of YouTubeDiscordPresence (buttons and no watermark!)
// MAIN VARIABLE INITIALIZATION

let bundle = require("./bundle");
let rpc = require("discord-rpc");
let client = new rpc.Client({ transport: "ipc" });

const LOGGING = true;

const APPLICATION_ID = bundle.YTDP_APPLICATION_ID;
const LIVESTREAM_TIME_ID = -1;

const IDLE_MESSAGE = "#*IDLE*#";
const CLIENT_SUCCESS_MESSAGE = "0_SUCCESS";
const CLIENT_ERROR_MESSAGE = "1_CLIENT_ERROR";

// SEND MESSAGE

function sendExtensionMessage(message) {
    if (!LOGGING) {
        return;
    }

    let dataObject = { data: message };
    let buffer = Buffer.from(JSON.stringify(dataObject));
    let header = Buffer.alloc(4);

    header.writeUInt32LE(buffer.length, 0);
    let data = Buffer.concat([header, buffer]);
    process.stdout.write(data);
};

// PRESENCE HANDLERS

async function updatePresence(title, author, timeLeft, videoUrl, layer) {
    try {
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
        
        let successfulUpdate = false;
        setTimeout(() => {
            if (!successfulUpdate && layer == 0) {
                client = new rpc.Client({ transport: "ipc" });
                client.login({ clientId : APPLICATION_ID }).then(() => {
                    updatePresence(title, author, timeLeft, videoUrl, 1);
                }).catch((loginErr) => {
                    sendExtensionMessage(`${CLIENT_ERROR_MESSAGE}: CLIENT_CONNECTION_ERROR: ${loginErr}`);
                });
            }
        }, 1500);
        
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
        }).then(() => {
            successfulUpdate = true;
            sendExtensionMessage(`${CLIENT_SUCCESS_MESSAGE}: PRESENCE_UPDATED`);
        }).catch((err) => {
            sendExtensionMessage(`${CLIENT_ERROR_MESSAGE}: PRESENCE_UPDATING_ERROR: [Discord is likely not running] ${err}`);
        });
    } catch (err) {
        sendExtensionMessage(`${CLIENT_ERROR_MESSAGE}: FATAL_RUNTIME_ERROR: ${err}`);
    }
}

function clearPresence() {
    client.request("SET_ACTIVITY", {
        pid: process.pid,
        activity: null
    }).then(() => {
        sendExtensionMessage(`${CLIENT_SUCCESS_MESSAGE}: PRESENCE_CLEARED`);
    }).catch((err) => {
        sendExtensionMessage(`${CLIENT_ERROR_MESSAGE}: PRESENCE_CLEARING_ERROR: ${err}`)
    });
}

// CLIENT CONNECTION

client.on("ready", () => {
    sendExtensionMessage(`${CLIENT_SUCCESS_MESSAGE}: CLIENT_READY`);
});

client.login({ clientId : APPLICATION_ID }).catch((err) => {
    sendExtensionMessage(`Hola ${APPLICATION_ID}`);
    sendExtensionMessage(`${CLIENT_ERROR_MESSAGE}: CLIENT_CONNECTION_ERROR: ${err}`);
});

// // READING DATA FROM BROWSER EXTENSION
// // REFERENCED FROM: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#app_side

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
