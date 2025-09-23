import { Player, Game } from "../types";
import { getHandType } from "../utils";
import { Card, HandType } from "../enums";

const player: Player = {
  userID: "user",
  hand: [],
  chips: 0,
};

const game: Game = {
  gameID: "game",
  deck: [],
  players: [],
  pot: 0,
  flop: [],
  turn: undefined,
  river: undefined,
};

beforeEach(() => {
  player.hand = [];
  game.flop = [];
  game.turn = undefined;
  game.river = undefined;
});

test("Default hand type is HIGH CARD", () => {
  player.hand = [Card.CLUB_ACE, Card.SPADE_FOUR];
  expect(getHandType(player, game)).toBe(HandType.HIGH_CARD);

  game.flop = [Card.CLUB_NINE, Card.HEART_JACK, Card.DIAMOND_SEVEN];
  expect(getHandType(player, game)).toBe(HandType.HIGH_CARD);

  game.turn = Card.DIAMOND_TWO;
  expect(getHandType(player, game)).toBe(HandType.HIGH_CARD);

  game.river = Card.HEART_KING;
  expect(getHandType(player, game)).toBe(HandType.HIGH_CARD);
});

test("Detects One Pair", () => {
  player.hand = [Card.CLUB_ACE, Card.CLUB_ACE];
   expect(getHandType(player, game)).toBe(HandType.ONE_PAIR);
});
