import { ActionColour, Card, GameState, PlayerState } from "./enums";

interface SerialisedGame {
  pot: number;
  players: Player[];
  flop: Card[];
  playerQueue: string[];
  gameState: GameState;
  winnerID?: string | undefined;
  actions: GameActionType[];
}

interface Player {
  userName: string;
  userID: string;
  hand: Card[];
  chips: number;
  wager: number;
  state: PlayerState;
}

interface GameConfigType {
  intialHandAmt?: number;
  enableTieBreaker?: boolean;
  minBuyIn?: number;
  nextRoundDelay?: number;
  manualNextRound?: boolean;
}

interface AuthType {
  userName?: string;
  userID: string;
}

interface PlayerActionType {
  userID: string;
}

interface PlaceBetType extends PlayerActionType {
  bet: number;
}

interface GameActionType {
  color?: ActionColour;
  action: string;
}

export {
  Player,
  GameConfigType,
  AuthType,
  SerialisedGame,
  PlaceBetType,
  PlayerActionType,
  GameActionType 
};
