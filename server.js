// server.js
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// serve static files from ./public
app.use(express.static(path.join(__dirname, "public")));

const io = new Server(server, {
  cors: {
    origin: "*",           // later: put your Netlify URL here if you want
    methods: ["GET", "POST"],
  },
});

const ACCESS_TOKEN = "super-secret-key-123";  // change to whatever you want

io.on("connection", (socket) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;

  if (token !== ACCESS_TOKEN) {
    console.log("blocked connection with bad token", socket.id);
    socket.disconnect(true);
    return;
  }

  console.log("user connected:", socket.id);

  // handle chat messages
  socket.on("chat-message", (data) => {
    // basic sanitizing so they can't send insane payloads
    const safe = {
      name: String(data.name || "").slice(0, 32),
      message: String(data.message || "").slice(0, 500),
      id: socket.id,
    };

    // broadcast to everyone else
    socket.broadcast.emit("chat-message", safe);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("chat server running on http://localhost:" + PORT);
});
