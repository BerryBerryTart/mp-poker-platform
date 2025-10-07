import { Card, GameState, HandType } from "./enums";
import { Player, GameConfigType, SerialisedGame } from "./types";

const gameActionFlow = [
  GameState.PRE_GAME,
  GameState.GAME_START,
  GameState.ANTE,
  GameState.FLOP,
  GameState.PLAYERS_BETTING,
  GameState.TURN,
  GameState.PLAYERS_BETTING,
  GameState.RIVER,
  GameState.ROUND_END,
  GameState.GAME_END,
];

const getHandType = (player: Player, flop: Card[]): HandType => {
  // aggregate cards into an array for analysis
  const handArr: Card[] = [];
  handArr.push(...player.hand);
  handArr.push(...flop);
  return getHandTypeFromArray(handArr);
};

const getHandTypeFromArray = (handArr: Card[]): HandType => {
  //Sort things so it's easier to do work later
  handArr.sort(compareCards);

  //Reduce to like numbers
  const reducedHand: number[] = getCardNumberArr(handArr);

  // const cardCounts = Object.values(cardCountObj);
  const cardCounts = getCardCounts(reducedHand);

  //handle royal flush
  if (
    reducedHand.includes(14) &&
    reducedHand.includes(13) &&
    reducedHand.includes(12) &&
    reducedHand.includes(11) &&
    reducedHand.includes(10)
  ) {
    for (let i = 0; i < handArr.length; i++) {
      //10 is first in the sequence so we can work with that
      const firstCard = handArr[i];
      if (getCardNumber(firstCard) !== 10) continue;
      const firstSuit = getCardSuit(firstCard);

      //check rest of array in sequence
      let nextNum = 11;
      for (let j = i + 1; j < handArr.length; j++) {
        if (handArr.includes(`${firstSuit}${nextNum}` as Card)) {
          if (nextNum === 14) {
            return HandType.ROYAL_FLUSH;
          }
          nextNum++;
          continue;
        } else {
          //next card not found so stop searching
          break;
        }
      }
    }
  }

  //handle straight flush
  for (let i = 0; i < handArr.length; i++) {
    const firstCard = handArr[i];
    const firstSuit = getCardSuit(firstCard);

    //keep track of sequence hits
    let counter = 1;
    let nextNum = getCardNumber(firstCard);
    //check rest of array in sequence
    for (let j = i + 1; j < handArr.length; j++) {
      const nextCard = handArr[j];
      if (
        getCardSuit(nextCard) === firstSuit &&
        handArr.includes(`${firstSuit}${nextNum}` as Card)
      ) {
        counter++;
        nextNum++;
        if (counter === 5) {
          return HandType.STRAIGHT_FLUSH;
        }
      } else {
        //next card not found so stop searching
        break;
      }
    }
  }

  //Handle four of a kind
  if (cardCounts.includes(4)) {
    return HandType.FOUR_OF_A_KIND;
  }

  //Handle full house
  if (cardCounts.includes(3) && cardCounts.includes(2)) {
    return HandType.FULL_HOUSE;
  }

  //handle flush
  for (let i = 0; i < handArr.length; i++) {
    const firstCard = handArr[i];
    const firstSuit = getCardSuit(firstCard);

    //keep track of sequence hits
    let counter = 1;
    //check rest of array in sequence
    for (let j = i + 1; j < handArr.length; j++) {
      const nextCard = handArr[j];
      if (getCardSuit(nextCard) === firstSuit) {
        counter++;
        if (counter === 5) {
          return HandType.FLUSH;
        }
      }
    }
  }

  //handle straight
  for (let i = 0; i < handArr.length; i++) {
    const firstCard = handArr[i];

    //keep track of sequence hits
    let counter = 1;
    let nextNum = getCardNumber(firstCard);
    //check rest of array in sequence
    for (let j = i + 1; j < handArr.length; j++) {
      if (reducedHand.includes(nextNum)) {
        counter++;
        nextNum++;
        if (counter === 5) {
          return HandType.STRAIGHT;
        }
      } else {
        //next card not found so stop searching
        break;
      }
    }
  }

  //Handle three of a kind
  if (cardCounts.includes(3)) {
    return HandType.THREE_OF_A_KIND;
  }

  //Handle one pair and two pair
  if (cardCounts.includes(2)) {
    let multiples = 0;
    for (let i = 0; i < cardCounts.length; i++) {
      if (cardCounts[i] === 2) multiples++;
    }
    if (multiples > 1) return HandType.TWO_PAIR;
    return HandType.ONE_PAIR;
  }

  // DEFAULT: return high card
  return HandType.HIGH_CARD;
};

