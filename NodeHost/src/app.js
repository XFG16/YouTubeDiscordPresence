// Node.js version of YouTubeDiscordPresence (buttons and no watermark!)
// MAIN VARIABLE INITIALIZATION

const URL = require("url").URL;
const bundle = require("./bundle");

let rpc = require("discord-rpc");
let client = new rpc.Client({ transport: "ipc" });

const LOGGING = true;

const APPLICATION_ID = bundle.YTDP_APPLICATION_ID;
const MUSIC_APPLICATION_ID = bundle.YTDP_MUSIC_APPLICATION_ID;
let currentApplication = "youtube"; // "youtube" or "youtubeMusic"
let currentApplicationId = APPLICATION_ID;

const LIVESTREAM_TIME_ID = -1;
const IDLE_MESSAGE = "#*IDLE*#";
const CSM = "0_SUCCESS"; // CLIENT_SUCCESS_MESSAGE
const CEM = "1_CLIENT_ERROR"; // CLIENT_ERROR_MESSAGE

// URL CHECKING

const isValidUrl = (s) => {
    try {
        new URL(s);
        return true;
    } catch (err) {
        return false;
    }
};

// SEND MESSAGE

function sendExtensionMessage(success, message, err = null) {
    if (!LOGGING) {
        return;
    }

    let formattedMessage = null;
    if (success) {
        formattedMessage = `${CSM}: ${message}`;
    }
    else {
        if (err) {
            formattedMessage = `${CEM}: ${message}: ${err}`;
        }
        else {
            formattedMessage = `${CEM}: ${message}`;
        }
    }

    let dataObject = { data: formattedMessage };
    let buffer = Buffer.from(JSON.stringify(dataObject));
    let header = Buffer.alloc(4);

    header.writeUInt32LE(buffer.length, 0);
    let data = Buffer.concat([header, buffer]);
    process.stdout.write(data);
};

// PRESENCE HANDLERS

async function updatePresence(title, author, timeLeft, videoUrl, channelUrl, presenceSettings, layer) {
    try {
        let stateData = null;
        if (presenceSettings) {
            stateData = presenceSettings.addByAuthor ? `by ${author}` : author;
        }
        else {
            stateData = `by ${author}`;
        }

        let assetsData = {
            large_image: "youtube3",
            large_text: title.substring(0, 128)
        };
        if (currentApplication == "youtubeMusic") {
            assetsData.large_image = "youtube-music";
        }
        if (presenceSettings && presenceSettings.enablePlayingIcon) {
            assetsData.small_image = "playing-icon-3";
            assetsData.small_text = "YouTubeDiscordPresence on GitHub"
        }

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

        let buttonsData = [];
        if (presenceSettings && Object.keys(presenceSettings).length > 0) {
            if (presenceSettings.enableVideoButton && videoUrl && isValidUrl(videoUrl)) {
                buttonsData.push({
                    label: "Watch Video",
                    url: videoUrl
                });
            }
            if (presenceSettings.enableChannelButton && channelUrl && isValidUrl(channelUrl) && !channelUrl.endsWith("undefined")) {
                buttonsData.push({
                    label: "View Channel",
                    url: channelUrl
                });
            }
        }
        else {
            buttonsData.push({
                label: "Watch Video",
                url: videoUrl
            });
        }

        let successfulUpdate = false;
        setTimeout(() => {
            if (!successfulUpdate && layer == 0) {
                client = new rpc.Client({ transport: "ipc" });
                client.login({ clientId: currentApplicationId }).then(() => {
                    updatePresence(title, author, timeLeft, videoUrl, channelUrl, presenceSettings, 1);
                }).catch((loginErr) => {
                    sendExtensionMessage(false, "CLIENT_CONNECTION_ERROR", loginErr);
                });
            }
        }, 1500);

        let presenceData = {
            details: title.substring(0, 128),
            state: stateData.substring(0, 128),
            assets: assetsData,
            timestamps: timeStampsData,
            buttons: buttonsData
        };
        if (buttonsData.length == 0) {
            delete presenceData.buttons;
        }

        client.request("SET_ACTIVITY", {
            pid: process.pid,
            activity: presenceData
        }).then(() => {
            successfulUpdate = true;
            sendExtensionMessage(true, "PRESENCE_UPDATED");
        }).catch((err) => {
            sendExtensionMessage(false, "PRESENCE_UPDATING_ERROR: [Discord is likely not running]", err);
        });
    } catch (err) {
        sendExtensionMessage(false, "FATAL_RUNTIME_ERROR", err);
    }
}

function clearPresence(callback = null) {
    client.request("SET_ACTIVITY", {
        pid: process.pid,
        activity: null
    }).then(() => {
        sendExtensionMessage(true, "PRESENCE_CLEARED");
        if (callback) {
            callback();
        }
    }).catch((err) => {
        sendExtensionMessage(false, "PRESENCE_CLEARING_ERROR", err);
    });
}

// CLIENT CONNECTION

client.on("ready", () => {
    sendExtensionMessage(true, "CLIENT_READY");
});

client.login({ clientId: currentApplicationId }).catch((err) => {
    sendExtensionMessage(false, "CLIENT_CONNECTION_ERROR", err);
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
            if (json.jsApplicationType && json.jsApplicationType != currentApplication) {
                if (json.jsApplicationType == "youtube") {
                    currentApplicationId = APPLICATION_ID;
                }
                else {
                    currentApplicationId = MUSIC_APPLICATION_ID;
                }
                currentApplication = json.jsApplicationType;

                function resetPresence() {
                    client = new rpc.Client({ transport: "ipc" });
                    client.login({ clientId: currentApplicationId }).then(() => {
                        updatePresence(json.jsTitle, json.jsAuthor, json.jsTimeLeft, json.jsVideoUrl, json.jsChannelUrl, json.jsPresenceSettings, 0);
                    }).catch((err) => {
                        sendExtensionMessage(false, "CLIENT_CONNECTION_ERROR", err);
                    });
                }
                clearPresence(resetPresence);
            }
            else {
                updatePresence(json.jsTitle, json.jsAuthor, json.jsTimeLeft, json.jsVideoUrl, json.jsChannelUrl, json.jsPresenceSettings, 0);
            }
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
