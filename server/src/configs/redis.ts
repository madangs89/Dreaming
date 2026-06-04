import { Redis } from "ioredis";
import { REDIS_URL } from "./env.config.js";

export const appRedis = new Redis(REDIS_URL!, {
  maxRetriesPerRequest: null,
});
export const bullRedis = new Redis(REDIS_URL!, {
  maxRetriesPerRequest: null,
});

appRedis.on("error", (err) => {
  console.error("Redis error:", err);
});

appRedis.on("connect", () => {
  console.log("Connected to Redis");
});

bullRedis.on("error", (err) => {
  console.error("Bull Redis error:", err);
});

bullRedis.on("connect", () => {
  console.log("Connected to Bull Redis");
});
