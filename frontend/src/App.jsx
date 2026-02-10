import { useState } from "react";
import Board from "./components/Board";
import UsernameForm from "./components/UsernameForm";
import { useSocket } from "./hooks/useSocket";
import { ROWS, COLS, EMPTY } from "./utils/constants";
import Leaderboard from "./components/Leaderboard";

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => EMPTY),
  );
}

function App() {
  const [username, setUsername] = useState(null);
  const [board, setBoard] = useState(createEmptyBoard());
  const [status, setStatus] = useState("Waiting...");
  const [myTurn, setMyTurn] = useState(false);

  const handleServerMessage = (msg) => {
    switch (msg.type) {
      case "GAME_UPDATE":
        setBoard(msg.payload.board);
        setMyTurn(msg.payload.currentTurn === username);
        setStatus(msg.payload.status);
        break;

      case "GAME_OVER":
        setBoard(msg.payload.board);
        setStatus(msg.payload.result);
        break;

      case "ERROR":
        alert(msg.payload.message);
        break;

      default:
        console.log("Unknown message", msg);
    }
  };

  const { send } = useSocket(username, handleServerMessage);

  const handleColumnClick = (col) => {
    if (!myTurn) return;

    send({
      type: "MAKE_MOVE",
      payload: { column: col },
    });
  };

  if (!username) {
    return <UsernameForm onSubmit={setUsername} />;
  }

  return (
    <div>
      <h2>Player: {username}</h2>
      <p>Status: {status}</p>

      <Board board={board} onColumnClick={handleColumnClick} />
      <Leaderboard />
    </div>
  );
}

export default App;
