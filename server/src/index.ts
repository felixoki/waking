import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerHandlers } from "./socket/index.js";
import { SERVER_PORT, WORLD_ID } from "./server.js";
import { AUTOSAVE_INTERVAL, HEARTBEAT_INTERVAL, TICK_RATE } from "./globals.js";
import { World } from "./World.js";
import { handlers } from "./handlers/index.js";

const app = express();
const server = createServer(app);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, worldId: WORLD_ID });
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const world = new World(io);

const restored = WORLD_ID
  ? await handlers.world.restore(WORLD_ID, world)
  : false;

if (!restored) world.load();

setInterval(() => {
  world.update(TICK_RATE);
}, TICK_RATE);

setInterval(() => {
  if (io.engine.clientsCount > 0) process.send?.({ type: "heartbeat" });
}, HEARTBEAT_INTERVAL);

io.on("connection", (socket) => {
  registerHandlers(io, socket, world);
});

if (WORLD_ID)
  setInterval(async () => {
    await handlers.world.save(WORLD_ID, world);
  }, AUTOSAVE_INTERVAL);

server.listen(SERVER_PORT, "0.0.0.0", () => {
  console.log(`World ${WORLD_ID} running on port ${SERVER_PORT}`);
});
