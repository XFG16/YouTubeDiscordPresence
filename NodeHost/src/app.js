// Node.js version of YouTubeDiscordPresence (buttons and no watermark!)
// MAIN VARIABLE INITIALIZATION

const bundle = require("./bundle");
const version = "1.4.2"; // CHANGE THIS EVERY UPDATE

let rpc = require("discord-rpc");
let client = new rpc.Client({ transport: "ipc" });

const LOGGING = true;

const APPLICATION_ID = bundle.YTDP_APPLICATION_ID;
const MUSIC_APPLICATION_ID = bundle.YTDP_MUSIC_APPLICATION_ID;
let currentApplication = "youtube"; // "youtube" or "youtubeMusic"
let currentApplicationId = APPLICATION_ID;

const IDLE_MESSAGE = "#*IDLE*#";
const CSM = "0_SUCCESS"; // CLIENT_SUCCESS_MESSAGE
const CEM = "1_CLIENT_ERROR"; // CLIENT_ERROR_MESSAGE

// SEND MESSAGE

function sendNativeVersion() {
    let dataObject = { nativeVersion: version };
    let buffer = Buffer.from(JSON.stringify(dataObject));
    let header = Buffer.alloc(4);

    header.writeUInt32LE(buffer.length, 0);
    let data = Buffer.concat([header, buffer]);
    process.stdout.write(data);
}

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

async function updatePresence(presenceData, layer) {
    let updated = false, errorCaught = false;
    setTimeout(() => {
        if (layer == 0 && !(updated || errorCaught)) {
            client = new rpc.Client({ transport: "ipc" });
            client.login({ clientId: currentApplicationId }).then(() => {
                updatePresence(presenceData, 1);
            }).catch((loginErr) => {
                sendExtensionMessage(false, "CLIENT_CONNECTION_ERROR", loginErr);
            });
        }
    }, 3000);

    client.request("SET_ACTIVITY", {
        pid: process.pid,
        activity: presenceData
    }).then(() => {
        updated = true;
        sendExtensionMessage(true, "PRESENCE_UPDATED");
    }).catch((err) => { // IMPORTANT NOTE! Under node_modules/discord-rpc/src/client.js, the RPC_CONNECTION_TIMEOUT was changed from 10e3 to 2500
        errorCaught = true;
        if (layer == 0) {
            client = new rpc.Client({ transport: "ipc" });
            client.login({ clientId: currentApplicationId }).then(() => {
                updatePresence(presenceData, 1);
            }).catch((loginErr) => {
                sendExtensionMessage(false, "CLIENT_CONNECTION_ERROR", loginErr);
            });
        }
        else {
            sendExtensionMessage(false, "PRESENCE_UPDATING_ERROR", err);
        }
    });
}

function clearPresence(callback = null) {
    let updated = false, errorCaught = false;
    setTimeout(() => {
        if (!(updated || errorCaught)) {
            client = new rpc.Client({ transport: "ipc" });
            client.login({ clientId: currentApplicationId }).then(() => {
                sendExtensionMessage(true, "PRESENCE_CLEARED");
                if (callback) {
                    callback();
                }
            }).catch((loginErr) => {
                sendExtensionMessage(false, "CLIENT_CONNECTION_ERROR", loginErr);
            });
        }
    }, 3000);

    client.request("SET_ACTIVITY", {
        pid: process.pid,
        activity: null
    }).then(() => {
        updated = true;
        sendExtensionMessage(true, "PRESENCE_CLEARED");
        if (callback) {
            callback();
        }
    }).catch((err) => {
        errorCaught = true;
        client = new rpc.Client({ transport: "ipc" });
        client.login({ clientId: currentApplicationId }).then(() => {
            sendExtensionMessage(true, "PRESENCE_CLEARED");
            if (callback) {
                callback();
            }
        }).catch((loginErr) => {
            sendExtensionMessage(false, "CLIENT_CONNECTION_ERROR", `${String(err)}, ${String(loginErr)}`);
        });
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

function handleExtensionPayload(json) {
    if (json.jsApplicationType && json.jsApplicationType != currentApplication) {

        currentApplication = json.jsApplicationType;
        currentApplicationId = (currentApplication == "youtube") ? APPLICATION_ID : MUSIC_APPLICATION_ID;

        function resetPresence() {
            client.destroy().then(() => {
                client = new rpc.Client({ transport: "ipc" });
                client.login({ clientId: currentApplicationId }).then(() => {
                    updatePresence(json.presenceData, 0);
                }).catch((err) => {
                    sendExtensionMessage(false, "CLIENT_CONNECTION_ERROR", err);
                });
            }).catch((err) => {
                sendExtensionMessage(false, "CLIENT_DESTRUCTION_ERROR", err);
            });
        }
        clearPresence(resetPresence);
    }
    else {
        updatePresence(json.presenceData, 0);
    }
}

const processData = () => {
    const stringData = Buffer.concat(chunks);
    if (!sizeHasBeenRead()) {
        payloadSize = stringData.readUInt32LE(0);
    }
    if (stringData.length >= (payloadSize + 4)) {
        const contentWithoutSize = stringData.slice(4, (payloadSize + 4));
        flushChunksQueue();
        if (stringData == "-1") {
            process.kill(process.pid);
        }

        const json = JSON.parse(contentWithoutSize);
        if (json.presenceData == IDLE_MESSAGE) {
            sendExtensionMessage(true, "CLEAR_REQUEST_RECEIVED");
            clearPresence();
        }
        else if (json.presenceData) {
            sendExtensionMessage(true, "UPDATE_REQUEST_RECEIVED");
            handleExtensionPayload(json)
        }
        else if (json.getNativeVersion) {
            sendExtensionMessage(true, "VERSION_REQUEST_RECEIVED");
            sendNativeVersion();
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

// EXCEPTION HANDLER

process.on('uncaughtException', function (err) {
    sendExtensionMessage(false, "FATAL_RUNTIME_ERROR", err);
});