import Cell from "./Cell";
import { ROWS, COLS } from "../utils/constants";

export default function Board({ board, onColumnClick }) {
  return (
    <div>
      {Array.from({ length: ROWS }).map((_, row) => (
        <div key={row} style={{ display: "flex" }}>
          {Array.from({ length: COLS }).map((_, col) => (
            <Cell
              key={col}
              value={board[row][col]}
              onClick={() => onColumnClick(col)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
