import Redis from "ioredis";
import { REDIS_URL } from "../server.js";

export const redis = new Redis(REDIS_URL);

const shutdown = () => redis.quit();
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
