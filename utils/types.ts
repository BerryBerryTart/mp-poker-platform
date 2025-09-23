import { Card } from "./enums";

interface Game {
  gameID: string;
  deck: Card[];
  pot: number;
  players: Player[];
  flop: Card[];
  turn: Card | undefined;
  river: Card | undefined;
}

interface Player {
  userID: string;
  hand: Card[];
  chips: number;
}

export { Game, Player };
