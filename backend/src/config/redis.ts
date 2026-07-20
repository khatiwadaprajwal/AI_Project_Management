import IORedis from "ioredis";
import { env } from "./env";

// Shared Redis connection — used by BullMQ queues/workers and general caching.
export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
});
