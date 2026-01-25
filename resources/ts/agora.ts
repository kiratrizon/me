// @ts-nocheck //
import AgoraRTC from "agora-rtc-sdk-ng";
import $ from "jquery";
import Pusher from "pusher-js";
AgoraRTC.setLogLevel(4);

// RTC client instance
let client = null;

// Declare variables for the local tracks
let localAudioTrack = null; 
let localVideoTrack = null; 

const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

// Connection parameters
const appId = document.getElementById("appId").value;
const channel = document.getElementById("channel").value;
const token = document.getElementById("token").value;
const uid = 0;

const pusherKey = document.getElementById("pusherKey").value;
const pusherCluster = document.getElementById("pusherCluster").value;

const chatInput = $("#chat-input");
const chatSend = $("#chat-send");

Pusher.setLogToConsole = true;

const pusher = new Pusher(pusherKey, {
    cluster: pusherCluster
});

const randomId = Math.floor(Math.random() * 10000);

let messageCount = 0;

const event = "vc-chat";
const pusherChannel = pusher.subscribe(`${channel}`);
pusherChannel.bind(event, function(data) {
    const message = data.message;
    const receiveUid = data.uid;
    if (messageCount == 0){
        // hide the No messages yet
        $("#no-messages").hide();
    }
    messageCount++;
    if (receiveUid === randomId) {
        // Append message to chatbox left side
        $("#chat-messages").append(`<div class="text-white"><strong class="text-green-400">You:</strong> ${message}</div>`);
    } else {
        // Append message to chatbox right side
        $("#chat-messages").append(`<div class="text-red-400 text-right">${message}</div>`);
    }
});

const joinBtn = $("#join");
const leaveBtn = $("#leave");

// Initialize the AgoraRTC client
function initializeClient() {
    client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setupEventListeners();
}

// Handle client events
function setupEventListeners() {
    client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        console.log("subscribe success");

        if (mediaType === "video") {
            displayRemoteVideo(user);
        }

        if (mediaType === "audio") {
            user.audioTrack.play();
        }
    });

    // Fired when user stops camera/mic
    client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video") {
            document.getElementById(`remote-${user.uid}`)?.remove();
        }
    });

    // 🔥 Fired when user LEAVES the channel
    client.on("user-left", (user) => {
        document.getElementById(`remote-${user.uid}`)?.remove();
    });
}

// Join a channel and publish local media
async function joinChannel() {
    await client.join(appId, channel, token, uid);
    await createLocalTracks();
    await publishLocalTracks();
    displayLocalVideo();
    console.log("Publish success!");

    showLeave();
}

// Create local audio and video tracks
async function createLocalTracks() {
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localVideoTrack = await AgoraRTC.createCameraVideoTrack();
}

// Publish local audio and video tracks
async function publishLocalTracks() {
    await client.publish([localAudioTrack, localVideoTrack]);
}

// Display local video
function displayLocalVideo() {
    const localPlayerContainer = document.createElement("div");
    localPlayerContainer.id = `local-${uid}`;
    localPlayerContainer.className =
        "relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow";

    // Label
    const label = document.createElement("div");
    label.textContent = `You (${uid})`;
    label.className =
        "absolute top-2 left-2 px-3 py-1 text-xs font-medium rounded-lg bg-black/70 text-white z-10";

    localPlayerContainer.appendChild(label);

    document.getElementById("video-grid")?.appendChild(localPlayerContainer);

    localVideoTrack.play(localPlayerContainer);
}

// Display remote video
function displayRemoteVideo(user) {
    const remoteVideoTrack = user.videoTrack;
    const remoteAudioTrack = user.audioTrack;

    const remotePlayerContainer = document.createElement("div");
    remotePlayerContainer.id = `remote-${user.uid}`;
    remotePlayerContainer.className =
        "relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow";

    // Label
    const label = document.createElement("div");
    label.textContent = `User ${user.uid}`;
    label.className =
        "absolute top-2 left-2 px-3 py-1 text-xs font-medium rounded-lg bg-black/70 text-white z-10";

    // Volume control
    const volumeWrapper = document.createElement("div");
    volumeWrapper.className =
        "absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-black/60 px-3 py-2 rounded-lg z-10";

    const volumeIcon = document.createElement("span");
    volumeIcon.textContent = "🔊";
    volumeIcon.className = "text-white text-sm";

    const volumeInput = document.createElement("input");
    volumeInput.type = "range";
    volumeInput.min = "0";
    volumeInput.max = "100";
    volumeInput.value = "100";
    volumeInput.className = "w-full accent-white cursor-pointer";

    volumeInput.addEventListener("input", () => {
        remoteAudioTrack?.setVolume(Number(volumeInput.value));
    });

    volumeWrapper.appendChild(volumeIcon);
    volumeWrapper.appendChild(volumeInput);

    remotePlayerContainer.appendChild(label);
    remotePlayerContainer.appendChild(volumeWrapper);

    document.getElementById("video-grid")?.appendChild(remotePlayerContainer);

    remoteVideoTrack.play(remotePlayerContainer);
}



async function leaveChannel() {
    try {
        localAudioTrack?.stop();
        localAudioTrack?.close();

        localVideoTrack?.stop();
        localVideoTrack?.close();

        document.getElementById(`local-${uid}`)?.remove();

        client.remoteUsers.forEach((user) => {
            document.getElementById(`remote-${user.uid}`)?.remove();
        });

        await client.leave();

        document.getElementById("video-grid")!.innerHTML = "";

        window.location.href = window.location.origin;
    } catch (error) {
        console.error(error);
    }
}



// Start the basic call
function startBasicCall() {
    initializeClient();
}

function showJoin() {
    joinBtn.removeClass("hidden");
    leaveBtn.addClass("hidden");
}

function showLeave() {
    joinBtn.addClass("hidden");
    leaveBtn.removeClass("hidden");
}


startBasicCall();

function sendMessage(message, chatInput) {
    fetch("/send-message", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
            "Accept": "application/json"
        },
        body: JSON.stringify({ message, channel, event, uid: randomId })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Message sent:", data);
        chatInput.val("");
    })
    .catch(error => {
        console.error("Error sending message:", error);
    });
}

$(document).ready(function() {
    joinBtn.on("click", joinChannel);
    leaveBtn.on("click", leaveChannel);

    // trigger join
    joinBtn.trigger("click");

    chatSend.on("click", function() {
        const message = chatInput.val();
        if (message) {
            sendMessage(message, chatInput);
        }
    });
});