// Node.js version of YouTubeDiscordPresence (buttons and no watermark!)
// MAIN VARIABLE INITIALIZATION
const version = "1.6.0"; // CHANGE THIS EVERY UPDATE

let rpc = require("discord-rpc");

const LOGGING = true;

const YT_APP_ID = "847682519214456862";
const YT_MUSIC_APP_ID = "1064295774592180254";
let currentApplication = {
    type: "youtube", // "youtube" or "youtubeMusic"
    id: YT_APP_ID
}

const IDLE_MESSAGE = "#*IDLE*#";
const CSM = "0_SUCCESS"; // CLIENT_SUCCESS_MESSAGE
const CEM = "1_CLIENT_ERROR"; // CLIENT_ERROR_MESSAGE

// MULTI-CLIENT STATE
// Each entry: { client, pipeIndex, ready }
let clients = [];

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
    if (!LOGGING) return;

    let formattedMessage = null;
    if (success) {
        formattedMessage = `${CSM}: ${message}`;
    }
    else {
        if (err) formattedMessage = `${CEM}: ${message}: ${err}`;
        else formattedMessage = `${CEM}: ${message}`;
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
    if (clients.length === 0) {
        sendExtensionMessage(false, "NO_CLIENTS_CONNECTED");
        return;
    }

    let results = await Promise.allSettled(clients.map(async (entry) => {
        try {
            await entry.client.request("SET_ACTIVITY", {
                pid: process.pid,
                activity: presenceData
            });
            return { pipeIndex: entry.pipeIndex, success: true };
        } catch (err) {
            // Try reconnecting this specific client
            if (layer === 0) {
                try {
                    let newClient = new rpc.Client({ transport: "ipc", pipeIndex: entry.pipeIndex });
                    await newClient.login({ clientId: currentApplication.id });
                    entry.client = newClient;
                    entry.ready = true;
                    await newClient.request("SET_ACTIVITY", {
                        pid: process.pid,
                        activity: presenceData
                    });
                    return { pipeIndex: entry.pipeIndex, success: true, reconnected: true };
                } catch (loginErr) {
                    return { pipeIndex: entry.pipeIndex, success: false, error: loginErr };
                }
            }
            return { pipeIndex: entry.pipeIndex, success: false, error: err };
        }
    }));

    let anySuccess = results.some(r => r.status === "fulfilled" && r.value.success);
    if (anySuccess) {
        sendExtensionMessage(true, "PRESENCE_UPDATED");
    } else {
        sendExtensionMessage(false, "PRESENCE_UPDATING_ERROR", "All clients failed");
    }
}

function clearPresence(callback = null) {
    if (clients.length === 0) {
        if (callback) callback();
        return;
    }

    Promise.allSettled(clients.map(async (entry) => {
        try {
            await entry.client.request("SET_ACTIVITY", {
                pid: process.pid,
                activity: null
            });
            return { pipeIndex: entry.pipeIndex, success: true };
        } catch (err) {
            // Try reconnecting
            try {
                let newClient = new rpc.Client({ transport: "ipc", pipeIndex: entry.pipeIndex });
                await newClient.login({ clientId: currentApplication.id });
                entry.client = newClient;
                entry.ready = true;
                return { pipeIndex: entry.pipeIndex, success: true };
            } catch (loginErr) {
                return { pipeIndex: entry.pipeIndex, success: false, error: `${String(err)}, ${String(loginErr)}` };
            }
        }
    })).then((results) => {
        let anySuccess = results.some(r => r.status === "fulfilled" && r.value.success);
        if (anySuccess) {
            sendExtensionMessage(true, "PRESENCE_CLEARED");
        } else {
            sendExtensionMessage(false, "CLIENT_CONNECTION_ERROR", "All clients failed to clear");
        }
        if (callback) callback();
    });
}

// CLIENT CONNECTION — discover and connect to ALL Discord pipes

async function discoverAndConnect() {
    let connectedPipes = new Set(clients.map(c => c.pipeIndex));

    for (let pipeIndex = 0; pipeIndex < 4; pipeIndex++) {
        if (connectedPipes.has(pipeIndex)) continue; // already connected

        try {
            let client = new rpc.Client({ transport: "ipc", pipeIndex: pipeIndex });
            client.on("ready", () => {
                sendExtensionMessage(true, `CLIENT_READY_PIPE_${pipeIndex}`);
            });
            await client.login({ clientId: currentApplication.id });
            clients.push({ client, pipeIndex: pipeIndex, ready: true });
            sendExtensionMessage(true, `CONNECTED_TO_PIPE_${pipeIndex}`);
        } catch (err) {
            // pipe not available or connection failed, skip
        }
    }

    if (clients.length === 0) {
        sendExtensionMessage(false, "NO_DISCORD_CLIENTS_CONNECTED");
    } else {
        sendExtensionMessage(true, `CONNECTED_TO_${clients.length}_DISCORD_CLIENTS`);
    }
}

// Initial connection
discoverAndConnect();

// Periodically check for new Discord clients (every 30 seconds)
setInterval(async () => {
    let connectedPipes = new Set(clients.map(c => c.pipeIndex));

    for (let pipeIndex = 0; pipeIndex < 4; pipeIndex++) {
        if (connectedPipes.has(pipeIndex)) continue;

        try {
            let client = new rpc.Client({ transport: "ipc", pipeIndex: pipeIndex });
            client.on("ready", () => {
                sendExtensionMessage(true, `CLIENT_READY_PIPE_${pipeIndex}`);
            });
            await client.login({ clientId: currentApplication.id });
            clients.push({ client, pipeIndex: pipeIndex, ready: true });
            sendExtensionMessage(true, `NEW_CLIENT_CONNECTED_PIPE_${pipeIndex}`);
        } catch (err) {
            // pipe not available, skip
        }
    }
}, 30000);

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
    if (json.jsApplicationType && json.jsApplicationType != currentApplication.type) {
        currentApplication.type = json.jsApplicationType;
        currentApplication.id = (currentApplication.type == "youtube") ? YT_APP_ID : YT_MUSIC_APP_ID;

        async function resetPresence() {
            // Destroy all existing clients
            for (const entry of clients) {
                try {
                    await entry.client.destroy();
                } catch (e) {
                    // ignore destroy errors
                }
            }
            clients = [];

            // Reconnect all with new app ID
            await discoverAndConnect();

            // Update presence on all new clients
            updatePresence(json.presenceData, 0);
        }
        clearPresence(resetPresence);
    }
    else {
        updatePresence(json.presenceData, 0);
    }
}

const processData = () => {
    const stringData = Buffer.concat(chunks);
    if (!sizeHasBeenRead()) payloadSize = stringData.readUInt32LE(0);

    if (stringData.length >= (payloadSize + 4)) {
        const contentWithoutSize = stringData.slice(4, (payloadSize + 4));
        flushChunksQueue();

        try {
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
        catch (err) {
            sendExtensionMessage(false, "FATAL_RUNTIME_ERROR", err);
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
