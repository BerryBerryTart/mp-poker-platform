import { ActionColour, GameState, HandType, PlayerState } from "./enums";

interface SerialisedGame {
  pot: number;
  players: Player[];
  flop: string[];
  playerQueue: string[];
  gameState: GameState;
  winnerIDs: string[];
  actions: GameActionType[];
}

interface Player {
  userName: string;
  userID: string;
  hand: string[];
  chips: number;
  wager: number;
  state: PlayerState;
}

interface GameConfigType {
  intialHandAmt: number;
  minBuyIn: number;
  nextRoundDelay: number;
  manualNextRound: boolean;
  cardsPerSuit: number;
  handLimit: number;
  totalSuits: number;
  drawPhases: number[] | string;
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

interface HandTypeReturn {
  type: HandType;
  hand: string[];
}

export {
  Player,
  GameConfigType,
  AuthType,
  SerialisedGame,
  PlaceBetType,
  PlayerActionType,
  GameActionType,
  HandTypeReturn,
};
