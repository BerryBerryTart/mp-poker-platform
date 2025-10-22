import { Player } from "../types";
import { getHandType, sortPlayersGetWinner } from "../utils";
import { HandType, PlayerState } from "../enums";

describe("Hand type logic", () => {
  let player = [];
  let flop: string[] = [];

  //reset game and hand before each test
  beforeEach(() => {
    player = [];
    flop = [];
  });

  describe("Default hand type is High Card", () => {
    test("High card with just hand", () => {
      player = ["C|5", "S|4"];
      const h = getHandType(player, flop, 14, 5);
      expect(h.type).toBe(HandType.HIGH_CARD);
      expect(h.hand).toEqual(expect.arrayContaining(["S|4", "C|5"]));
    });
    test("High card with flop", () => {
      player = ["C|5", "S|4"];
      flop = ["C|9", "H|11", "D|7", "D|2", "H|13"];
      const h = getHandType(player, flop, 14, 5);
      expect(h.type).toBe(HandType.HIGH_CARD);
      expect(h.hand).toEqual(
        expect.arrayContaining(["S|4", "C|5", "H|13", "C|9", "H|11"])
      );
    });
  });

  describe("Detects One Pair", () => {
    test("Pair in hand", () => {
      player = ["C|14", "D|14"];
      flop = ["H|2", "S|7", "D|13"];
      const h = getHandType(player, flop, 14, 5);
      expect(h.type).toBe(HandType.ONE_PAIR);
      expect(h.hand).toEqual(
        expect.arrayContaining(["C|14", "D|14", "H|2", "S|7", "D|13"])
      );
    });

    test("Partial pair in hand", () => {
      player = ["C|13", "D|14"];
      flop = ["H|2", "S|7", "S|14"];
      const h = getHandType(player, flop, 14, 5);
      expect(h.type).toBe(HandType.ONE_PAIR);
      expect(h.hand).toEqual(
        expect.arrayContaining(["C|13", "D|14", "H|2", "S|7", "S|14"])
      );
    });
  });

  test("Detects Two Pair", () => {
    player = ["C|14", "D|14"];
    flop = ["H|2", "S|2", "D|13"];
    const h = getHandType(player, flop, 14, 5);
    expect(h.type).toBe(HandType.TWO_PAIR);
    expect(h.hand).toEqual(
      expect.arrayContaining(["H|2", "S|2", "C|14", "D|14", "D|13"])
    );
  });

  test("Detects Three of a Kind", () => {
    player = ["C|14", "D|14"];
    flop = ["H|14", "S|4", "D|10"];
    const h = getHandType(player, flop, 14, 5);
    expect(h.type).toBe(HandType.THREE_OF_A_KIND);
    expect(h.hand).toEqual(
      expect.arrayContaining(["H|14", "C|14", "D|14", "S|4", "D|10"])
    );
  });

  test("Detects Four of a Kind", () => {
    player = ["C|14", "D|14"];
    flop = ["H|14", "S|14", "D|10"];
    const h = getHandType(player, flop, 14, 5);
    expect(h.type).toBe(HandType.FOUR_OF_A_KIND);
    expect(h.hand).toEqual(
      expect.arrayContaining(["H|14", "S|14", "C|14", "D|14", "D|10"])
    );
  });

  describe("Detects Full House", () => {
    test("Full house ordinary", () => {
      player = ["C|14", "D|14"];
      flop = ["H|14", "S|2", "D|2"];
      const h = getHandType(player, flop, 14, 5);
      expect(h.type).toBe(HandType.FULL_HOUSE);
      expect(h.hand).toEqual(
        expect.arrayContaining(["H|14", "D|14", "C|14", "S|2", "D|2"])
      );
    });
    test("Full house with double triples", () => {
      player = ["C|10", "D|2"];
      flop = ["H|14", "S|2", "H|2", "S|14", "D|14"];
      const h = getHandType(player, flop, 14, 5);
      expect(h.type).toBe(HandType.FULL_HOUSE);
      expect(h.hand).toEqual(
        expect.arrayContaining(["H|14", "S|14", "D|14", "S|2", "H|2"])
      );
    });
  });

  describe("Detects Royal Flush", () => {
    test("Actual royal flush", () => {
      player = ["C|14", "C|13"];
      flop = ["C|12", "C|11", "C|10", "H|10", "D|10"];
      const h = getHandType(player, flop, 14, 5);
      expect(h.type).toBe(HandType.ROYAL_FLUSH);
      expect(h.hand).toEqual(
        expect.arrayContaining(["C|14", "C|13", "C|12", "C|11", "C|10"])
      );
    });
  });

  test("Detects Flush", () => {
    player = ["H|14", "C|13"];
    flop = ["C|7", "C|5", "C|10", "D|3", "C|4"];
    const h = getHandType(player, flop, 14, 5);
    expect(h.type).toBe(HandType.FLUSH);
    expect(h.hand).toEqual(
      expect.arrayContaining(["C|13", "C|10", "C|7", "C|5", "C|4"])
    );
  });

  describe("Detects Straight Flush", () => {
    test("True straight flush", () => {
      //4, 5, 6, 7, 8
      player = ["H|14", "C|4"];
      flop = ["C|7", "C|5", "C|8", "D|3", "C|6"];
      const h = getHandType(player, flop, 14, 5);
      expect(h.type).toBe(HandType.STRAIGHT_FLUSH);
      expect(h.hand).toEqual(
        expect.arrayContaining(["C|4", "C|5", "C|6", "C|7", "C|8"])
      );
    });

    test("Just a flush", () => {
      //4, 5, 6, 7, 9
      player = ["H|14", "C|4"];
      flop = ["C|7", "C|5", "C|9", "D|3", "C|6"];
      const h = getHandType(player, flop, 14, 5);
      expect(h.type).not.toBe(HandType.STRAIGHT_FLUSH);
    });
  });

  describe("Detects Straight", () => {
    test("Straight 1", () => {
      //4, 5, 6, 7, 8 -> straight
      player = ["H|14", "C|4"];
      flop = ["S|7", "C|5", "C|8", "D|3", "C|6"];
      const h = getHandType(player, flop, 14, 5);
      // expect(h.type).toBe(HandType.STRAIGHT);
      expect(h.hand).toEqual(
        expect.arrayContaining(["C|4", "C|5", "C|6", "S|7", "C|8"])
      );
    });

    test("Straight 2", () => {
      player = ["D|2", "H|9"];
      flop = ["C|2", "C|13", "D|8", "C|10", "D|11"];
      const h = getHandType(player, flop, 14, 5);
      expect(h.type).not.toBe(HandType.STRAIGHT);
    });
  });
});

