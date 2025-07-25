import { useEffect, useState } from "react";
import socket from "./socket";
import { getInitials } from "./utils/avatar";

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
      setCountdown(3);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white flex flex-col items-center p-6 animate-fade-in">
      <h1 className="text-4xl font-extrabold mb-8 tracking-wide drop-shadow-glow animate-pulse">
        🎮 Multi-Round Points Game
      </h1>

      {!joined ? (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <input
            className="px-5 py-3 border-none rounded-md text-lg shadow-inner w-72 text-gray-800"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform"
            onClick={handleJoin}
          >
            Join Game
          </button>
        </div>
      ) : !gameStarted ? (
        <div className="text-center mt-10 space-y-6 animate-fade-in">
          <h2 className="text-2xl font-bold">🕹 Waiting Room</h2>
          <p className="text-gray-300">Waiting for at least 4 players to start...</p>
          <div className="bg-white/10 rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Connected Players:</h3>
            <ul className="space-y-3">
              {players.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-300 text-black flex items-center justify-center font-bold shadow-md">
                    {getInitials(p.username)}
                  </div>
                  <span className="text-lg">
                    {p.username} {p.username === username ? "(You)" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-xl space-y-8">
          <div className="bg-white/10 rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-3">Players</h3>
            <ul className="space-y-3">
              {players.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between items-center border-b border-white/20 pb-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-300 text-black flex items-center justify-center font-bold shadow-md">
                      {getInitials(p.username)}
                    </div>
                    <span className="text-lg">
                      {p.username} {p.username === username ? "(You)" : ""}
                    </span>
                  </div>
                  <span className="text-lg font-semibold">{p.score} pts</span>
                </li>
              ))}
            </ul>
          </div>

          {!gameOver && (
            <div className="text-center animate-fade-in">
              <h3 className="text-2xl font-semibold">
                🎯 Round {currentRound} / {totalRounds}
              </h3>
              {spinning ? (
                <div className="flex justify-center items-center flex-col gap-3 mt-4">
                  <div className="w-20 h-20 border-8 border-t-yellow-300 border-b-yellow-300 border-l-white/20 border-r-white/20 rounded-full animate-spin"></div>
                  <p className="text-yellow-300 text-lg animate-pulse">
                    Spinning... ⏳ ({countdown}s)
                  </p>
                </div>
              ) : (
                <p className="text-gray-300 mt-2">Waiting for next round...</p>
              )}
              {roundWinner && (
                <p className="text-green-400 font-bold mt-3 text-xl animate-bounce">
                  🏆 Round Winner: {roundWinner}
                </p>
              )}
            </div>
          )}

          {gameOver && (
            <div className="text-center space-y-4 animate-fade-in">
              <h2 className="text-3xl font-bold text-yellow-400">🏁 Game Over</h2>
              <h3 className="text-xl font-medium">Final Scores:</h3>
              <ul className="bg-white/10 rounded-xl shadow-md p-4">
                {players.map((p: Player) => (
                  <li key={p.id} className="flex justify-between border-b border-white/10 py-2">
                    <span>{p.username}</span>
                    <span>{p.score} pts</span>
                  </li>
                ))}
              </ul>
              <h3 className="text-2xl font-semibold text-pink-300">
                Winner{finalWinners.length > 1 ? "s" : ""}:
              </h3>
              <ul>
                {finalWinners.map((w) => (
                  <li key={w.id} className="font-bold text-xl">
                    {w.username}
                  </li>
                ))}
              </ul>
              <button
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg mt-4 shadow-lg"
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
