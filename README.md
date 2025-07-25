🎮 Multi-Round Points Game

This is a full-stack real-time multiplayer game where players join a room and play multiple random spin-based rounds. The project is divided into two main parts:

Frontend: Built using React, TypeScript, TailwindCSS for UI.

Backend: Developed using NestJS with WebSocket (Socket.IO) for real-time communication.

🚀 Features

Real-time multiplayer game via WebSocket

Minimum 4 players required to start the game

Multiple auto-triggered rounds

Random round winner selection

Live score updates

Animated UI using TailwindCSS

Replay option after game ends

🎓 Technologies Used


# Frontend

React, TypeScript, TailwindCSS

# Backend

NestJS, WebSocket (Socket.IO)

# Realtime

Socket.IO

# Styling

TailwindCSS

📂 Folder Structure

multi-round-points-game/
├── frontend/   # React frontend
├── backend/    # NestJS backend

💡 How It Works

Users join by entering a name.

When 4 or more players join, the game begins.

Each round spins for a few seconds and picks a random winner.

Scores are tracked per round.

After the final round, winners are shown.

Users can choose to play again.

💡 How to Run the Project

Backend

cd backend
npm install
npm run start:dev

Frontend

cd frontend
npm install
npm start

Open your browser at http://localhost:3001

🚨 Future Improvements

Add sound effects

Improve avatar system

Mobile responsiveness


👤 Author

Wubeshet Abera

Built for a real-time multiplayer game coding assignment.