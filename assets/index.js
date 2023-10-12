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
};

const STYLES = {
  messageChat: "bg-gray-200 rounded p-2 mb-2",
  userCard:
    "min-w-[70px] w-[24%] h-[120px] bg-gray-200 rounded p-2 mb-2 flex flex-col justify-center items-center",
  ping: "absolute top-2 right-2 bg-green-400 rounded p-2 mb-2 z-50 text-xs",
};

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
});

socket.on(SocketOnEvents.ROOM, ({ turn, turnNumber, startedAt }) => {
  console.log(22222222222);
  ROOM = room;
  const roomDiv = document.querySelector("#room");
  roomDiv.innerText = turn + " - " + turnNumber + " - " + startedAt;
});

socket.on(SocketOnEvents.PLAYERS, (data) => {
  // save users data on USERS array, if already exists, update
  PLAYERS = data;

  console.log(1111, PLAYERS);

  // clear users container
  const playersContainer = document.querySelector("#users");
  playersContainer.innerHTML = "";
  PLAYERS.forEach((player) => {
    const playerDom = createPlayerDom(
      player.profile.name,
      player.id,
      player.socketId
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

const chatForm = document.getElementById("chat-form");
chatForm.onsubmit = (e) => {
  e.preventDefault();
  sendMessage();
};

function sendMessage() {
  const msg = document.querySelector("#message");

  socket.emit(SocketEmitEvents.CHAT, { message: msg.value });

  msg.value = "";
}

function appendOnChat(message) {
  const chat = document.querySelector("#chat");
  const msg = document.createElement("div");
  msg.setAttribute("class", STYLES.messageChat);
  msg.innerText = message;
  chat.appendChild(msg);
}

function createPlayerDom(name, id, sockId) {
  const userDom = document.createElement("div");
  userDom.setAttribute("class", STYLES.userCard);
  userDom.innerText = name;
  userDom.setAttribute("data-user-id", id);
  userDom.setAttribute("data-socket-id", sockId);
  return userDom;
}

function appendUser(userDom) {
  const usersContainer = document.querySelector("#users");
  usersContainer.appendChild(userDom);
}

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
    return;
  } else {
    const pingElement = document.createElement("div");
    pingElement.setAttribute("id", "ping");
    pingElement.setAttribute("class", STYLES.ping);
    pingElement.innerText = ping + "ms";
    document.body.appendChild(pingElement);
  }
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
