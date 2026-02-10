import { v4 as uuid } from "uuid";
import {
  ROWS,
  COLS,
  EMPTY,
  PLAYER_ONE,
  PLAYER_TWO,
} from "../utils/constants.js";

import {
  checkWinner,
  isBoardFull,
  getNextOpenRow,
  cloneBoard,
} from "./gameLogic.js";

import { createBot } from "../bot/botPlayer.js";
import { Game } from "../db/models/Game.js";
import { Leaderboard } from "../db/models/Leaderboard.js";

/* -------------------- STATE -------------------- */

let waitingPlayer = null;
let waitingTimeout = null;

const activeGames = new Map(); // gameId → game
const socketToGame = new Map(); // ws → gameId

/* -------------------- HELPERS -------------------- */

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => EMPTY),
  );
}

/* -------------------- MATCHMAKING -------------------- */

export function addPlayerToQueue(ws, username) {
  ws.username = username;
  ws.isBot = false;

  /* 🔁 RECONNECT */
  for (const [gameId, game] of activeGames.entries()) {
    for (const key of [PLAYER_ONE, PLAYER_TWO]) {
      const player = game.players[key];

      if (player.username === username && game.disconnected === key) {
        game.players[key] = ws;
        socketToGame.set(ws, gameId);

        clearTimeout(game.disconnectTimer);
        game.disconnectTimer = null;
        game.disconnected = null;
        game.status = "In Progress";

        ws.send(
          JSON.stringify({
            type: "GAME_UPDATE",
            payload: {
              board: game.board,
              currentTurn: game.players[game.turn]?.username,
              status: "Reconnected",
            },
          }),
        );

        broadcast(game);
        return;
      }
    }
  }

  /* 🤝 NORMAL MATCHMAKING */
  if (waitingPlayer) {
    clearTimeout(waitingTimeout);

    const opponent = waitingPlayer;
    waitingPlayer = null;
    waitingTimeout = null;

    startGame(opponent, ws);
    return;
  }

  waitingPlayer = ws;

  ws.send(
    JSON.stringify({
      type: "GAME_UPDATE",
      payload: {
        board: createEmptyBoard(),
        status: "Waiting for opponent...",
      },
    }),
  );

  /* 🤖 BOT AFTER 10s */
  waitingTimeout = setTimeout(() => {
    const bot = createBot();
    startGame(ws, bot);
    waitingPlayer = null;
    waitingTimeout = null;
  }, 10000);
}

/* -------------------- GAME CREATION -------------------- */

function startGame(player1, player2) {
  const gameId = uuid();

  const game = {
    id: gameId,
    board: createEmptyBoard(),
    players: {
      [PLAYER_ONE]: player1,
      [PLAYER_TWO]: player2,
    },
    turn: PLAYER_ONE,
    status: "In Progress",
    disconnected: null,
    disconnectTimer: null,
  };

  activeGames.set(gameId, game);
  socketToGame.set(player1, gameId);
  socketToGame.set(player2, gameId);

  broadcast(game);
}

/* -------------------- MOVES -------------------- */

export function makeMove(ws, column) {
  const gameId = socketToGame.get(ws);
  if (!gameId) return;

  const game = activeGames.get(gameId);
  if (!game || game.status !== "In Progress") return;

  const player = game.players[PLAYER_ONE] === ws ? PLAYER_ONE : PLAYER_TWO;

  if (game.turn !== player) return;

  for (let row = ROWS - 1; row >= 0; row--) {
    if (game.board[row][column] === EMPTY) {
      game.board[row][column] = player;

      if (checkWinner(game.board, player)) {
        endGame(game, `${game.players[player].username} wins`);
        return;
      }

      if (isBoardFull(game.board)) {
        endGame(game, "Draw");
        return;
      }

      game.turn = player === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
      broadcast(game);
      return;
    }
  }
}

/* -------------------- BOT LOGIC -------------------- */

