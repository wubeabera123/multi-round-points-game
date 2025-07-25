import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface Player {
  id: string;
  username: string;
  score: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  players: Player[] = [];
  totalRounds = 5;
  currentRound = 0;
  minPlayers = 4;
  roundInProgress = false;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.players = this.players.filter((p) => p.id !== client.id);
    this.broadcastPlayerUpdate();
  }

  @SubscribeMessage('join_game')
  handleJoin(client: Socket, username: string) {
    const player: Player = {
      id: client.id,
      username,
      score: 0,
    };
    this.players.push(player);
    this.broadcastPlayerUpdate();

    if (this.players.length >= this.minPlayers && !this.roundInProgress) {
      this.startGame();
    }
  }

  broadcastPlayerUpdate() {
    this.server.emit('player_update', {
      players: this.players,
    });
  }

  async startGame() {
    this.roundInProgress = true;
    this.currentRound = 1;
    this.server.emit('game_start', {
      totalRounds: this.totalRounds,
    });

    while (this.currentRound <= this.totalRounds) {
      this.server.emit('new_round', {
        currentRound: this.currentRound,
        totalRounds: this.totalRounds,
      });

      // Simulate spinning (wait 3 seconds)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const winnerIndex = Math.floor(Math.random() * this.players.length);
      const winner = this.players[winnerIndex];
      winner.score += 1;

      this.server.emit('round_result', {
        round: this.currentRound,
        winnerId: winner.id,
        winnerUsername: winner.username,
        players: this.players,
      });

      this.currentRound++;
    }

    this.endGame();
  }

  endGame() {
    const maxScore = Math.max(...this.players.map((p) => p.score));
    const winners = this.players.filter((p) => p.score === maxScore);

    this.server.emit('game_over', {
      players: this.players,
      winners,
    });

    // Reset game
    this.roundInProgress = false;
    this.currentRound = 0;
    this.players.forEach((p) => (p.score = 0));
  }
}
