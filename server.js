const io = new Server(server, {
  cors: {
    origin: "https://mngoweby.netlify.app",  // NO trailing slash
    methods: ["GET", "POST"],
  },
});

const ACCESS_TOKEN = "marco-secret-room";    // pick what you want

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
    socket.broadcast.emit("chat-message", safe);
  });
});
  console.log("chat server running on http://localhost:" + PORT);
});
