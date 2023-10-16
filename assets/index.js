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
let images = {
  man: null,
  woman: null,
};

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
  if (ROOM.finished) return finishGame();
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

  PLAYERS = [];

  PLAYERS = data.map((player) => {
    return new Player({ date: Date.now(), ...player });
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

function finishGame() {
  const chat = document.querySelector("#chat");
  const chatNight = document.querySelector("#chat-night");
  chat.classList.add("hidden");
  chatNight.classList.add("hidden");
  const room = document.querySelector("#room");
  room.innerText = `Game finished - Time ${ROOM.winner} ganhou!`;
}

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
  alert("clickedOn " + sockId);
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

class Utils {
  static elementWidth(element) {
    return (
      element.clientWidth -
      parseFloat(
        window.getComputedStyle(element, null).getPropertyValue("padding-left")
      ) -
      parseFloat(
        window.getComputedStyle(element, null).getPropertyValue("padding-right")
      )
    );
  }

  static elementHeight(element) {
    return (
      element.clientHeight -
      parseFloat(
        window.getComputedStyle(element, null).getPropertyValue("padding-top")
      ) -
      parseFloat(
        window
          .getComputedStyle(element, null)
          .getPropertyValue("padding-bottom")
      )
    );
  }
}

p5DivClone = document.getElementById("canvas");
let WIDTH = Utils.elementWidth(p5DivClone) / 4;
let HEIGHT = Utils.elementHeight(p5DivClone) / 4;
let loadedImages = {};

class Player {
  constructor(data) {
    this.data = data;
  }

  display() {
    push();
    let multiplier = 0;
    if (this.data.index <= 4) {
      multiplier = 0;
    } else if (this.data.index <= 8) {
      multiplier = 1;
    } else if (this.data.index <= 12) {
      multiplier = 2;
    } else {
      multiplier = 3;
    }
    rect(WIDTH * (this.data.index - 1), HEIGHT * multiplier, WIDTH, HEIGHT);
    fill(255);
    image(
      images.man,
      WIDTH * (this.data.index - 1),
      HEIGHT * multiplier,
      WIDTH,
      HEIGHT
    );

    // if (this.data.role.image || loadedImages[this.data.id]) {
    //   if (loadedImages[this.data.id]) {
    //     image(
    //       loadedImages[this.data.id],
    //       smallImageX,
    //       smallImageY,
    //       smallImageSize,
    //       smallImageSize
    //     );
    //   } else {
    //     let smallImageSize = 50; // Tamanho da imagem pequena
    //     let smallImageX = WIDTH * (this.data.index - 1) - smallImageSize;
    //     let smallImageY = HEIGHT - smallImageSize;

    //     loadImage(this.data.role.image, (img) => {
    //       loadedImages[this.data.id] = img;
    //       image(img, smallImageX, smallImageY, smallImageSize, smallImageSize);
    //     });
    //   }
    // }
    pop();
  }

  clicked(mouseX, mouseY) {
    // Verifica se o mouse está dentro do retângulo
    if (
      mouseX > WIDTH * (this.data.index - 1) &&
      mouseX < WIDTH * (this.data.index - 1) + WIDTH &&
      mouseY > 0 &&
      mouseY < HEIGHT
    ) {
      clickedOn(this.data.socketId);
    }
  }
}

function setup() {
  p5Div = document.getElementById("canvas");
  const p5Canvas = createCanvas(
    Utils.elementWidth(p5Div),
    Utils.elementHeight(p5Div)
  );
  p5Canvas.parent(p5Div);
  loadImage("assets/bg.png", (img) => (images.man = img));
  loadImage("assets/bg.png", (img) => (images.woman = img));
}

function draw() {
  background(28, 36, 48);

  PLAYERS.length > 0 && PLAYERS.forEach((player) => player.display());
}

function mouseClicked() {
  PLAYERS.length > 0 &&
    PLAYERS.forEach((player) => player.clicked(mouseX, mouseY));
}

function windowResized() {
  p5Div = document.getElementById("canvas");
  resizeCanvas(Utils.elementWidth(p5Div), Utils.elementHeight(p5Div));

  WIDTH = Utils.elementWidth(p5Div) / 4;
  HEIGHT = Utils.elementHeight(p5Div) / 4;
}
