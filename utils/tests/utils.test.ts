import { Player, Game } from "../types";
import { getHandType, sortPlayers } from "../utils";
import { Card, GameState, HandType } from "../enums";

describe("Hand type logic", () => {
  const player: Player = {
    userID: "user",
    userName: "user",
    hand: [],
    chips: 0,
    key: -1,
  };

  let flop: Card[] = [];

  //reset game and hand before each test
  beforeEach(() => {
    player.hand = [];
    flop = [];
  });

  test("Default hand type is High Card", () => {
    player.hand = [Card.CLUB_ACE, Card.SPADE_FOUR];
    expect(getHandType(player, flop)).toBe(HandType.HIGH_CARD);

    flop = [
      Card.CLUB_NINE,
      Card.HEART_JACK,
      Card.DIAMOND_SEVEN,
      Card.DIAMOND_TWO,
      Card.HEART_KING,
    ];
    expect(getHandType(player, flop)).toBe(HandType.HIGH_CARD);
    expect(getHandType(player, flop)).toBe(HandType.HIGH_CARD);
    expect(getHandType(player, flop)).toBe(HandType.HIGH_CARD);
  });

  test("Detects One Pair", () => {
    player.hand = [Card.CLUB_ACE, Card.DIAMOND_ACE];
    flop = [Card.HEART_TWO, Card.SPADE_SEVEN, Card.DIAMOND_KING];
    expect(getHandType(player, flop)).toBe(HandType.ONE_PAIR);
  });

  test("Detects Two Pair", () => {
    player.hand = [Card.CLUB_ACE, Card.DIAMOND_ACE];
    flop = [Card.HEART_TWO, Card.SPADE_TWO, Card.DIAMOND_KING];
    expect(getHandType(player, flop)).toBe(HandType.TWO_PAIR);
  });

  test("Detects Three of a Kind", () => {
    player.hand = [Card.CLUB_ACE, Card.DIAMOND_ACE];
    flop = [Card.HEART_ACE, Card.SPADE_FOUR, Card.DIAMOND_ONE];
    expect(getHandType(player, flop)).toBe(HandType.THREE_OF_A_KIND);
  });

  test("Detects Four of a Kind", () => {
    player.hand = [Card.CLUB_ACE, Card.DIAMOND_ACE];
    flop = [Card.HEART_ACE, Card.SPADE_ACE, Card.DIAMOND_ONE];
    expect(getHandType(player, flop)).toBe(HandType.FOUR_OF_A_KIND);
  });

  test("Detects Full House", () => {
    player.hand = [Card.CLUB_ACE, Card.DIAMOND_ACE];
    flop = [Card.HEART_ACE, Card.SPADE_ONE, Card.DIAMOND_ONE];
    expect(getHandType(player, flop)).toBe(HandType.FULL_HOUSE);
  });

  test("Detects Royal Flush", () => {
    //actual royal flush
    player.hand = [Card.CLUB_ACE, Card.CLUB_KING];
    flop = [
      Card.CLUB_QUEEN,
      Card.CLUB_JACK,
      Card.CLUB_TEN,
      Card.HEART_TEN,
      Card.DIAMOND_TEN,
    ];
    expect(getHandType(player, flop)).toBe(HandType.ROYAL_FLUSH);

    //just a three of a kind
    player.hand = [Card.CLUB_ACE, Card.CLUB_KING];
    flop = [
      Card.CLUB_QUEEN,
      Card.DIAMOND_JACK,
      Card.CLUB_TEN,
      Card.HEART_TEN,
      Card.DIAMOND_TEN,
    ];
    expect(getHandType(player, flop)).not.toBe(HandType.ROYAL_FLUSH);
  });

  test("Detects Flush", () => {
    player.hand = [Card.HEART_ACE, Card.CLUB_KING];
    flop = [
      Card.CLUB_SEVEN,
      Card.CLUB_FIVE,
      Card.CLUB_TEN,
      Card.DIAMOND_THREE,
      Card.CLUB_ONE,
    ];
    expect(getHandType(player, flop)).toBe(HandType.FLUSH);
  });

  test("Detects Straight Flush", () => {
    //4, 5, 6, 7, 8 -> true straight flush
    player.hand = [Card.HEART_ACE, Card.CLUB_FOUR];
    flop = [
      Card.CLUB_SEVEN,
      Card.CLUB_FIVE,
      Card.CLUB_EIGHT,
      Card.DIAMOND_THREE,
      Card.CLUB_SIX,
    ];
    expect(getHandType(player, flop)).toBe(HandType.STRAIGHT_FLUSH);

    //4, 5, 6, 7, 9 -> just a flush
    player.hand = [Card.HEART_ACE, Card.CLUB_FOUR];
    flop = [
      Card.CLUB_SEVEN,
      Card.CLUB_FIVE,
      Card.CLUB_NINE,
      Card.DIAMOND_THREE,
      Card.CLUB_SIX,
    ];
    expect(getHandType(player, flop)).toBe(HandType.STRAIGHT_FLUSH);
  });

  test("Detects Straight", () => {
    //4, 5, 6, 7, 8 -> straight
    player.hand = [Card.HEART_ACE, Card.CLUB_FOUR];
    flop = [
      Card.SPADE_SEVEN,
      Card.CLUB_FIVE,
      Card.CLUB_EIGHT,
      Card.DIAMOND_THREE,
      Card.CLUB_SIX,
    ];
    expect(getHandType(player, flop)).toBe(HandType.STRAIGHT);
  });
});

