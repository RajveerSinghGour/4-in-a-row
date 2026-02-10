import { ROWS, COLS, EMPTY } from "../utils/constants.js";

export function checkWinner(board, player) {
  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal \
    [1, -1], // diagonal /
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;

      for (let [dr, dc] of directions) {
        let count = 0;

        for (let i = 0; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;

          if (
            nr >= 0 &&
            nr < ROWS &&
            nc >= 0 &&
            nc < COLS &&
            board[nr][nc] === player
          ) {
            count++;
          }
        }

        if (count === 4) return true;
      }
    }
  }
  return false;
}

export function getNextOpenRow(board, col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === EMPTY) {
      return row;
    }
  }
  return -1;
}

export function cloneBoard(board) {
  return board.map((row) => [...row]);
}

export function isBoardFull(board) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === EMPTY) {
        return false;
      }
    }
  }
  return true;
}
