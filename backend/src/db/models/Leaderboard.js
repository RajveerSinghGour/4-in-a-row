import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  wins: { type: Number, default: 0 },
});

export const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);