describe("Player hand rank logic", () => {
  const TEST_PLAYER_1 = "player1";
  const TEST_PLAYER_2 = "player2";
  const TEST_PLAYER_3 = "player3";
  let flop: Card[] = [];
  let players: Player[] = [];

  const player1: Player = {
    userID: TEST_PLAYER_1,
    userName: "user",
    hand: [],
    chips: 0,
    key: -1,
  };

  const player2: Player = {
    userID: TEST_PLAYER_2,
    userName: "user",
    hand: [],
    chips: 0,
    key: -1,
  };

  const player3: Player = {
    userID: TEST_PLAYER_3,
    userName: "user",
    hand: [],
    chips: 0,
    key: -1,
  };

  //reset game and hand before each test
  beforeEach(() => {
    player1.hand = [];
    player2.hand = [];
    player3.hand = [];
    flop = [];
    players = [];
  });

  test("Royal Flush beats Straight Flush", () => {
    // p1 -> A, K, Q, J, T
    // p2 -> Q, J, T, 9, 8
    player1.hand = [Card.CLUB_ACE, Card.CLUB_KING];
    player2.hand = [Card.CLUB_NINE, Card.CLUB_EIGHT];
    flop = [
      Card.CLUB_QUEEN,
      Card.CLUB_JACK,
      Card.CLUB_TEN,
      Card.HEART_TWO,
      Card.DIAMOND_FIVE,
    ];

    players = [player2, player1];
    sortPlayers(players, flop);
    expect(players[0].userID).toBe(TEST_PLAYER_1);
  });

  test.skip("High Card tie breaker", () => {
    player1.hand = [Card.CLUB_ACE, Card.DIAMOND_TWO];
    player2.hand = [Card.SPADE_NINE, Card.CLUB_ONE];

    players = [player2, player1];
    sortPlayers(players, flop);
    expect(players[0].userID).toBe(TEST_PLAYER_1);
  });

  test.skip("One Pair tie breaker", () => {
    player1.hand = [Card.CLUB_ACE, Card.DIAMOND_ACE];
    player2.hand = [Card.SPADE_NINE, Card.CLUB_NINE];

    players = [player2, player1];
    sortPlayers(players, flop);
    expect(players[0].userID).toBe(TEST_PLAYER_1);
  });

  test.skip("Two Pair tie breaker", () => {
    throw new Error("TODO");
  });

  test.skip("Three of a Kind tie breaker", () => {
    throw new Error("TODO");
  });

  test.skip("Flush tie breaker", () => {
    throw new Error("TODO");
  });

  test.skip("Full House tie breaker", () => {
    throw new Error("TODO");
  });
});
