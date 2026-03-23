const { Server } = require("socket.io");

let io;
const onlineUsers = new Map();

const normalizeUserId = userId => (userId ? String(userId) : "");

const addUserSocket = (userId, socketId) => {
  const existingSockets = onlineUsers.get(userId) || new Set();
  const wasOffline = existingSockets.size === 0;
  existingSockets.add(socketId);
  onlineUsers.set(userId, existingSockets);
  return wasOffline;
};

const removeUserSocket = (userId, socketId) => {
  const existingSockets = onlineUsers.get(userId);
  if (!existingSockets) return false;

  existingSockets.delete(socketId);

  if (existingSockets.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }

  onlineUsers.set(userId, existingSockets);
  return false;
};

const initSocket = httpServer => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["Get", "Post"],
    },
  });

  io.on("connection", socket => {
    socket.on("joinRoom", userId => {
      const normalizedUserId = normalizeUserId(userId);
      if (!normalizedUserId) return;

      const previousUserId = socket.data.userId;
      if (previousUserId && previousUserId !== normalizedUserId) {
        const becameOffline = removeUserSocket(previousUserId, socket.id);
        if (becameOffline) {
          io.emit("presence:update", {
            userId: previousUserId,
            isOnline: false,
          });
        }
        socket.leave(previousUserId);
      }

      socket.data.userId = normalizedUserId;
      socket.join(normalizedUserId);

      const becameOnline = addUserSocket(normalizedUserId, socket.id);
      socket.emit("presence:list", Array.from(onlineUsers.keys()));

      if (becameOnline) {
        io.emit("presence:update", {
          userId: normalizedUserId,
          isOnline: true,
        });
      }
    });

    socket.on("disconnect", () => {
      const normalizedUserId = socket.data.userId;
      if (!normalizedUserId) return;

      const becameOffline = removeUserSocket(normalizedUserId, socket.id);
      if (becameOffline) {
        io.emit("presence:update", {
          userId: normalizedUserId,
          isOnline: false,
        });
      }
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
