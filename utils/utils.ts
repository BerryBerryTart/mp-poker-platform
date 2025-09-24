import { Card, HandType } from "./enums";
import { Player, Game } from "./types";

const getHandType = (player: Player, game: Game): HandType => {
  // aggregate cards into an array for analysis
  const handArr: Card[] = [];
  handArr.push(...player.hand);
  handArr.push(...game.flop);
  if (game.turn) handArr.push(game.turn);
  if (game.river) handArr.push(game.river);

  //Sort things so it's easier to do work later
  handArr.sort(compareCards);

  //Reduce to like numbers
  const reducedHand: number[] = [];
  for (let i = 0; i < handArr.length; i++) {
    reducedHand.push(getCardNumber(handArr[i]));
  }

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
  } else if (getCardNumber(a) < getCardNumber(b)) {
    return 1;
  }
  return 0;
};

export { getHandType };
