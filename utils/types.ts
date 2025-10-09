import { Card, GameState } from "./enums";

interface SerialisedGame {
  pot: number;
  players: Player[];
  flop: Card[];
  playerQueue: string[];
  gameState: GameState;
}

interface Player {
  userName: string;
  userID: string;
  hand: Card[];
  chips: number;
  wager: number;
  key: number;
}

interface GameConfigType {
  intialHandAmt?: number;
  enableTieBreaker?: boolean;
  minBuyIn?: number;
}

interface AuthType {
  userName?: string;
  userID: string;
}

interface PlaceBetType {
  userID: string;
  bet: number;
}

export { Player, GameConfigType, AuthType, SerialisedGame, PlaceBetType };
