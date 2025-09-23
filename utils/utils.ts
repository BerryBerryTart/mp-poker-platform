import { Card, HandType } from "./enums";
import { Player, Game } from "./types";

const getHandType = (player: Player, game: Game): HandType => {
  // aggregate cards into an array for analysis
  const handArr = [];
  handArr.push(...player.hand);
  handArr.push(...game.flop);
  if (game.turn) handArr.push(game.turn);
  if (game.river) handArr.push(game.river);

  //Reduce to like numbers
  const reducedHand = [];
  for (let i = 0; i < handArr.length; i++) {
    reducedHand.push(reduceCardType(handArr[i]));
  }
  console.log(reducedHand);

  //Handle two pair

  // DEFAULT: return high card
  return HandType.HIGH_CARD;
};

const reduceCardType = (card: Card) => {
  if (
    card === Card.CLUB_ONE ||
    card === Card.SPADE_ONE ||
    card === Card.HEART_ONE ||
    card === Card.DIAMOND_ONE
  ) {
    return 1;
  }
  if (
    card === Card.CLUB_TWO ||
    card === Card.SPADE_TWO ||
    card === Card.HEART_TWO ||
    card === Card.DIAMOND_TWO
  ) {
    return 2;
  }
  if (
    card === Card.CLUB_THREE ||
    card === Card.SPADE_THREE ||
    card === Card.HEART_THREE ||
    card === Card.DIAMOND_THREE
  ) {
    return 3;
  }
  if (
    card === Card.CLUB_FOUR ||
    card === Card.SPADE_FOUR ||
    card === Card.HEART_FOUR ||
    card === Card.DIAMOND_FOUR
  ) {
    return 4;
  }
  if (
    card === Card.CLUB_FIVE ||
    card === Card.SPADE_FIVE ||
    card === Card.HEART_FIVE ||
    card === Card.DIAMOND_FIVE
  ) {
    return 5;
  }
  if (
    card === Card.CLUB_SIX ||
    card === Card.SPADE_SIX ||
    card === Card.HEART_SIX ||
    card === Card.DIAMOND_SIX
  ) {
    return 6;
  }
  if (
    card === Card.CLUB_SEVEN ||
    card === Card.SPADE_SEVEN ||
    card === Card.HEART_SEVEN ||
    card === Card.DIAMOND_SEVEN
  ) {
    return 7;
  }
  if (
    card === Card.CLUB_EIGHT ||
    card === Card.SPADE_EIGHT ||
    card === Card.HEART_EIGHT ||
    card === Card.DIAMOND_EIGHT
  ) {
    return 8;
  }
  if (
    card === Card.CLUB_NINE ||
    card === Card.SPADE_NINE ||
    card === Card.HEART_NINE ||
    card === Card.DIAMOND_NINE
  ) {
    return 9;
  }
  if (
    card === Card.CLUB_TEN ||
    card === Card.SPADE_TEN ||
    card === Card.HEART_TEN ||
    card === Card.DIAMOND_TEN
  ) {
    return 10;
  }
  if (
    card === Card.CLUB_JACK ||
    card === Card.SPADE_JACK ||
    card === Card.HEART_JACK ||
    card === Card.DIAMOND_JACK
  ) {
    return 11;
  }
  if (
    card === Card.CLUB_QUEEN ||
    card === Card.SPADE_QUEEN ||
    card === Card.HEART_QUEEN ||
    card === Card.DIAMOND_QUEEN
  ) {
    return 12;
  }
  if (
    card === Card.CLUB_KING ||
    card === Card.SPADE_KING ||
    card === Card.HEART_KING ||
    card === Card.DIAMOND_KING
  ) {
    return 13;
  }
  if (
    card === Card.CLUB_ACE ||
    card === Card.SPADE_ACE ||
    card === Card.HEART_ACE ||
    card === Card.DIAMOND_ACE
  ) {
    return 14;
  }

  //Something definitely went wrong if we reach this
  return -1;
};

export { getHandType };
