import { addPlayerToQueue, makeMove } from "../game/gameManager.js";

export function handleMessage(ws, data) {
  const { type, payload } = data;

  switch (type) {
    case "JOIN_GAME":
      addPlayerToQueue(ws, payload.username);
      break;

    case "MAKE_MOVE":
      makeMove(ws, payload.column);
      break;

    default:
      ws.send(
        JSON.stringify({
          type: "ERROR",
          payload: { message: "Unknown event type" },
        }),
      );
  }
}
