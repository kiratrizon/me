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
let micOn = true;
let camOn = true;

const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

// Connection parameters
const appId = document.getElementById("appId").value;
const channel = document.getElementById("channel").value;
const token = document.getElementById("token").value;
const uid = 0;

const pusherKey = document.getElementById("pusherKey").value;
const pusherCluster = document.getElementById("pusherCluster").value;

const chatInput = $("#chat-input");
const grid = document.getElementById("video-grid");

const joinBtn = $("#join");
const leaveBtn = $("#leave");
const micBtn = $("#toggleMic");
const camBtn = $("#toggleCam");

/* ======================= Chat (Pusher) ======================= */

Pusher.setLogToConsole = true;

const pusher = new Pusher(pusherKey, {
    cluster: pusherCluster
});

const randomId = Math.floor(Math.random() * 10000);

let messageCount = 0;
let unread = 0;

const event = "vc-chat";
const pusherChannel = pusher.subscribe(`${channel}`);
pusherChannel.bind(event, function (data) {
    if (messageCount == 0) {
        // hide the No messages yet
        $("#no-messages").remove();
    }
    messageCount++;
    appendMessage(data.message, data.uid === randomId, data.uid);

    if (data.uid !== randomId && $("#chatPanel").is(":hidden")) {
        unread++;
        $("#unreadBadge").text(unread > 9 ? "9+" : unread).removeClass("hidden");
    }
});

function appendMessage(message, mine, senderId) {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const row = $("<div>").addClass(`flex flex-col gap-1 max-w-[85%] ${mine ? "self-end items-end" : "self-start items-start"}`);
    const meta = $("<span>").addClass("text-[11px] text-gray-500 px-1").text(`${mine ? "You" : `Guest ${senderId}`} · ${time}`);
    // .text() escapes the message so nobody can inject HTML into the chat
    const bubble = $("<div>")
        .addClass(`px-4 py-2.5 rounded-2xl text-sm break-words whitespace-pre-wrap ${mine
            ? "rounded-br-md bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white"
            : "rounded-bl-md bg-white/10 text-gray-100"}`)
        .text(message);

    row.append(meta, bubble);
    const box = $("#chat-messages");
    box.append(row);
    box.scrollTop(box[0].scrollHeight);
}

