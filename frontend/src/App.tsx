import React, { useEffect, useState } from "react";
import socket from "./socket";
import "./App.css";

interface Player {
  id: string;
  username: string;
  score: number;
}

function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [finalWinners, setFinalWinners] = useState<Player[]>([]);

  useEffect(() => {
    socket.on("player_update", (data) => {
      setPlayers(data.players);
    });

    socket.on("game_start", (data) => {
      setGameStarted(true);
      setTotalRounds(data.totalRounds);
      setCurrentRound(1);
    });

    socket.on("new_round", (data) => {
      setCurrentRound(data.currentRound);
      setSpinning(true);
      setRoundWinner(null);
    });

    socket.on("round_result", (data) => {
      setSpinning(false);
      setPlayers(data.players);
      setRoundWinner(data.winnerUsername);
    });

    socket.on("game_over", (data) => {
      setGameOver(true);
      setPlayers(data.players);
      setFinalWinners(data.winners);
    });

    return () => {
      socket.off("player_update");
      socket.off("game_start");
      socket.off("new_round");
      socket.off("round_result");
      socket.off("game_over");
    };
  }, []);

  const handleJoin = () => {
    if (username.trim()) {
      socket.emit("join_game", username);
      setJoined(true);
    }
  };

  return (
    <div className="App">
      <h1>🎮 Multi-Round Points Game</h1>

      {!joined ? (
        <div>
          <input
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleJoin}>Join Game</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {username}!</h2>
          <h3>Connected Players:</h3>
          {gameStarted && !gameOver && (
            <div>
              <h3>
                🎯 Round {currentRound} / {totalRounds}
              </h3>
              <p>{spinning ? "🌀 Spinning..." : "Waiting for next round..."}</p>
              {roundWinner && <p>🏆 Round Winner: {roundWinner}</p>}
            </div>
          )}

          {gameOver && (
            <div>
              <h2>🏁 Game Over</h2>
              <h3>Final Scores:</h3>
              <ul>
                {players.map((p) => (
                  <li key={p.id}>
                    {p.username} - {p.score} pts
                  </li>
                ))}
              </ul>
              <h3>🥇 Winner{finalWinners.length > 1 ? "s" : ""}:</h3>
              <ul>
                {finalWinners.map((w) => (
                  <li key={w.id}>{w.username}</li>
                ))}
              </ul>
            </div>
          )}

          <ul>
            {players.map((p) => (
              <li key={p.id}>
                {p.username} {p.username === username ? "(You)" : ""} -{" "}
                {p.score} pts
                {spinning && <span className="spinner" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
