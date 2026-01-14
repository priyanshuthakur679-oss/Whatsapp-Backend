import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Get allowed origins from environment
const allowedOrigins = (process.env.ALLOWED_ORIGINS?.split(',') || [
  "https://whatsapp-frontend-navy.vercel.app",
]).map(origin => origin.trim());

const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ["websocket", "polling"],
  pingTimeout: 20000,
  pingInterval: 10000,
  serveClient: false,
});

const userSocketMap = {};

export const getReceiverSocketId = (userId) => userSocketMap[userId];
export { io };
export { app };
export { server };

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  const userId = socket.handshake.auth?.userId;

  if (userId) {
    if (userSocketMap[userId]) {
      const prevSocket = io.sockets.sockets.get(userSocketMap[userId]);
      if (prevSocket) prevSocket.disconnect(true);
    }
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", (reason) => {
    console.log(`Disconnected: ${socket.id} (Reason: ${reason})`);
    if (userId && userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
  });
});
