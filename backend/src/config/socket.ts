import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./env";

export let io: SocketIOServer;

export function initSocket(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  io.on("connection", (socket) => {
    socket.on("join", (room: string) => socket.join(room));
    socket.on("leave", (room: string) => socket.leave(room));
  });

  return io;
}
