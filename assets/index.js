const STYLES = {
    messageChat: "bg-gray-200 rounded p-2 mb-2",
    userCard: "min-w-[70px] w-[24%] h-[120px] bg-gray-200 rounded p-2 mb-2 flex flex-col justify-center items-center"
}

let USERS = []
let LOBBY = []
let GAME = {}
let USER = {}

const socket = io("http://localhost:3001/", {
    auth: {
      token: "1234",
    },
    reconnectionAttempts: 3,
    transports: ["websocket"],
});

socket.on("connect", () => {
    console.log("connected");
});

socket.on("disconnect", () => {
    console.log("disconnected");
});

socket.on("user", (data) => {
  console.log(data)
});

socket.on("start-game", (data) => {
    console.log(data)
    GAME = data
    appendOnChat("Game started");
})

socket.on("lobby", (data) => {
    appendOnChat(data.name + " joined the lobby");
});

socket.on("users-data", (data) => {
    // save users data on USERS array, if already exists, update
    USERS = data;
    
    console.log(1111, USERS)

    // clear users container
    const usersContainer = document.querySelector("#users");
    usersContainer.innerHTML = "";
    USERS.forEach((user) => {
        const userDom = createUserDom(user.name, user.id, user.socketId);
        appendUser(userDom);
    });
});

socket.on("chat", ({message, sockId, sender}) => {
    if (sockId === socket.id) {
        appendOnChat(`You: ${message}`);
    } else {
        appendOnChat(`${sender}: ${message}`);
    }
})

const chatForm = document.getElementById("chat-form")
chatForm.onsubmit = (e) => {
    e.preventDefault();
    sendMessage();
}


function sendMessage() {
    const msg = document.querySelector("#message");

    socket.emit("chat", { message: msg.value });

    msg.value = "";
}

function appendOnChat(message) {
    const chat = document.querySelector("#chat");
    const msg = document.createElement("div");
    msg.setAttribute("class", STYLES.messageChat);
    msg.innerText = message;
    chat.appendChild(msg);
}

function createUserDom(name, id, sockId) {
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

socket.on("pong", () => {
    timeEnd = Date.now();
    const ping = timeEnd - timeStart;
    console.log("ping", ping + "ms");
});

// ping
// setInterval(() => {
//     timeStart = Date.now();
//     socket.emit("ping");
// }, 1000);

// function setup() {
//     createCanvas(400, 400);
// }

// function draw() {
//     background(220);
//     ellipse(50,50,80,80);
// }