const getHandTypeRank = (handType: HandType): number => {
  switch (handType) {
    case HandType.HIGH_CARD:
      return 1;
    case HandType.ONE_PAIR:
      return 2;
    case HandType.TWO_PAIR:
      return 3;
    case HandType.THREE_OF_A_KIND:
      return 4;
    case HandType.STRAIGHT:
      return 5;
    case HandType.FLUSH:
      return 6;
    case HandType.FULL_HOUSE:
      return 7;
    case HandType.FOUR_OF_A_KIND:
      return 8;
    case HandType.STRAIGHT_FLUSH:
      return 9;
    case HandType.ROYAL_FLUSH:
      return 10;
    default:
      return -1;
  }
};

//sort players from best hand to worst hand
const sortPlayers = (players: Player[], flop: Card[]) => {
  // aggregate cards into an array for analysis
  const baseHand: Card[] = [...flop];
  players.sort((p1, p2) =>
    comparePlayers([...baseHand, ...p1.hand], [...baseHand, ...p2.hand])
  );
};

/**
 *
 * @param p1: player 1 to comoare
 * @param p2: player 2 to compare
 * @returns player with the better hand
 *
 * https://www.contrib.andrew.cmu.edu/~gc00/reviews/pokerrules
 */
const comparePlayers = (p1: Card[], p2: Card[]) => {
  const p1Hand = getHandTypeFromArray(p1);
  const p2Hand = getHandTypeFromArray(p2);
  const p1Rank = getHandTypeRank(p1Hand);
  const p2Rank = getHandTypeRank(p2Hand);

  if (p1Rank < p2Rank) {
    return 1;
  } else if (p1Rank > p2Rank) {
    return -1;
  }
  return 0;
};

const getCardNumberArr = (card: Card[]): number[] => {
  const arr: number[] = [];
  for (let i = 0; i < card.length; i++) {
    arr.push(getCardNumber(card[i]));
  }
  return arr;
};

const getCardNumber = (card: Card | string): number => {
  const pattern = /(\d{1,})/;
  const re = new RegExp(pattern);
  const result = re.exec(card.toString())?.[0];

  if (result && parseInt(result) !== Number.NaN) {
    return parseInt(result);
  }
  return -1;
};

const getCardSuit = (card: Card): string => {
  return card.toString()[0];
};

const getCardCounts = (cardArr: number[]): number[] => {
  const cardCountObj: { [index: string]: number } = {};
  cardArr.forEach(function (x) {
    cardCountObj[x] = (cardCountObj[x] || 0) + 1;
  });

  return Object.values(cardCountObj);
};

const compareCards = (a: string | Card, b: string | Card) => {
  if (getCardNumber(a) < getCardNumber(b)) {
    return -1;
  } else if (getCardNumber(a) > getCardNumber(b)) {
    return 1;
  }
  return 0;
};

class GameManager {
  deck: Card[] = [];
  flop: Card[] = [];
  players: Player[] = [];
  pot: number = 0;
  playerQueue: string[] = [];
  gameState: GameState = GameState.PRE_GAME;
  initalHandAmt: number = 100;
  enableTieBreaker: boolean = false;
  minBuyIn: number = 10;

  constructor(config?: GameConfigType) {
    if (config) {
      if (config.enableTieBreaker)
        this.enableTieBreaker = config.enableTieBreaker;
      if (config.intialHandAmt) this.initalHandAmt = config.intialHandAmt;
      if (config.minBuyIn) this.initalHandAmt = config.minBuyIn;
    }
    this.deck = Object.values(Card);
  }

  addPlayer(userName: string, userID: string) {
    const player: Player = {
      userName,
      userID,
      chips: this.initalHandAmt,
      hand: [],
      key: -1,
    };
    this.players.push(player);
  }

  removePlayer(userID: string) {
    const pIndex = this.players.findIndex((p) => p.userID === userID);
    if (pIndex > -1) {
      this.players.splice(pIndex, 1);
    }
  }

  serialiseGame(userID: string): SerialisedGame {
    const playersClone = structuredClone(this.players);

    //hide other player's hands on serialisation
    for (let i = 0; i < playersClone.length; i++) {
      if (playersClone[i].userID !== userID) {
        playersClone[i].hand = [];
      }
    }

    return {
      flop: this.flop,
      gameState: this.gameState,
      pot: this.pot,
      players: playersClone,
      playerQueue: this.playerQueue,
    };
  }

  setupGame() {}

  enqueuePlayers() {}

  shuffleDeck() {}

  getRoundWinner() {}
}

export { getHandType, sortPlayers, GameManager, getCardNumber };
