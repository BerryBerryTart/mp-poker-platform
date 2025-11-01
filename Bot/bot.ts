import { io, Socket } from "socket.io-client";
import { v6 } from "uuid";
import { SocketEvent, GameState } from "../utils/enums";
import {
  GameConfigType,
  PlaceBetType,
  Player,
  PlayerActionType,
  SerialisedGame,
} from "../utils/types";

class Bot {
  userName: string;
  socket: Socket | undefined = undefined;
  game: SerialisedGame | undefined = undefined;
  gameConfig: GameConfigType | undefined = undefined;
  you: Player | undefined = undefined;
  userID = v6();

  constructor(userName?: string) {
    this.userName = userName ?? "Bot";
    this.socket = io("ws://localhost:4000", {
      auth: { userID: this.userID, userName },
    });
    this.socket.on(SocketEvent.CLIENT_CONNECT, () => {
      console.log(`${this.userName} Connected.`);
    });
    this.socket.on(SocketEvent.SEND_GAME_STATE, (payload: SerialisedGame) => {
      this.game = payload;
      const p = payload.players.find((el) => el.userID === this.userID);
      this.you = p;
      this.takeAction();
      this.handleNext();
    });
    this.socket.on(SocketEvent.ERROR, (payload: string) => {
      console.log(payload);
    });
    this.socket.on(SocketEvent.SEND_GAME_CONFIG, (payload: GameConfigType) => {
      this.gameConfig = payload;
    });
  }

  handleNext() {}

  takeAction() {
    if (!this.game || !this.you || !this.socket) return;
    if (this.game.gameState !== GameState.PLAYERS_BETTING) return;
    if (this.you.userID === this.game.playerQueue[0]) {
      // check if we need to raise
      const wagerArr = this.game.players.map((el) => el.wager) ?? [];
      const maxWager = Math.max(...wagerArr);

      if (this.you.wager < maxWager) {
        //raise
        const bet =
          maxWager - this.you.wager < this.you.chips
            ? maxWager - this.you.wager
            : this.you.chips;
        const payload: PlaceBetType = { userID: this.userID, bet };
        this.socket.emit(SocketEvent.PLACE_BET, payload);
        // console.log(`${this.userName} bet: ${bet}`);
      } else {
        //check
        const payload: PlayerActionType = { userID: this.userID };
        this.socket.emit(SocketEvent.CHECK, payload);
        // console.log(`${this.userName} checked`);
      }
    }
  }
}

(() => {
  const BOT_COUNT = 7;
  const BOTS: Bot[] = [];
  for (let i = 0; i < BOT_COUNT; i++) {
    const b = new Bot(`Bot ${i + 1}`);
    BOTS.push(b);
  }
})();
