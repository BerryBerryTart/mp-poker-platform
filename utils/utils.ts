import { ActionColour, GameState, HandType, PlayerState } from "./enums";
import {
  Player,
  GameConfigType,
  SerialisedGame,
  GameActionType,
  HandTypeReturn,
} from "./types";

const getHandType = (
  player: string[],
  flop: string[],
  countPerSuit: number,
  handLimit: number
): HandTypeReturn => {
  // aggregate cards into an array for analysis
  const handArr: string[] = [];
  handArr.push(...player);
  handArr.push(...flop);
  if (handArr.length === 0) return { type: HandType.NONE, hand: [] };

  let hand: string[] = [];
  //Sort things so it's easier to do work later
  handArr.sort(compareCards).reverse();

  //Reduce to like numbers
  const reducedHand: number[] = getCardNumberArr(handArr);

  const cardCountObj = getCardCounts(reducedHand);
  const cardCounts = Object.values(cardCountObj);

  //gather by rank
  const cardsByRank: { [index: string]: string[] } = gatherCardsByRank(handArr);

  //handle straight flush
  for (let i = 0; i < handArr.length; i++) {
    //reset hand
    hand = [];
    const firstCard = handArr[i];
    const firstSuit = getCardSuit(firstCard);
    hand.push(handArr[i]);

    let nextNum = getCardNumber(firstCard) - 1;

    if (!handArr.includes(`${firstSuit}|${nextNum}`)) {
      continue;
    }

    //check rest of array in sequence
    for (let j = i; j < handArr.length; j++) {
      const nextCard = handArr[j];

      if (nextCard === `${firstSuit}|${nextNum}`) {
        nextNum--;
        hand.push(handArr[j]);
        if (
          hand.length === 5 &&
          hand.includes(`${firstSuit}|${countPerSuit}`)
        ) {
          return { type: HandType.ROYAL_FLUSH, hand };
        }
        if (hand.length === 5) {
          return { type: HandType.STRAIGHT_FLUSH, hand };
        }
      } else {
        //next card not found so stop searching
        continue;
      }
    }
  }

  //reset hand
  hand = [];

  //Handle four of a kind
  if (cardCounts.includes(4)) {
    const obj = Object.values(cardsByRank);
    for (let i = 0; i < obj.length; i++) {
      if (obj[i].length === 4) {
        hand = obj[i];
        break;
      }
    }
    backfillHand(hand, handArr, handLimit);
    return { type: HandType.FOUR_OF_A_KIND, hand };
  }

  //reset hand
  hand = [];

  //Handle full house
  if (cardCounts.includes(3)) {
    const obj = Object.values(cardsByRank);
    let handBuff: string[] = [];
    for (let i = 0; i < obj.length; i++) {
      if (obj[i].length === 3 || obj[i].length === 2) {
        handBuff.push(...obj[i]);
      }
    }
    handBuff.sort(compareCards).reverse();
    if (handBuff.length > 5) {
      handBuff = handBuff.slice(0, 5);
    }
    if (handBuff.length === 5) {
      return { type: HandType.FULL_HOUSE, hand: handBuff };
    }
  }

  //reset hand
  hand = [];

  //handle flush
  for (let i = 0; i < handArr.length; i++) {
    const firstCard = handArr[i];
    const firstSuit = getCardSuit(firstCard);
    hand.push(handArr[i]);

    //keep track of sequence hits
    let counter = 1;
    //check rest of array in sequence
    for (let j = i + 1; j < handArr.length; j++) {
      const nextCard = handArr[j];
      if (getCardSuit(nextCard) === firstSuit) {
        counter++;
        hand.push(handArr[j]);
        if (counter === 5) {
          return { type: HandType.FLUSH, hand };
        }
      }
    }
    //reset hand
    hand = [];
  }

  //reset hand
  hand = [];

  //handle straight
  for (let i = 0; i < handArr.length; i++) {
    //reset hand
    hand = [];
    const firstCard = handArr[i];
    hand.push(handArr[i]);

    //keep track of sequence hits
    let counter = 1;
    let nextNum = getCardNumber(firstCard) - 1;

    if (!reducedHand.includes(nextNum)) {
      continue;
    }

    //check rest of array in sequence
    for (let j = i + 1; j < handArr.length; j++) {
      if (reducedHand.includes(nextNum)) {
        counter++;
        nextNum--;
        hand.push(handArr[j]);
        if (counter === 5) {
          return { type: HandType.STRAIGHT, hand };
        }
      } else {
        //next card not found so stop searching
        break;
      }
    }
  }

  //reset hand
  hand = [];

  //Handle three of a kind
  if (cardCounts.includes(3)) {
    const obj = Object.values(cardsByRank);
    for (let i = 0; i < obj.length; i++) {
      if (obj[i].length === 3) {
        hand = obj[i];
        break;
      }
    }
    backfillHand(hand, handArr, handLimit);
    return { type: HandType.THREE_OF_A_KIND, hand };
  }

  //reset hand
  hand = [];

  //Handle one pair and two pair
  if (cardCounts.includes(2)) {
    const obj = Object.values(cardsByRank);
    const handBuff: string[][] = [];
    for (let i = 0; i < obj.length; i++) {
      if (obj[i].length === 2) {
        handBuff.push(obj[i]);
      }
    }
    handBuff.sort((a: string[], b: string[]) => {
      return getCardNumber(b[0]) - getCardNumber(a[0]);
    });

    if (handBuff.length >= 2) {
      hand.push(...handBuff[0]);
      hand.push(...handBuff[1]);
      backfillHand(hand, handArr, handLimit);
      return { type: HandType.TWO_PAIR, hand };
    }
    hand.push(...handBuff[0]);
    backfillHand(hand, handArr, handLimit);
    return { type: HandType.ONE_PAIR, hand };
  }

  //fallback to just the hand of the player
  hand = [...player];
  backfillHand(hand, handArr, handLimit);

  // DEFAULT: return high card
  return { type: HandType.HIGH_CARD, hand };
};

