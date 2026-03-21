const { Server } = require("socket.io");

let io;

const initSocket = httpServer => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["Get", "Post"],
    },
  });

  io.on("connection", socket => {
    socket.on("joinRoom", userId => {
      console.log(`User ${userId} joined room`);
      socket.join(userId);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };
