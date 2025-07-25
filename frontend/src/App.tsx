import React, { useEffect, useState } from "react";
import socket from "./socket";

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
  const [countdown, setCountdown] = useState(0);

  const handlePlayAgain = () => {
  window.location.reload();
};


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
      setCountdown(3); // start countdown from 3

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">🎮 Multi-Round Points Game</h1>

      {!joined ? (
        <div className="flex flex-col items-center gap-4">
          <input
            className="px-4 py-2 border rounded-md text-lg"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
            onClick={handleJoin}
          >
            Join Game
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-xl font-semibold">Welcome, {username}!</h2>

          <div>
            <h3 className="text-lg font-semibold mb-2">Connected Players</h3>
            <ul className="bg-white rounded shadow p-4 space-y-2">
              {players.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between items-center border-b pb-1"
                >
                  <span>
                    {p.username} {p.username === username ? "(You)" : ""}
                  </span>
                  <span className="text-blue-700 font-semibold">
                    {p.score} pts
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {gameStarted && !gameOver && (
            <div className="text-center">
              <h3 className="text-lg font-medium">
                🎯 Round {currentRound} / {totalRounds}
              </h3>
              {spinning ? (
                <p className="text-orange-500 font-semibold mt-2">
                  Spinning... ⏳ ({countdown}s)
                </p>
              ) : (
                <p className="text-gray-500 mt-2">Waiting for next round...</p>
              )}
              {roundWinner && (
                <p className="text-green-600 font-bold mt-2">
                  🏆 Round Winner: {roundWinner}
                </p>
              )}
            </div>
          )}

          {gameOver && (
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-red-600">🏁 Game Over</h2>
              <h3 className="text-lg">Final Scores:</h3>
              <ul className="bg-white rounded shadow p-4">
                {players.map((p: Player) => (
                  <li key={p.id} className="flex justify-between border-b py-1">
                    <span>{p.username}</span>
                    <span>{p.score} pts</span>
                  </li>
                ))}
              </ul>
              <h3 className="text-xl font-semibold text-purple-700">
                Winner{finalWinners.length > 1 ? "s" : ""}:
              </h3>
              <ul>
                {finalWinners.map((w) => (
                  <li key={w.id} className="font-bold">
                    {w.username}
                  </li>
                ))}
              </ul>

              <button
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                onClick={handlePlayAgain}
              >
                🔁 Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
