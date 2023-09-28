const socket = io("http://localhost:3001/", {
    auth: {
      token: "1234",
    },
    reconnectionAttempts: 3,
    transports: ["websocket"],
  });

function setup() {
    createCanvas(400, 400);
}

function draw() {
    background(220);
    ellipse(50,50,80,80);
}