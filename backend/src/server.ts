import http from "http";
import { app } from "./app";
import { env } from "./config/env";
import { initSocket } from "./config/socket";
import { connectDB } from "./config/db";

const httpServer = http.createServer(app);
initSocket(httpServer);

const start = async () => {
  await connectDB();

  httpServer.listen(Number(env.PORT), () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
};

start();