describe("Player hand tie break rank logic", () => {
  const TEST_PLAYER_1 = "player1";
  const TEST_PLAYER_2 = "player2";
  let flop: string[] = [];
  let players: Player[] = [];

  const player1: Player = {
    userID: TEST_PLAYER_1,
    userName: "user",
    hand: [],
    chips: 0,
    wager: 0,
    state: PlayerState.BETTING,
  };

  const player2: Player = {
    userID: TEST_PLAYER_2,
    userName: "user",
    hand: [],
    chips: 0,
    wager: 0,
    state: PlayerState.BETTING,
  };

  //reset game and hand before each test
  beforeEach(() => {
    player1.hand = [];
    player2.hand = [];
    flop = [];
    players = [];
  });

  test("Royal Flush beats Straight Flush", () => {
    // p1 -> A, K, Q, J, T
    // p2 -> Q, J, T, 9, 8
    player1.hand = ["C|14", "C|13"];
    player2.hand = ["C|9", "C|8"];
    flop = ["C|12", "C|11", "C|10", "H|2", "D|5"];

    players = [player2, player1];
    const winners = sortPlayersGetWinner(players, flop, 14, 5);
    expect(winners.length).toBe(1);
    expect(winners[0].userID).toBe(TEST_PLAYER_1);
  });

  describe("High Card tie breaker", () => {
    test("First high card", () => {
      player1.hand = ["C|14", "D|2"];
      player2.hand = ["S|9", "C|6"];
      flop = ["C|10", "D|3", "H|12"];
      players = [player2, player1];
      const winners = sortPlayersGetWinner(players, flop, 14, 5);
      expect(winners.length).toBe(1);
      expect(winners[0].userID).toBe(TEST_PLAYER_1);
    });
    test("Fallback to second card", () => {
      player1.hand = ["C|10", "D|6"];
      player2.hand = ["S|10", "C|2"];
      flop = [];
      players = [player2, player1];
      const winners = sortPlayersGetWinner(players, flop, 14, 5);
      expect(winners.length).toBe(1);
      expect(winners[0].userID).toBe(TEST_PLAYER_1);
    });

    test("Tied for high card", () => {
      player1.hand = ["C|10", "D|6"];
      player2.hand = ["S|10", "C|6"];
      flop = [];
      players = [player2, player1];
      const winners = sortPlayersGetWinner(players, flop, 14, 5);
      expect(winners.length).toBe(2);
    });
  });

  describe("One Pair tie breaker", () => {
    test("pair in hand", () => {
      player1.hand = ["C|14", "D|14"];
      player2.hand = ["S|9", "C|9"];
      flop = [];

      players = [player2, player1];
      const winners = sortPlayersGetWinner(players, flop, 14, 5);
      expect(winners.length).toBe(1);
      expect(winners[0].userID).toBe(TEST_PLAYER_1);
    });

    test("pair combined with flop (high 9 wins)", () => {
      player1.hand = ["H|2", "D|9"];
      player2.hand = ["S|4", "S|2"];
      flop = ["C|2"];

      players = [player2, player1];
      const winners = sortPlayersGetWinner(players, flop, 14, 5);
      expect(winners.length).toBe(1);
      expect(winners[0].userID).toBe(TEST_PLAYER_1);
    });

    test("high card fallback (p1's 5 wins)", () => {
      player1.hand = ["C|2", "D|5"];
      player2.hand = ["S|3", "C|4"];
      flop = ["C|8", "H|8"];

      players = [player2, player1];
      const winners = sortPlayersGetWinner(players, flop, 14, 5);
      expect(winners.length).toBe(1);
      expect(winners[0].userID).toBe(TEST_PLAYER_1);
    });
  });

  describe("Two Pair tie breaker", () => {
    test("Better 2 pair wins", () => {
      player1.hand = ["C|3", "S|14"];
      player2.hand = ["S|8", "C|9"];
      flop = ["C|3", "H|8", "H|9", "D|14"];

      players = [player2, player1];
      const winners = sortPlayersGetWinner(players, flop, 14, 5);
      expect(winners.length).toBe(1);
      expect(winners[0].userID).toBe(TEST_PLAYER_1);
    });
  });

  describe("Three of a Kind tie breaker", () => {
    test("Better 3 of a kind wins", () => {
      player1.hand = ["C|9", "D|9"];
      player2.hand = ["S|8", "C|8"];
      flop = ["C|8", "H|9", "H|3"];

      players = [player2, player1];
      const winners = sortPlayersGetWinner(players, flop, 14, 5);
      expect(winners.length).toBe(1);
      expect(winners[0].userID).toBe(TEST_PLAYER_1);
    });
    test("Three of a kind tie", () => {
      player1.hand = ["C|9", "D|9"];
      player2.hand = ["S|9", "H|9"];
      flop = ["C|8", "H|9", "H|3"];

      players = [player2, player1];
      const winners = sortPlayersGetWinner(players, flop, 14, 5);
      expect(winners.length).toBe(2);
    });

    test("Three of a kind tie, high card wins", () => {
      player1.hand = ["C|9", "D|13"];
      player2.hand = ["S|9", "H|4"];
      flop = ["C|8", "H|9", "H|9"];

      players = [player2, player1];
      const winners = sortPlayersGetWinner(players, flop, 14, 5);
      expect(winners.length).toBe(1);
      expect(winners[0].userID).toBe(TEST_PLAYER_1);
    });
  });

  describe("Full House tie breaker", () => {
    test("Use three pair", () => {
      //13, 13, 13, 5, 5
      player1.hand = ["C|13", "D|13"];
      //12, 12, 12, 5, 5
      player2.hand = ["D|12`", "H|12"];
      flop = ["S|13", "H|5", "S|4", "H|5", "S|12"];
      players = [player2, player1];
      const winners = sortPlayersGetWinner(players, flop, 14, 5);
      expect(winners.length).toBe(1);
      expect(winners[0].userID).toBe(TEST_PLAYER_1);
    });
    test("Fallback to two pair", () => {
      //12, 12, 12, 5, 5
      player1.hand = ["C|12", "D|5"];
      //12, 12, 12, 4, 4
      player2.hand = ["D|12", "H|4"];
      flop = ["S|12", "H|12", "S|4", "H|5", "S|14"];

      players = [player2, player1];
      const winners = sortPlayersGetWinner(players, flop, 14, 5);
      expect(winners.length).toBe(1);
      expect(winners[0].userID).toBe(TEST_PLAYER_1);
    });
  });
});