function sendMessage(message) {
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

/* ======================= UI helpers ======================= */

function setStatus(text, color) {
    $("#statusText").text(text);
    $("#statusDot").attr("class", `w-1.5 h-1.5 rounded-full ${color}`);
}

function showError(text) {
    $("#callErrorText").text(text);
    $("#callError").removeClass("hidden");
}

function hideError() {
    $("#callError").addClass("hidden");
}

let timerHandle = null;
function startTimer() {
    const start = Date.now();
    clearInterval(timerHandle);
    timerHandle = setInterval(() => {
        const s = Math.floor((Date.now() - start) / 1000);
        const h = Math.floor(s / 3600);
        const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
        const ss = String(s % 60).padStart(2, "0");
        $("#callTimer").text(h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`);
    }, 1000);
}

// Resize the grid to fit however many tiles there are
function updateLayout() {
    const count = grid.children.length;
    const cols = count <= 1 ? "grid-cols-1" : count <= 4 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-3";
    grid.className = `grid flex-1 min-h-0 gap-3 sm:gap-4 auto-rows-fr ${cols}`;
    $("#participantCount").text(count);
    $("#waitingCard").toggle(count <= 1 && !!client?.uid);
}

function setButton(btn, on, onIcon, offIcon, onTitle, offTitle) {
    btn.attr("aria-pressed", on)
        .attr("title", on ? onTitle : offTitle)
        .toggleClass("bg-white/10 hover:bg-white/20", on)
        .toggleClass("bg-red-500 hover:bg-red-400", !on)
        .html(`<i class="fa-solid ${on ? onIcon : offIcon}"></i>`);
}

/* ======================= Video tiles ======================= */

function createTile(id, labelText, isLocal) {
    const tile = document.createElement("div");
    tile.id = id;
    tile.className =
        "group relative min-h-40 rounded-3xl overflow-hidden bg-gray-900 border border-white/10 shadow-xl ring-0 ring-emerald-400 transition-[box-shadow] duration-150";

    const initial = isLocal ? "You" : labelText.replace(/\D/g, "").slice(-2) || "?";
    tile.innerHTML = `
        <div class="video-slot absolute inset-0"></div>
        <div class="cam-off absolute inset-0 hidden flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-950 via-gray-900 to-fuchsia-950">
            <div class="w-20 h-20 sm:w-24 sm:h-24 grid place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 font-display text-xl font-bold shadow-lg shadow-indigo-500/30">${initial}</div>
            <span class="text-xs text-gray-400"><i class="fa-solid fa-video-slash mr-1"></i> Camera off</span>
        </div>
        <div class="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur text-xs font-medium">
            <i class="mic-off fa-solid fa-microphone-slash text-red-400 hidden"></i>
            <span class="tile-label"></span>
        </div>`;
    tile.querySelector(".tile-label").textContent = labelText;

    grid.appendChild(tile);
    updateLayout();
    return tile;
}

function setCamOff(tile, off) {
    tile?.querySelector(".cam-off")?.classList.toggle("hidden", !off);
    tile?.querySelector(".cam-off")?.classList.toggle("flex", off);
}

function setMicOff(tile, off) {
    tile?.querySelector(".mic-off")?.classList.toggle("hidden", !off);
}

function getRemoteTile(user) {
    let tile = document.getElementById(`remote-${user.uid}`);
    if (!tile) {
        tile = createTile(`remote-${user.uid}`, `Guest ${user.uid}`, false);
        setCamOff(tile, !user.hasVideo);
        setMicOff(tile, !user.hasAudio);
        addVolumeControl(tile, user);
    }
    return tile;
}

function addVolumeControl(tile, user) {
    const wrap = document.createElement("div");
    wrap.className =
        "absolute top-3 right-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition";
    wrap.innerHTML = `<i class="fa-solid fa-volume-high text-xs"></i>`;

    const volumeInput = document.createElement("input");
    volumeInput.type = "range";
    volumeInput.min = "0";
    volumeInput.max = "100";
    volumeInput.value = "100";
    volumeInput.className = "w-24 accent-indigo-400 cursor-pointer";
    volumeInput.setAttribute("aria-label", "Volume");
    volumeInput.addEventListener("input", () => {
        user.audioTrack?.setVolume(Number(volumeInput.value));
    });

    wrap.appendChild(volumeInput);
    tile.appendChild(wrap);
}

/* ======================= Agora ======================= */

// Initialize the AgoraRTC client
function initializeClient() {
    client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setupEventListeners();
}

// Handle client events
function setupEventListeners() {
    client.on("user-joined", (user) => {
        getRemoteTile(user);
    });

    client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        console.log("subscribe success");
        const tile = getRemoteTile(user);

        if (mediaType === "video") {
            setCamOff(tile, false);
            user.videoTrack.play(tile.querySelector(".video-slot"));
        }

        if (mediaType === "audio") {
            setMicOff(tile, false);
            user.audioTrack.play();
        }
    });

    // Fired when user stops camera/mic — keep the tile, show placeholder
    client.on("user-unpublished", (user, mediaType) => {
        const tile = document.getElementById(`remote-${user.uid}`);
        if (mediaType === "video") setCamOff(tile, true);
        if (mediaType === "audio") setMicOff(tile, true);
    });

    // Fired when user LEAVES the channel
    client.on("user-left", (user) => {
        document.getElementById(`remote-${user.uid}`)?.remove();
        updateLayout();
    });

    client.on("connection-state-change", (state) => {
        if (state === "CONNECTED") setStatus("Live", "bg-emerald-400");
        else if (state === "RECONNECTING") setStatus("Reconnecting...", "bg-amber-400");
        else if (state === "DISCONNECTED") setStatus("Disconnected", "bg-gray-500");
        else setStatus("Connecting...", "bg-amber-400");
    });

    // Glow ring around whoever is talking
    client.enableAudioVolumeIndicator();
    client.on("volume-indicator", (volumes) => {
        volumes.forEach(({ uid: speakerUid, level }) => {
            const isLocal = speakerUid === 0 || speakerUid === client.uid;
            const tile = document.getElementById(isLocal ? `local-${uid}` : `remote-${speakerUid}`);
            if (!tile) return;
            tile.classList.toggle("ring-4", level > 5);
            tile.classList.toggle("ring-0", level <= 5);
        });
    });
}

// Join a channel and publish local media
async function joinChannel() {
    hideError();
    joinBtn.prop("disabled", true).find("span").text("Joining...");
    try {
        if (client.connectionState === "DISCONNECTED") {
            await client.join(appId, channel, token, uid);
        }
        await createLocalTracks();
        await publishLocalTracks();
        displayLocalVideo();
        console.log("Publish success!");

        micBtn.prop("disabled", false);
        camBtn.prop("disabled", false);
        startTimer();
        showLeave();
    } catch (error) {
        console.error(error);
        const denied = error?.code === "PERMISSION_DENIED" || /permission/i.test(error?.message || "");
        showError(denied
            ? "Camera or microphone access was blocked. Allow access in your browser, then press Join."
            : "Couldn't join the call. Check your connection and try again.");
        showJoin();
    } finally {
        joinBtn.prop("disabled", false).find("span").text("Join");
        updateLayout();
    }
}

// Create local audio and video tracks
async function createLocalTracks() {
    localAudioTrack ??= await AgoraRTC.createMicrophoneAudioTrack();
    localVideoTrack ??= await AgoraRTC.createCameraVideoTrack();
}

// Publish local audio and video tracks
async function publishLocalTracks() {
    await client.publish([localAudioTrack, localVideoTrack]);
}

// Display local video
function displayLocalVideo() {
    const tile = document.getElementById(`local-${uid}`) || createTile(`local-${uid}`, "You", true);
    // local tile always first
    grid.prepend(tile);
    localVideoTrack.play(tile.querySelector(".video-slot"));
}

async function toggleMic() {
    if (!localAudioTrack) return;
    micOn = !micOn;
    await localAudioTrack.setEnabled(micOn);
    setButton(micBtn, micOn, "fa-microphone", "fa-microphone-slash", "Mute microphone", "Unmute microphone");
    setMicOff(document.getElementById(`local-${uid}`), !micOn);
}

async function toggleCam() {
    if (!localVideoTrack) return;
    camOn = !camOn;
    await localVideoTrack.setEnabled(camOn);
    setButton(camBtn, camOn, "fa-video", "fa-video-slash", "Turn camera off", "Turn camera on");
    setCamOff(document.getElementById(`local-${uid}`), !camOn);
}

async function leaveChannel() {
    try {
        localAudioTrack?.stop();
        localAudioTrack?.close();

        localVideoTrack?.stop();
        localVideoTrack?.close();

        await client.leave();

        grid.innerHTML = "";
        clearInterval(timerHandle);

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
    joinBtn.removeClass("hidden").addClass("inline-flex");
    leaveBtn.addClass("hidden").removeClass("inline-flex");
}

function showLeave() {
    joinBtn.addClass("hidden").removeClass("inline-flex");
    leaveBtn.removeClass("hidden").addClass("inline-flex");
}

startBasicCall();

$(document).ready(function () {
    joinBtn.on("click", joinChannel);
    leaveBtn.on("click", leaveChannel);
    micBtn.on("click", toggleMic);
    camBtn.on("click", toggleCam);

    // trigger join
    joinChannel();

    $("#chat-form").on("submit", function (e) {
        e.preventDefault();
        const message = chatInput.val().trim();
        if (message) {
            sendMessage(message);
        }
    });

    // Mobile chat drawer
    $("#toggleChat").on("click", function () {
        $("#chatPanel").removeClass("hidden").addClass("flex");
        unread = 0;
        $("#unreadBadge").addClass("hidden");
        chatInput.trigger("focus");
    });
    $("#closeChat").on("click", function () {
        $("#chatPanel").addClass("hidden").removeClass("flex");
    });
});
