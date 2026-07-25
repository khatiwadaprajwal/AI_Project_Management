import http from "http";
import { app } from "./app";
import { env } from "./config/env";
import { initSocket } from "./config/socket";
import { connectDB } from "./config/db";
import { registerActivityLogSubscriber } from "./events/activityLog.subscriber";
import { registerAiSuggestionSubscriber } from "./events/aiSuggestion.subscriber";

const httpServer = http.createServer(app);
initSocket(httpServer);

const start = async () => {
  await connectDB();

  registerActivityLogSubscriber();
  registerAiSuggestionSubscriber();

  httpServer.listen(Number(env.PORT), () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
};

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

start();