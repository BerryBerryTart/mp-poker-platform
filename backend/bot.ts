import { io } from "socket.io-client";
import { v6 } from "uuid";
import { SocketEvent, GameState } from "../utils/enums";
import {
  PlaceBetType,
  Player,
  PlayerActionType,
  SerialisedGame,
} from "../utils/types";

const userID = v6();
const socket = io("ws://localhost:4000", {
  auth: { userID, userName: "Bot" },
});
let game: SerialisedGame | undefined = undefined;
let you: Player | undefined = undefined;

const takeAction = () => {
  if (!game || !you) return;
  if (game.gameState !== GameState.PLAYERS_BETTING) return;
  if (you.userID === game.playerQueue[0]) {
    // check if we need to raise
    const wagerArr = game.players.map((el) => el.wager) ?? [];
    const maxWager = Math.max(...wagerArr);

    if (you.wager < maxWager) {
      //raise
      const bet =
        maxWager - you.wager < you.chips ? maxWager - you.wager : you.chips;
      const payload: PlaceBetType = { userID, bet };
      socket.emit(SocketEvent.PLACE_BET, payload);
    } else {
      //check
      const payload: PlayerActionType = { userID };
      socket.emit(SocketEvent.CHECK, payload);
    }
  }
};

socket.on(SocketEvent.CLIENT_CONNECT, () => {
  console.log("Client Connected.");
  socket.on(SocketEvent.SEND_GAME_STATE, (payload: SerialisedGame) => {
    game = payload;
    const p = payload.players.find((el) => el.userID === userID);
    you = p;
    takeAction();
  });
  socket.on(SocketEvent.ERROR, (payload: string) => {
    console.log(payload);
  });
});
