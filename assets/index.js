const SocketEmitEvents = {
  PING: "ping",
  HANDLE_SKILL: "handle-skill",
  VOTE: "vote",
  CHAT: "chat",
  CHAT_NIGHT: "chat-night",
  CHAT_TO: "chat-to",
};

const SocketOnEvents = {
  CONNECT: "connect",
  PONG: "pong",
  ROOM: "room",
  VOTE: "vote",
  CHAT: "chat",
  CHAT_NIGHT: "chat-night",
  CHAT_TO: "chat-to",
  DISCONNECT: "disconnect",
  PLAYERS: "players",
  CHAT_ALERT: "chat-alert",
};

const STYLES = {
  messageChat: "bg-gray-200 rounded p-2 mb-2",
  userCard:
    "min-w-[70px] w-[24%] h-[120px] bg-gray-200 rounded p-2 mb-2 flex flex-col justify-center items-center",
  ping: "absolute top-2 right-2 bg-green-400 rounded p-2 mb-2 z-50 text-xs",
};

let SKILL = false;
let PLAYERS = [];
let ROOM = {};

const socket = io("http://localhost:3001/", {
  auth: {
    token: localStorage.getItem("token"),
  },
  reconnectionAttempts: 3,
  transports: ["websocket"],
});

socket.on(SocketOnEvents.CONNECT, () => {
  console.log("connected");
});

socket.on(SocketOnEvents.DISCONNECT, () => {
  console.log("disconnected");
  window.location.href = "/dashboard.html";
});

socket.on(SocketOnEvents.ROOM, (room) => {
  if (!room) {
    return;
  }
  const { turn, turnNumber, startedAt } = room;
  ROOM = room;
  const roomDiv = document.querySelector("#room");
  roomDiv.innerText = turn + " - " + turnNumber + " - " + startedAt;
  if (ROOM.turn === "NIGHT") {
    const chat = document.querySelector("#chat");
    const chatNight = document.querySelector("#chat-night");
    chat.classList.add("hidden");
    chatNight.classList.remove("hidden");
  } else {
    const chat = document.querySelector("#chat");
    const chatNight = document.querySelector("#chat-night");
    chat.classList.remove("hidden");
    chatNight.classList.add("hidden");
  }
});

socket.on(SocketOnEvents.PLAYERS, (data) => {
  if (!data) {
    return;
  }
  PLAYERS = data;

  const playersContainer = document.querySelector("#users");
  playersContainer.innerHTML = "";
  PLAYERS.forEach((player) => {
    const playerDom = createPlayerDom(
      player.profile.name,
      player.id,
      player.socketId,
      player
    );
    appendUser(playerDom);
  });
});

socket.on(SocketOnEvents.CHAT, ({ message, sockId, sender }) => {
  if (sockId === socket.id) {
    appendOnChat(`You: ${message}`);
  } else {
    appendOnChat(`${sender}: ${message}`);
  }
});

socket.on(SocketOnEvents.CHAT_NIGHT, ({ message, sockId, sender }) => {
  if (sockId === socket.id) {
    appendOnChat(`You: ${message}`, null, true);
  } else {
    appendOnChat(`${sender}: ${message}`, null, true);
  }
});

socket.on(SocketOnEvents.CHAT_TO, (message) => {
  appendOnChat(`${sender}: ${message}`, "bg-blue-300");
});

const chatForm = document.getElementById("chat-form");
chatForm.onsubmit = (e) => {
  e.preventDefault();
  sendMessage();
};

function vote(sockId) {
  socket.emit(SocketEmitEvents.VOTE, { target: sockId });
}

function handleSkill(sockId) {
  socket.emit(SocketEmitEvents.VOTE, { target: sockId });
}

function sendMessage() {
  const msg = document.querySelector("#message");

  socket.emit(SocketEmitEvents.CHAT, { message: msg.value });

  msg.value = "";
}

function appendOnChat(message, background = null, night = false) {
  const chat = document.querySelector(`${"#chat"}${night ? "-night" : ""}`);
  const msg = document.createElement("div");
  msg.setAttribute(
    "class",
    background ? background + " " + STYLES.messageChat : STYLES.messageChat
  );
  msg.textContent = message;
  chat.appendChild(msg);
}

function clickedOn(sockId) {
  if (SKILL) {
    handleSkill(sockId);
  } else {
    if (ROOM.turn === "NIGHT" || ROOM.turn === "VOTE") {
      vote(sockId);
    }
  }
}

function createPlayerDom(name, id, sockId, player) {
  return `
    <div class="${STYLES.userCard}" data-user-id="${id}" onclick="${
    sockId && sockId !== socket.id ? `clickedOn('${sockId}')` : "() => {}"
  }">
      ${name}
      ${
        player.role
          ? `<img src="${player.role.image}" alt="${player.role.name}" class="w-16 h-16 rounded-full">`
          : ""
      }
      vivo: ${player.alive}
    </div>
  `;
}

function appendUser(userDom) {
  const usersContainer = document.querySelector("#users");
  usersContainer.innerHTML += userDom;
}

function createRoomTimer() {
  const timerDiv = document.querySelector("#timer");
  const actualTurnStartedAt = new Date(ROOM.actualTurnStartedAt);
  const now = new Date();
  const timeLeft = 30 - Math.floor((now - actualTurnStartedAt) / 1000);

  timerDiv.innerText = timeLeft < 0 ? 30 : timeLeft;
}

socket.on(SocketOnEvents.CHAT_ALERT, ({ message }) => {
  appendOnChat(message, "bg-red-400", ROOM.turn === "NIGHT" ? true : false);
});

let timeStart = Date.now();
let timeEnd = Date.now();

socket.on(SocketOnEvents.PONG, () => {
  timeEnd = Date.now();
  const ping = timeEnd - timeStart;

  // crate an element to show ping

  let pingElement;
  pingElement = document.querySelector("#ping");
  if (pingElement) {
    pingElement.innerText = ping + "ms";
  } else {
    const pingElement = document.createElement("div");
    pingElement.setAttribute("id", "ping");
    pingElement.setAttribute("class", STYLES.ping);
    pingElement.innerText = ping + "ms";
    document.body.appendChild(pingElement);
  }

  createRoomTimer();
});

setInterval(() => {
  timeStart = Date.now();
  socket.emit(SocketEmitEvents.PING, "ping");
}, 1000);

// function setup() {
//     createCanvas(400, 400);
// }

// function draw() {
//     background(220);
//     ellipse(50,50,80,80);
// }
