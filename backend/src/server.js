import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { setupWebSocket } from "./ws/socket.js";

import { connectMongo } from "./db/mongo.js";
import { Leaderboard } from "./db/models/Leaderboard.js";

const app = express();
app.use(cors());
app.use(express.json());

/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (req, res) => {
  res.send("4 in a Row Backend Running");
});

/* -------------------- LEADERBOARD API -------------------- */
app.get("/leaderboard", async (req, res) => {
  try {
    const data = await Leaderboard.find().sort({ wins: -1 });
    res.json(data);
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

/* -------------------- HTTP + WEBSOCKET -------------------- */
const server = createServer(app);
setupWebSocket(server);

const PORT = 8080;
server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Connect MongoDB on startup
  await connectMongo();
});
