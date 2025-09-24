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

//reset game and hand before each test
beforeEach(() => {
  player.hand = [];
  game.flop = [];
  game.turn = undefined;
  game.river = undefined;
});

// --- START OF getHandType TESTS ---
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

test("Detects one pair", () => {
  player.hand = [Card.CLUB_ACE, Card.DIAMOND_ACE];
  game.flop = [Card.HEART_TWO, Card.SPADE_SEVEN, Card.DIAMOND_KING];
  expect(getHandType(player, game)).toBe(HandType.ONE_PAIR);
});

test("Detects two pair", () => {
  player.hand = [Card.CLUB_ACE, Card.DIAMOND_ACE];
  game.flop = [Card.HEART_TWO, Card.SPADE_TWO, Card.DIAMOND_KING];
  expect(getHandType(player, game)).toBe(HandType.TWO_PAIR);
});

test("Detects three of a kind", () => {
  player.hand = [Card.CLUB_ACE, Card.DIAMOND_ACE];
  game.flop = [Card.HEART_ACE, Card.SPADE_FOUR, Card.DIAMOND_ONE];
  expect(getHandType(player, game)).toBe(HandType.THREE_OF_A_KIND);
});

test("Detects four of a kind", () => {
  player.hand = [Card.CLUB_ACE, Card.DIAMOND_ACE];
  game.flop = [Card.HEART_ACE, Card.SPADE_ACE, Card.DIAMOND_ONE];
  expect(getHandType(player, game)).toBe(HandType.FOUR_OF_A_KIND);
});

test("Detects full house", () => {
  player.hand = [Card.CLUB_ACE, Card.DIAMOND_ACE];
  game.flop = [Card.HEART_ACE, Card.SPADE_ONE, Card.DIAMOND_ONE];
  expect(getHandType(player, game)).toBe(HandType.FULL_HOUSE);
});

test("Detects royal flush", () => {
  //actual royal flush
  player.hand = [Card.CLUB_ACE, Card.CLUB_KING];
  game.flop = [Card.CLUB_QUEEN, Card.CLUB_JACK, Card.CLUB_TEN];
  game.turn = Card.HEART_TEN;
  game.river = Card.DIAMOND_TEN;
  expect(getHandType(player, game)).toBe(HandType.ROYAL_FLUSH);

  //just a three of a kind
  player.hand = [Card.CLUB_ACE, Card.CLUB_KING];
  game.flop = [Card.CLUB_QUEEN, Card.DIAMOND_JACK, Card.CLUB_TEN];
  game.turn = Card.HEART_TEN;
  game.river = Card.DIAMOND_TEN;
  expect(getHandType(player, game)).not.toBe(HandType.ROYAL_FLUSH);
});

test("Detects flush", () => {
  player.hand = [Card.HEART_ACE, Card.CLUB_KING];
  game.flop = [Card.CLUB_SEVEN, Card.CLUB_FIVE, Card.CLUB_TEN];
  game.turn = Card.DIAMOND_THREE;
  game.river = Card.CLUB_ONE;
  expect(getHandType(player, game)).toBe(HandType.FLUSH);
});

test("Detects straight flush", () => {
  //4, 5, 6, 7, 8 -> true straight flush
  player.hand = [Card.HEART_ACE, Card.CLUB_FOUR];
  game.flop = [Card.CLUB_SEVEN, Card.CLUB_FIVE, Card.CLUB_EIGHT];
  game.turn = Card.DIAMOND_THREE;
  game.river = Card.CLUB_SIX;
  expect(getHandType(player, game)).toBe(HandType.STRAIGHT_FLUSH);

  //4, 5, 6, 7, 9 -> just a flush
  player.hand = [Card.HEART_ACE, Card.CLUB_FOUR];
  game.flop = [Card.CLUB_SEVEN, Card.CLUB_FIVE, Card.CLUB_NINE];
  game.turn = Card.DIAMOND_THREE;
  game.river = Card.CLUB_SIX;
  expect(getHandType(player, game)).toBe(HandType.STRAIGHT_FLUSH);
});

test("Detects straight", () => {
  //4, 5, 6, 7, 8 -> straight
  player.hand = [Card.HEART_ACE, Card.CLUB_FOUR];
  game.flop = [Card.SPADE_SEVEN, Card.CLUB_FIVE, Card.CLUB_EIGHT];
  game.turn = Card.DIAMOND_THREE;
  game.river = Card.CLUB_SIX;
  expect(getHandType(player, game)).toBe(HandType.STRAIGHT);
});
// --- END OF getHandType TESTS ---
