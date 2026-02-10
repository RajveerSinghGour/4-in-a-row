import { useState } from "react";

export default function UsernameForm({ onSubmit }) {
  const [username, setUsername] = useState("");

  const handleSubmit = () => {
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <div>
      <h2>Enter Username</h2>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Your name"
      />
      <button onClick={handleSubmit}>Start Game</button>
    </div>
  );
}
