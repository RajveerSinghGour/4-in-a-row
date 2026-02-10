import { WebSocketServer } from "ws";
import { handleMessage } from "./handlers.js";
import { handleDisconnect } from "../game/gameManager.js";

export function setupWebSocket(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
  });

  console.log("WebSocket server initialized");

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        handleMessage(ws, data);
      } catch (err) {
        ws.send(
          JSON.stringify({
            type: "ERROR",
            payload: { message: "Invalid message format" },
          }),
        );
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      handleDisconnect(ws);
    });
  });
}
