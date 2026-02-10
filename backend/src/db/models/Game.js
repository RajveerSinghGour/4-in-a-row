import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  gameId: String,
  player1: String,
  player2: String,
  winner: String,
  endedAt: Date,
});

export const Game = mongoose.model("Game", gameSchema);
