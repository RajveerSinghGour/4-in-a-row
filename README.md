
## 🎯 4 in a Row — Real-Time Multiplayer Game

A real-time backend-driven implementation of **4 in a Row (Connect Four)** with multiplayer support, a competitive bot, reconnection handling, and a persistent leaderboard.

---

## 🚀 Live Application

- **Frontend (Netlify):**  
  https://four-in-rows.netlify.app

- **Backend (Render):**  
  https://four-in-row-backend.onrender.com

- **WebSocket Endpoint:**  
  wss://four-in-row-backend.onrender.com/ws

---

## 🧠 Features

### 🎮 Gameplay
- 7×6 Connect Four board
- Real-time turn-based gameplay using WebSockets
- Win detection (horizontal, vertical, diagonal)
- Draw detection when the board is full

### 🤝 Matchmaking
- Player vs Player matchmaking
- If no opponent joins within **10 seconds**, a **competitive bot** joins automatically

### 🤖 Competitive Bot
- Attempts to win when possible
- Blocks opponent’s immediate winning moves
- Uses board simulation (non-random logic)

### 🔁 Reconnect & Forfeit
- Players can reconnect within **30 seconds** after disconnect
- If not reconnected, the opponent wins by forfeit

### 🏆 Leaderboard
- Tracks total wins per player
- Persisted using MongoDB

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- WebSockets
- Deployed on Netlify

### Backend
- Node.js
- Express
- ws (WebSocket server)
- MongoDB (Mongoose)
- Deployed on Render

---

## 📂 Project Structure

```

4-in-a-row/
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env (not committed)
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── .env (not committed)
│
└── README.md

````

---

## 🧪 Running the Project Locally

### ✅ Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)

---

### 🔹 Backend Setup

```bash
cd backend
npm install
````

Create a `.env` file inside `backend/`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/four_in_row
PORT=8080
```

Start the backend:

```bash
npm run dev
```

Backend runs at:

```
http://localhost:8080
```

---

### 🔹 Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_WS_URL=ws://localhost:8080/ws
VITE_API_URL=http://localhost:8080
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🌐 API Endpoints

| Method | Endpoint       | Description                      |
| ------ | -------------- | -------------------------------- |
| GET    | `/leaderboard` | Fetch leaderboard sorted by wins |

---

## 🧪 How to Test

1. Open the frontend in two browser tabs
2. Enter different usernames
3. Play a complete game
4. Try disconnecting and reconnecting within 30 seconds
5. Check leaderboard updates after the game ends

---

## 👤 Author

**Rajveer Singh Gour**
Full Stack

---

## ✅ Submission Notes

* Backend deployed on Render
* Frontend deployed on Netlify
* MongoDB Atlas used for persistence
* WebSocket-based real-time gameplay

```
