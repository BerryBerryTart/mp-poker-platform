import { Card, GameState } from "./enums";

interface Game {
  gameID: string;
  deck: Card[];
  pot: number;
  players: Player[];
  flop: Card[];
  playerQueue: Player[];
  gameState: GameState;
}

interface Player {
  userID: string;
  hand: Card[];
  chips: number;
  key: number;
}

interface GameConfigType {
  intialHandAmt?: number;
  enableTieBreaker?: boolean;
  minBuyIn?: number;
}

export { Game, Player, GameConfigType };