const backfillHand = (hand: string[], all: string[], handLimit: number) => {
  const filtered = all.filter((el) => !hand.includes(el));
  filtered.sort(compareCards).reverse();
  let i = 0;
  while (hand.length < handLimit && filtered[i]) {
    hand.push(filtered[i]);
    i++;
  }
};

const gatherCardsByRank = (
  cardArr: string[]
): { [index: string]: string[] } => {
  const cardObj: { [index: string]: string[] } = {};
  cardArr.forEach(function (x) {
    const c = x.split("|");
    if (!cardObj[c[1]]) {
      cardObj[c[1]] = [x];
    } else {
      cardObj[c[1]].push(x);
    }
  });

  return cardObj;
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
const sortPlayersGetWinner = (
  playerArr: Player[],
  flop: string[],
  countPerSuit: number,
  handLimit: number
): Player[] => {
  //deep clone player list
  const players = structuredClone(playerArr);

  //get all players by rank
  let rankObj: {
    rank: number;
    player: Player;
    handType: HandTypeReturn;
  }[] = [];

  for (let i = 0; i < players.length; i++) {
    const pHand = getHandType(players[i].hand, flop, countPerSuit, handLimit);
    const pRank = getHandTypeRank(pHand.type);
    rankObj.push({
      rank: pRank,
      player: players[i],
      handType: pHand,
    });
  }

  rankObj.sort((a, b) => b.rank - a.rank);
  // console.log(rankObj)
  //filter out everything less than best rank
  const maxRank = rankObj[0].rank;
  rankObj = rankObj.filter((el) => el.rank >= maxRank);
  rankObj.sort((a, b) => tieBreak(a.handType, b.handType));

  const winners: Player[] = [];
  //winner should be at the front
  winners.push(rankObj[0].player);

  //get the rest
  for (let i = 1; i < rankObj.length; i++) {
    const tie = tieBreak(rankObj[0].handType, rankObj[i].handType);
    if (tie === 0) {
      winners.push(rankObj[i].player);
    }
  }
  return winners;
};

const tieBreak = (p1HandType: HandTypeReturn, p2HandType: HandTypeReturn) => {
  //unfiltered hand ranks
  const p1HandRanks = getCardNumberArr(p1HandType.hand);
  const p2HandRanks = getCardNumberArr(p2HandType.hand);
  const p1Gathered = gatherCardsByRank(p1HandType.hand);
  const p2Gathered = gatherCardsByRank(p2HandType.hand);

  const p1Vals = Object.values(p1Gathered);
  const p2Vals = Object.values(p2Gathered);

  const highCardWinner = () => {
    //remove dupes from hands
    const p1HandRanksF = p1HandRanks.filter((el) => !p2HandRanks.includes(el));
    const p2HandRanksF = p2HandRanks.filter((el) => !p1HandRanks.includes(el));
    //both have same hand ranks
    if (p1HandRanks.length === 0 && p2HandRanks.length === 0) return 0;
    if (Math.max(...p1HandRanksF) < Math.max(...p2HandRanksF)) {
      return 1;
    } else if (Math.max(...p1HandRanksF) > Math.max(...p2HandRanksF)) {
      return -1;
    }
    return 0;
  };

  const findMaxFromMultiple = (multiCount: number) => {
    const p1Filtered = p1Vals
      .filter((el) => el.length === multiCount)
      .map((el) => getCardNumber(el[0]));

    const p2Filtered = p2Vals
      .filter((el) => el.length === multiCount)
      .map((el) => getCardNumber(el[0]));

    return Math.max(...p2Filtered) - Math.max(...p1Filtered);
  };

  if (
    p1HandType.type === HandType.FULL_HOUSE &&
    p2HandType.type === HandType.FULL_HOUSE
  ) {
    const val3 = findMaxFromMultiple(3);
    if (val3) return val3;
    const val2 = findMaxFromMultiple(2);
    if (val2) return val2;
  }

  if (
    p1HandType.type === HandType.FOUR_OF_A_KIND &&
    p2HandType.type === HandType.FOUR_OF_A_KIND
  ) {
    const val = findMaxFromMultiple(4);
    if (val) return val;
  }

  if (
    p1HandType.type === HandType.THREE_OF_A_KIND &&
    p2HandType.type === HandType.THREE_OF_A_KIND
  ) {
    const val = findMaxFromMultiple(3);
    if (val) return val;
  }

  if (
    (p1HandType.type === HandType.TWO_PAIR &&
      p2HandType.type === HandType.TWO_PAIR) ||
    (p1HandType.type === HandType.ONE_PAIR &&
      p2HandType.type === HandType.ONE_PAIR)
  ) {
    const val = findMaxFromMultiple(2);
    if (val) return val;
  }

  //high card fallback
  return highCardWinner();
};

const getCardNumberArr = (card: string[]): number[] => {
  const arr: number[] = [];
  for (let i = 0; i < card.length; i++) {
    arr.push(getCardNumber(card[i]));
  }
  return arr;
};

const getCardNumber = (card: string): number => {
  const result = card.split("|")[1];
  if (result && parseInt(result) !== Number.NaN) {
    return parseInt(result);
  }
  return -1;
};

const getCardSuit = (card: string): string => {
  return card.split("|")[0];
};

const getCardCounts = (cardArr: number[]): { [index: string]: number } => {
  const cardCountObj: { [index: string]: number } = {};
  cardArr.forEach(function (x) {
    cardCountObj[x] = (cardCountObj[x] || 0) + 1;
  });

  return cardCountObj;
};

const compareCards = (a: string, b: string) => {
  if (getCardNumber(a) < getCardNumber(b)) {
    return -1;
  } else if (getCardNumber(a) > getCardNumber(b)) {
    return 1;
  } else if (getCardNumber(a) === getCardNumber(b)) {
    return getCardSuit(a).localeCompare(getCardSuit(b));
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
    case PlayerState.OUT:
      return "Out";
    default:
      return "";
  }
};

function flopSum(drawPhases: number[]): number {
  return drawPhases.reduce((prev, curr) => prev + curr, 0);
}

class GameManager {
  deck: string[] = [];
  flop: string[] = [];
  players: Player[] = [];
  pot: number = 0;
  playerQueue: string[] = [];
  gameState: GameState = GameState.PRE_GAME;
  initalHandAmt: number = 100;
  minBuyIn: number = 10;
  winnerIDs: string[] = [];
  actions: GameActionType[] = [];
  manualNextRound = false;
  nextRoundDelay: number = 0;
  totalSuits = 4;
  cardsPerSuit = 13;
  handLimit = 5;
  drawPhases = [3, 1, 1];

  addPlayer(userName: string, userID: string) {
    const player: Player = {
      userName,
      userID,
      chips: this.initalHandAmt,
      wager: 0,
      hand: [],
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

    //hide other player's hands on serialisation or show everyones hand at end
    if (!adminView) {
      for (let i = 0; i < playersClone.length; i++) {
        if (
          playersClone[i].userID !== userID &&
          this.gameState === GameState.PLAYERS_BETTING
        ) {
          playersClone[i].hand = [];
        }
      }
    }
    if (this.actions.length > 50) {
      this.actions.shift();
    }

    return {
      flop: this.flop,
      gameState: this.gameState,
      pot: this.pot,
      players: playersClone,
      playerQueue: this.playerQueue,
      winnerIDs: this.winnerIDs,
      actions: this.actions,
    };
  }

  serialiseGameDetails(): GameConfigType {
    return {
      intialHandAmt: this.initalHandAmt,
      minBuyIn: this.minBuyIn,
      nextRoundDelay: this.nextRoundDelay,
      manualNextRound: this.manualNextRound,
      cardsPerSuit: this.cardsPerSuit,
      handLimit: this.handLimit,
      totalSuits: this.totalSuits,
      drawPhases: this.drawPhases,
    } as GameConfigType;
  }

  updateGameDetails(config: GameConfigType) {
    if (config.intialHandAmt) this.initalHandAmt = config.intialHandAmt;
    if (config.minBuyIn) this.minBuyIn = config.minBuyIn;
    if (typeof config.manualNextRound === "boolean")
      this.manualNextRound = config.manualNextRound;
    if (typeof config.nextRoundDelay === "number")
      this.nextRoundDelay = config.nextRoundDelay;
    if (config.cardsPerSuit) this.cardsPerSuit = config.cardsPerSuit;
    if (config.handLimit) this.handLimit = config.handLimit;
    if (config.totalSuits) this.totalSuits = config.totalSuits;
    if (config.drawPhases) {
      if (typeof config.drawPhases === "string") {
        const nextVals: number[] = [];
        const valueSplit = config.drawPhases.split(",");
        for (let i = 0; i < valueSplit.length; i++) {
          nextVals.push(Number.parseInt(valueSplit[i]));
        }
        this.drawPhases = nextVals;
      } else {
        this.drawPhases = config.drawPhases;
      }
    }
  }

  generateDeck(): string[] {
    const deck: string[] = [];
    let suit = "A";

    for (let i = 0; i < this.totalSuits; i++) {
      for (let j = 1; j <= this.cardsPerSuit; j++) {
        deck.push(`${suit}|${j}`);
      }
      suit = String.fromCharCode(suit.charCodeAt(suit.length - 1) + 1);
    }
    return deck;
  }

  setupGame(nextRound = false) {
    if (this.gameState === GameState.GAME_END) return;
    if (nextRound && this.gameState !== GameState.ROUND_END) {
      throw new Error("Round not over yet!");
    }
    this.winnerIDs = [];
    this.deck = this.generateDeck();
    this.flop = [];
    shuffle(this.deck);
    for (let i = 0; i < this.players.length; i++) {
      let p = this.players[i];
      p.hand = []; //reset hand just in case
      if (p.state === PlayerState.OUT) continue;
      if (!nextRound) p.chips = this.initalHandAmt;
      p.hand = [...this.drawCards(2)];
      p.state = PlayerState.BETTING;
      p.chips -= Math.min(this.minBuyIn, p.chips);
      p.wager += Math.min(this.minBuyIn, p.chips);
      this.pot += Math.min(this.minBuyIn, p.chips);
    }
    this.gameState = GameState.PLAYERS_BETTING;
    if (nextRound) {
      this.actions.push({
        action: "Next Round Started",
        color: ActionColour.DEFAULT,
      });
    } else {
      this.actions.push({
        action: "Game Started",
        color: ActionColour.DEFAULT,
      });
    }

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

    this.actions.push({
      action: `${p.userName} wagers ${p.wager}`,
      color: ActionColour.RAISE,
    });

    //mark player as all in if they bet all their chips
    if (p.chips === 0) {
      p.state = PlayerState.CHECKED;
      this.actions.push({
        action: `${p.userName} has gone all in!`,
        color: ActionColour.RAISE,
      });
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

  drawCards(num: number): string[] {
    const cards: string[] = [];
    if (this.deck.length === 0) return cards;
    for (let i = 0; i < num; i++) {
      cards.push(this.deck.shift() as string);
    }
    return cards;
  }

  check(userID: string) {
    const u = this.playerValidation(userID);
    this.playerCanAct(userID);
    u.state = PlayerState.CHECKED;
    this.actions.push({
      action: `${u.userName} checked`,
      color: ActionColour.CHECK,
    });

    this.enqueuePlayers();
  }

  flopSum(): number {
    return this.drawPhases.reduce((prev, curr) => prev + curr, 0);
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
      if (p.state === PlayerState.BETTING && p.chips > 0) {
        return;
      }
    }

    /**
     * if there are two or more players checked, the game can continue
     * if it's one or none checked, everyone can no longer bet or raise the ante
     * player left MUST have bet at least the table's wager for this to trigger
     */
    const checkedArr = this.players.filter(
      (el) => el.state === PlayerState.CHECKED && el.chips > 0
    );
    const wagerArr = this.players.map((el) => el.wager) ?? [];

    if (checkedArr.length <= 1) {
      //player left MUST meet minimum wager
      if (checkedArr[0] && checkedArr[0].wager < Math.max(...wagerArr)) {
        return;
      }
      //else no one else can make a move so end game
      this.flop.push(...this.drawCards(this.flopSum() - this.flop.length));
      this.gameState = GameState.ROUND_END;
      this.getRoundWinner();
    }

    if (this.isRoundOrGameOver()) return;

    let flopCount = 0;
    for (let i = 0; i < this.drawPhases.length; i++) {
      flopCount += this.drawPhases[i];
      if (this.flop.length < flopCount) {
        this.flop.push(...this.drawCards(this.drawPhases[i]));
        break;
      }
      if (this.flop.length === this.flopSum()) {
        this.gameState = GameState.ROUND_END;
        this.getRoundWinner();
        break;
      }
    }

    // reset player state from checked to betting after next card pull
    for (let i = 0; i < this.players.length; i++) {
      let p = this.players[i];
      if (p.state === PlayerState.CHECKED) {
        p.state = PlayerState.BETTING;
      }
    }
  }

  fold(userID: string) {
    // if all players but one fold, game is over
    const u = this.playerValidation(userID);
    this.playerCanAct(userID);

    this.actions.push({
      action: `${u.userName} folded`,
      color: ActionColour.FOLD,
    });

    u.state = PlayerState.FOLDED;
    const playerArr = this.players.filter(
      (el) =>
        el.state !== PlayerState.SPECTATING && el.state !== PlayerState.FOLDED
    );
    if (playerArr.length <= 1) {
      this.gameState = GameState.ROUND_END;
      this.getRoundWinner();
    } else {
      this.enqueuePlayers();
    }
  }

  reset() {
    this.deck = this.generateDeck();
    this.pot = 0;
    this.gameState = GameState.PRE_GAME;
    this.playerQueue = [];
    this.flop = [];
    this.actions = [];
    this.winnerIDs = [];
    for (let i = 0; i < this.players.length; i++) {
      let p = this.players[i];
      p.hand = [];
      p.wager = 0;
      p.chips = this.initalHandAmt;
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

    // no need to continue if the game is over
    if (this.isRoundOrGameOver()) return;

    const LOOP_LIMIT = this.playerQueue.length;
    let iteration = 0;
    while (iteration < LOOP_LIMIT) {
      //pop front player off and send them to the back of the queue
      const playerBuffer = this.playerQueue.shift() as string;
      this.playerQueue.push(playerBuffer);
      // next player is betting so stop shifting
      const u = this.playerValidation(this.playerQueue[0]);
      if (u.state === PlayerState.BETTING || u.state === PlayerState.CHECKED) {
        //user is not all in
        if (u.chips !== 0) break;
      }
      iteration++;
    }
  }

  getRoundWinner() {
    const playerArr = this.players.filter(
      (el) =>
        el.state !== PlayerState.SPECTATING &&
        el.state !== PlayerState.FOLDED &&
        el.state !== PlayerState.OUT
    );

    const winners = sortPlayersGetWinner(
      playerArr,
      this.flop,
      this.cardsPerSuit,
      this.handLimit
    );
    if (winners.length === 0) {
      throw new Error("Error! No Winners??");
    }

    //update actions
    if (winners.length === 1) {
      const w = winners[0];
      this.actions.push({
        color: ActionColour.WINNER,
        action: `${w.userName} won round with ${handTypeToString(
          getHandType(w.hand, this.flop, this.cardsPerSuit, this.handLimit).type
        )}`,
      });
    } else {
      //ties
      const split = winners.length;
      this.actions.push({
        color: ActionColour.WINNER,
        action: `${split} way tie!`,
      });
    }

    for (let i = 0; i < winners.length; i++) {
      const w = this.playerValidation(winners[i].userID);
      this.winnerIDs.push(w.userID);
      w.chips += Math.floor(this.pot / winners.length);
      this.actions.push({
        color: ActionColour.WINNER,
        action: `${w.userName} gains (${Math.floor(
          this.pot / winners.length
        )} chips)!`,
      });
    }

    //reset wagers for rest of players
    for (let i = 0; i < this.players.length; i++) {
      const p = this.players[i];
      p.wager = 0;
      if (p.chips <= 0) {
        //player out of chips so they're out
        p.state = PlayerState.OUT;
      }
    }

    //reset pot at end
    this.pot = 0;

    const nextRoundPlayers = this.players.filter(
      (el) =>
        el.state !== PlayerState.SPECTATING && el.state !== PlayerState.OUT
    );

    if (nextRoundPlayers.length === 1) {
      this.gameState = GameState.GAME_END;
      this.actions.push({
        color: ActionColour.DEFAULT,
        action: "Game Over.",
      });
    }
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

  isRoundOrGameOver() {
    return (
      this.gameState === GameState.GAME_END ||
      this.gameState === GameState.ROUND_END
    );
  }
}

export {
  getHandType,
  sortPlayersGetWinner,
  GameManager,
  getCardNumber,
  handTypeToString,
  playerStateToString,
  flopSum,
  getHandTypeRank,
};
