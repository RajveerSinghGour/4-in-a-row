import { useEffect, useRef } from "react";

export function useSocket(username, onMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!username) return;

    // 🔁 Connect to backend WS (mock URL for now)
    const socket = new WebSocket(import.meta.env.VITE_WS_URL);

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");

      socket.send(
        JSON.stringify({
          type: "JOIN_GAME",
          payload: { username },
        }),
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, [username]);

  const send = (data) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  };

  return { send };
}
