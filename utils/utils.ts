import { Card, GameState, HandType, PlayerState } from "./enums";
import {
  Player,
  GameConfigType,
  SerialisedGame,
  GameActionType,
} from "./types";

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
    let nextNum = getCardNumber(firstCard) + 1;

    if (!handArr.includes(`${firstSuit}${nextNum}` as Card)) {
      continue;
    }

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
    let nextNum = getCardNumber(firstCard) + 1;

    if (!reducedHand.includes(nextNum)) {
      continue;
    }

    //check rest of array in sequence
    for (let j = i + 1; j < handArr.length; j++) {
      if (reducedHand.includes(nextNum)) {
        counter++;
        nextNum++;
        if (counter === 5) {
          console.log(reducedHand);
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

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array: any[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

const handTypeToString = (handType: HandType): string => {
  switch (handType) {
    case HandType.HIGH_CARD:
      return "High Card";
    case HandType.ONE_PAIR:
      return "One Pair";
    case HandType.TWO_PAIR:
      return "Two Pair";
    case HandType.THREE_OF_A_KIND:
      return "Three of a Kind";
    case HandType.STRAIGHT:
      return "Straight";
    case HandType.FLUSH:
      return "Flush";
    case HandType.FULL_HOUSE:
      return "Full House";
    case HandType.FOUR_OF_A_KIND:
      return "Four of a Kind";
    case HandType.STRAIGHT_FLUSH:
      return "Straight Flush";
    case HandType.ROYAL_FLUSH:
      return "Royal Flush";
    default:
      return "";
  }
};

const playerStateToString = (state: PlayerState): string => {
  switch (state) {
    case PlayerState.BETTING:
      return "Betting";
    case PlayerState.CHECKED:
      return "Check";
    case PlayerState.FOLDED:
      return "Folded";
    case PlayerState.SPECTATING:
      return "Spectating";
    case PlayerState.ALL_IN:
      return "All In";
    default:
      return "";
  }
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
  winnerID: string | undefined = undefined;
  actions: GameActionType[] = [];

  addPlayer(userName: string, userID: string) {
    const player: Player = {
      userName,
      userID,
      chips: this.initalHandAmt,
      wager: 0,
      hand: [],
      key: -1,
      state: PlayerState.SPECTATING,
    };
    this.players.push(player);
  }

  removePlayer(userID: string) {
    const pIndex = this.players.findIndex((p) => p.userID === userID);
    if (pIndex > -1) {
      this.players.splice(pIndex, 1);
    }
    const pQIndex = this.playerQueue.findIndex((p) => p === userID);
    if (pQIndex > -1) {
      this.players.splice(pIndex, 1);
    }
  }

  serialiseGame(userID: string, adminView?: boolean): SerialisedGame {
    const playersClone = structuredClone(this.players);

    //hide other player's hands on serialisation
    if (!adminView) {
      for (let i = 0; i < playersClone.length; i++) {
        if (playersClone[i].userID !== userID) {
          playersClone[i].hand = [];
        }
      }
    }

    return {
      flop: this.flop,
      gameState: this.gameState,
      pot: this.pot,
      players: playersClone,
      playerQueue: this.playerQueue,
      winnerID: this.winnerID,
      actions: this.actions,
    };
  }

  serialiseGameDetails(): GameConfigType {
    return {
      enableTieBreaker: this.enableTieBreaker,
      intialHandAmt: this.initalHandAmt,
      minBuyIn: this.minBuyIn,
    } as GameConfigType;
  }

  updateGameDetails(config: GameConfigType) {
    if (config.enableTieBreaker)
      this.enableTieBreaker = config.enableTieBreaker;
    if (config.intialHandAmt) this.initalHandAmt = config.intialHandAmt;
    if (config.minBuyIn) this.initalHandAmt = config.minBuyIn;
  }

  setupGame() {
    this.deck = Object.values(Card);
    shuffle(this.deck);
    for (let i = 0; i < this.players.length; i++) {
      let p = this.players[i];
      p.hand = [...this.drawCards(2)];
      p.state = PlayerState.BETTING;
      p.chips -= this.minBuyIn;
      p.wager += this.minBuyIn;
      this.pot += this.minBuyIn;
    }
    this.gameState = GameState.PLAYERS_BETTING;
    this.actions.push({ action: "Game Started" });
    this.enqueuePlayers();
  }

  placeBet(userID: string, bet: number) {
    const p = this.playerValidation(userID);
    if (!this.playerQueue[0]) return;
    this.playerCanAct(userID);

    if (p.chips < bet) {
      throw new Error("Not enough chips to bet");
    }

    p.chips -= bet;
    p.wager += bet;
    this.pot += bet;

    this.actions.push({ action: `${p.userName} wagers ${p.wager}` });

    //mark player as all in if they bet all their chips
    if (p.chips === 0) {
      p.state = PlayerState.ALL_IN;
      this.actions.push({ action: `${p.userName} gone all in!` });
    }

    this.enqueuePlayers();
  }

  //helper function to ensure a player exists
  playerValidation(userID: string): Player {
    const u = this.players.find((el) => el.userID === userID);
    if (!u) {
      throw new Error("Player not found");
    }
    return u;
  }

  playerCanAct(userID: string) {
    if (userID !== this.playerQueue[0]) {
      throw new Error("Player tried to go out of order");
    }
  }

  drawCards(num: number): Card[] {
    const cards: Card[] = [];
    if (this.deck.length === 0) return cards;
    for (let i = 0; i < num; i++) {
      cards.push(this.deck.shift() as Card);
    }
    return cards;
  }

  check(userID: string) {
    const u = this.playerValidation(userID);
    this.playerCanAct(userID);
    u.state = PlayerState.CHECKED;
    this.actions.push({ action: `${u.userName} checked` });

    this.enqueuePlayers();
  }

  advanceGameState() {
    /**
     * - Check if we need to advance game state first
     * ADVANCE GAME STATE IF
     * - all players are checked
     * - all players are ALL IN
     * - everyone who can bet has
     */

    //if all players have checked, advance game state
    for (let i = 0; i < this.players.length; i++) {
      let p = this.players[i];
      //players still betting so don't advance
      if (p.state === PlayerState.BETTING) {
        return;
      }
    }

    /**
     * if there are two or more players checked, the game can continue
     * if it's one or none checked, everyone can no longer bet or raise the ante
     * player left MUST have bet at least the table's wager for this to trigger
     */
    const gameArr = this.players.filter(
      (el) => el.state === PlayerState.CHECKED
    );
    const wagerArr = this.players.map((el) => el.wager) ?? [];

    if (gameArr.length <= 1) {
      //player left MUST meet minimum wager
      if (gameArr[0] && gameArr[0].wager < Math.max(...wagerArr)) {
        return;
      }
      //else no one else can make a move so end game
      this.flop.push(...this.drawCards(5 - this.flop.length));
      this.gameState = GameState.GAME_END;
      this.getRoundWinner();
    }

    // reset player state from checked to betting for the next card pull
    for (let i = 0; i < this.players.length; i++) {
      let p = this.players[i];
      if (p.state === PlayerState.CHECKED) {
        p.state = PlayerState.BETTING;
      }
    }

    if (this.flop.length < 3) {
      //inital flop
      this.flop.push(...this.drawCards(3));
    } else if (this.flop.length === 3) {
      //turn
      this.flop.push(...this.drawCards(1));
    } else if (this.flop.length === 4) {
      //river
      this.flop.push(...this.drawCards(1));
    } else if (this.flop.length === 5) {
      //all community cards have been drawn, showdown and game end
      this.gameState = GameState.GAME_END;
      this.getRoundWinner();
    }
  }

  fold(userID: string) {
    // if all players but one fold, game is over
    const u = this.playerValidation(userID);
    this.playerCanAct(userID);

    this.actions.push({ action: `${u.userName} folded` });

    u.state = PlayerState.FOLDED;
    const playerArr = this.players.filter(
      (el) =>
        el.state !== PlayerState.SPECTATING && el.state !== PlayerState.FOLDED
    );
    if (playerArr.length <= 1) {
      this.gameState = GameState.GAME_END;
      this.getRoundWinner();
    } else {
      this.enqueuePlayers();
    }
  }

  reset() {
    this.deck = Object.values(Card);
    this.pot = 0;
    this.gameState = GameState.PRE_GAME;
    this.initalHandAmt = 100;
    this.enableTieBreaker = false;
    this.minBuyIn = 10;
    this.playerQueue = [];
    this.flop = [];
    this.actions = [];
    for (let i = 0; i < this.players.length; i++) {
      let p = this.players[i];
      p.hand = [];
      p.wager = 0;
      p.chips = this.initalHandAmt;
      p.key = 1;
      p.state = PlayerState.SPECTATING;
    }
  }

  //queue of players turns
  enqueuePlayers() {
    //first go
    if (this.playerQueue.length === 0) {
      this.playerQueue = this.players.map((el) => el.userID);
      return;
    }

    //advance game state if needed
    this.advanceGameState();

    const LOOP_LIMIT = this.playerQueue.length;
    let iteration = 0;
    while (iteration < LOOP_LIMIT) {
      //pop front player off and send them to the back of the queue
      const playerBuffer = this.playerQueue.shift() as string;
      this.playerQueue.push(playerBuffer);
      // next player is betting so stop shifting
      const u = this.playerValidation(this.playerQueue[0]);
      if (u.state === PlayerState.BETTING || u.state === PlayerState.CHECKED) {
        break;
      }
      iteration++;
    }
  }

  getRoundWinner() {
    const playerArr = this.players.filter(
      (el) =>
        el.state !== PlayerState.SPECTATING && el.state !== PlayerState.FOLDED
    );
    //TODO: still need to handle ties
    sortPlayers(playerArr, this.flop);
    this.winnerID = playerArr[0].userID;
    playerArr[0].chips += this.pot;
    for (let i = 0; i < this.players.length; i++) {
      const p = this.players[i];
      p.wager = 0;
    }

    this.actions.push({
      action: `${playerArr[0].userName} won the round (${this.pot} chips)!`,
    });
  }

  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  shuffle(array: any[]) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
  }
}

export {
  getHandType,
  getHandTypeFromArray,
  sortPlayers,
  GameManager,
  getCardNumber,
  handTypeToString,
  playerStateToString,
};
