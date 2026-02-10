import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/leaderboard`)
      .then((res) => res.json())
      .then(setPlayers);
  }, []);

  return (
    <div className="leaderboard">
      <h3>🏆 Leaderboard</h3>
      {players.map((p) => (
        <div key={p.username}>
          {p.username} — {p.wins}
        </div>
      ))}
    </div>
  );
}
