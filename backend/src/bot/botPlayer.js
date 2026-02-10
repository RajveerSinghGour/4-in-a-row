export function createBot() {
  return {
    username: "BOT",
    isBot: true,
    send: (msg) => {
      // Bots don't need outgoing messages
      // (they receive board state internally later)
    },
  };
}
