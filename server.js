// server.js
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// serve any static files from ./public (for local testing)
app.use(express.static(path.join(__dirname, "public")));

const io = new Server(server, {
  cors: {
    origin: "*",              // <-- change this for debugging
    methods: ["GET", "POST"],
  },
});

// simple shared "password"
const ACCESS_TOKEN = "marco-secret-room";

io.on("connection", (socket) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;

  if (token !== ACCESS_TOKEN) {
    console.log("blocked connection with bad token", socket.id);
    socket.disconnect(true);
    return;
  }

  console.log("user connected:", socket.id);

  socket.on("chat-message", (data) => {
    const safe = {
      name: String(data.name || "").slice(0, 32),
      message: String(data.message || "").slice(0, 500),
      id: socket.id,
    };

    // send to everyone except sender
    socket.broadcast.emit("chat-message", safe);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("chat server running on port", PORT);
});