function botMove(game) {
  const bot = game.turn;
  const human = bot === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;

  // WIN
  for (let col = 0; col < COLS; col++) {
    const row = getNextOpenRow(game.board, col);
    if (row === -1) continue;

    const temp = cloneBoard(game.board);
    temp[row][col] = bot;

    if (checkWinner(temp, bot)) {
      makeBotMove(game, row, col);
      return;
    }
  }

  // BLOCK
  for (let col = 0; col < COLS; col++) {
    const row = getNextOpenRow(game.board, col);
    if (row === -1) continue;

    const temp = cloneBoard(game.board);
    temp[row][col] = human;

    if (checkWinner(temp, human)) {
      makeBotMove(game, row, col);
      return;
    }
  }

  // CENTER PRIORITY
  for (let col of [3, 2, 4, 1, 5, 0, 6]) {
    const row = getNextOpenRow(game.board, col);
    if (row !== -1) {
      makeBotMove(game, row, col);
      return;
    }
  }
}

function makeBotMove(game, row, col) {
  game.board[row][col] = game.turn;

  if (checkWinner(game.board, game.turn)) {
    endGame(game, "BOT wins");
    return;
  }

  if (isBoardFull(game.board)) {
    endGame(game, "Draw");
    return;
  }

  game.turn = game.turn === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
  broadcast(game);
}

/* -------------------- DISCONNECT / FORFEIT -------------------- */

export function handleDisconnect(ws) {
  const gameId = socketToGame.get(ws);
  if (!gameId) return;

  const game = activeGames.get(gameId);
  if (!game || game.status !== "In Progress") return;

  const player = game.players[PLAYER_ONE] === ws ? PLAYER_ONE : PLAYER_TWO;

  game.disconnected = player;
  game.status = "Paused";

  broadcastPause(game, ws);

  game.disconnectTimer = setTimeout(() => {
    const winnerKey = player === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;

    endGame(game, `${game.players[winnerKey].username} wins by forfeit`);
  }, 30000);
}

/* -------------------- BROADCAST -------------------- */

function broadcast(game) {
  const payload = {
    type: "GAME_UPDATE",
    payload: {
      board: game.board,
      currentTurn: game.players[game.turn]?.username,
      status: game.status,
    },
  };

  Object.values(game.players).forEach((ws) => {
    if (!ws.isBot) ws.send(JSON.stringify(payload));
  });

  if (game.players[game.turn].isBot) {
    setTimeout(() => botMove(game), 500);
  }
}

function broadcastPause(game, disconnectedWs) {
  Object.values(game.players).forEach((ws) => {
    if (!ws.isBot && ws !== disconnectedWs) {
      ws.send(
        JSON.stringify({
          type: "GAME_UPDATE",
          payload: {
            board: game.board,
            status: "Opponent disconnected. Waiting 30s...",
          },
        }),
      );
    }
  });
}

/* -------------------- GAME END (MongoDB) -------------------- */

async function endGame(game, result) {
  game.status = "Game Over";

  const p1 = game.players[PLAYER_ONE]?.username;
  const p2 = game.players[PLAYER_TWO]?.username;

  let winner = "DRAW";
  if (!result.includes("Draw")) {
    winner = result.replace(" wins", "");
  }

  // 🧾 Save game
  await Game.create({
    gameId: game.id,
    player1: p1,
    player2: p2,
    winner,
    endedAt: new Date(),
  });

  // 🏆 Update leaderboard
  if (winner !== "DRAW" && winner !== "BOT") {
    await Leaderboard.findOneAndUpdate(
      { username: winner },
      { $inc: { wins: 1 } },
      { upsert: true },
    );
  }

  // Notify players
  Object.values(game.players).forEach((ws) => {
    if (!ws.isBot) {
      ws.send(
        JSON.stringify({
          type: "GAME_OVER",
          payload: {
            board: game.board,
            result,
          },
        }),
      );
    }
    socketToGame.delete(ws);
  });

  activeGames.delete(game.id);
}
