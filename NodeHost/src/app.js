// Node.js version of YouTubeDiscordPresence (buttons and no watermark!)
// MAIN VARIABLE INITIALIZATION
const { version } = require('./version.json');

const fs = require("fs");
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
// Each entry: { client, ipcPath, ready }
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

// VERIFY DISCORD-RPC PATCH IS APPLIED
const IPCTransport = require("discord-rpc/src/transports/ipc");
if (!IPCTransport.prototype.connect.toString().includes("getIPCAtPath")) {
    sendExtensionMessage(false, "FATAL_RUNTIME_ERROR", "The 'discord-rpc' package is not patched. Please run 'npm run patch' or 'npx patch-package' in the NodeHost directory.");
    // if not applied, ipcPath is ignored and every client attaches to the first pipe found, even if multiple discord clients are found
}

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
            return { ipcPath: entry.ipcPath, success: true };
        } catch (err) {
            // Try reconnecting this specific client
            if (layer === 0) {
                try {
                    let newClient = new rpc.Client({ transport: "ipc", ipcPath: entry.ipcPath });
                    await newClient.login({ clientId: currentApplication.id });
                    await newClient.request("SET_ACTIVITY", {
                        pid: process.pid,
                        activity: presenceData
                    });
                    // Only replace the old client after SET_ACTIVITY succeeds
                    entry.client = newClient;
                    entry.ready = true;
                    return { ipcPath: entry.ipcPath, success: true, reconnected: true };
                } catch (loginErr) {
                    return { ipcPath: entry.ipcPath, success: false, error: loginErr };
                }
            }
            return { ipcPath: entry.ipcPath, success: false, error: err };
        }
    }));

    let anySuccess = results.some(r => r.status === "fulfilled" && r.value.success);
    if (anySuccess) {
        sendExtensionMessage(true, "PRESENCE_UPDATED");
    } else {
        let errors = results
            .filter(r => r.status === "fulfilled" && !r.value.success)
            .map(r => `${r.value.ipcPath}: ${r.value.error}`)
            .join("; ");
        sendExtensionMessage(false, "PRESENCE_UPDATING_ERROR", errors || "All clients failed");
        clearPresence();
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
            return { ipcPath: entry.ipcPath, success: true };
        } catch (err) {
            // Try reconnecting
            try {
                let newClient = new rpc.Client({ transport: "ipc", ipcPath: entry.ipcPath });
                await newClient.login({ clientId: currentApplication.id });
                entry.client = newClient;
                entry.ready = true;
                await newClient.request("SET_ACTIVITY", {
                    pid: process.pid,
                    activity: null
                });
                return { ipcPath: entry.ipcPath, success: true };
            } catch (loginErr) {
                return { ipcPath: entry.ipcPath, success: false, error: `${String(err)}, ${String(loginErr)}` };
            }
        }
    })).then((results) => {
        let anySuccess = results.some(r => r.status === "fulfilled" && r.value.success);
        if (anySuccess) {
            sendExtensionMessage(true, "PRESENCE_CLEARED");
        } else {
            let errors = results
                .filter(r => r.status === "fulfilled" && !r.value.success)
                .map(r => `${r.value.ipcPath}: ${r.value.error}`)
                .join("; ");
            sendExtensionMessage(false, "CLIENT_CONNECTION_ERROR", errors || "All clients failed to clear");
        }
        if (callback) callback();
    });
}

// IPC PIPE DISCOVERY
// Each Discord client listens on discord-ipc-N, taking the first free N. On Windows these are named pipes; elsewhere they
// are unix sockets in the runtime/temp directory, except that Flatpak and Snap builds of Discord (and of clients like
// Vesktop) on Linux create theirs inside their sandbox's own directory, so those are searched too.

const PIPE_COUNT = 4;

function listDirectory(dir) {
    try {
        return fs.readdirSync(dir);
    } catch (err) {
        return [];
    }
}

function getIPCPaths() {
    const pipeNames = Array.from({ length: PIPE_COUNT }, (_, i) => `discord-ipc-${i}`);
    if (process.platform === "win32") {
        return pipeNames.map(name => `\\\\?\\pipe\\${name}`);
    }

    const { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP } = process.env;
    const baseDir = (XDG_RUNTIME_DIR || TMPDIR || TMP || TEMP || "/tmp").replace(/\/$/, "");
    let dirs = [baseDir];
    if (process.platform === "linux") {
        for (const appId of listDirectory(`${baseDir}/app`)) dirs.push(`${baseDir}/app/${appId}`); // Flatpak
        for (const appId of listDirectory(`${baseDir}/.flatpak`)) dirs.push(`${baseDir}/.flatpak/${appId}/xdg-run`); // Flatpak (private runtime dir)
        for (const name of listDirectory(baseDir)) {
            if (name.startsWith("snap.")) dirs.push(`${baseDir}/${name}`); // Snap
        }
    }

    // Flatpak users often symlink the sandboxed socket into the runtime directory, so resolve links to avoid attaching to the same client twice
    let socketPaths = new Set();
    for (const dir of dirs) {
        for (const name of pipeNames) {
            try {
                socketPaths.add(fs.realpathSync(`${dir}/${name}`));
            } catch (err) {
                // pipe does not exist, skip
            }
        }
    }
    return [...socketPaths];
}

// CLIENT CONNECTION — discover and connect to ALL Discord pipes

async function discoverAndConnect(shouldLog = true) {
    let connectedPipes = new Set(clients.map(c => c.ipcPath));

    for (const ipcPath of getIPCPaths()) {
        if (connectedPipes.has(ipcPath)) continue; // already connected

        try {
            let client = new rpc.Client({ transport: "ipc", ipcPath: ipcPath });
            client.on("ready", () => {
                sendExtensionMessage(true, `CLIENT_READY (${ipcPath})`);
            });
            
            // Add disconnect handler to remove stale clients
            client.on("disconnected", () => {
                const index = clients.findIndex(c => c.ipcPath === ipcPath);
                if (index !== -1) {
                    clients.splice(index, 1);
                    sendExtensionMessage(true, `CLIENT_DISCONNECTED (${ipcPath})`);
                }
            });
            
            await client.login({ clientId: currentApplication.id });
            clients.push({ client, ipcPath: ipcPath, ready: true });
            sendExtensionMessage(true, `CONNECTED_TO_PIPE (${ipcPath})`);
        } catch (err) {
            // pipe not available or connection failed, skip
        }
    }

    if (shouldLog) {
        if (clients.length === 0) {
            sendExtensionMessage(false, "NO_DISCORD_CLIENTS_CONNECTED");
        } else {
            sendExtensionMessage(true, `CONNECTED_TO_${clients.length}_DISCORD_CLIENTS`);
        }
    }
}

// Initial connection
discoverAndConnect();

// Periodically check for new Discord clients
const clientDiscoveryInterval = setInterval(() => discoverAndConnect(false), 10000);

// // READING DATA FROM BROWSER EXTENSION
// // REFERENCED FROM: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#app_side

let payloadSize = null;
let chunks = [];

const sizeHasBeenRead = () => payloadSize !== null;
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
    if (chunks.length > 0) processData();
});

process.stdin.on("end", async () => {
    clearInterval(clientDiscoveryInterval);

    const activeClients = clients;
    clients = [];
    await Promise.allSettled(activeClients.map(entry => entry.client.destroy()));
    process.exit(0);
});
