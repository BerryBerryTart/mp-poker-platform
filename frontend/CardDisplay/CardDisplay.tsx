import { Card } from "../../utils/enums";
import { getCardNumber } from "../../utils/utils";

import "./CardDisplay.less";
import Club from "../Assets/Club.svg";
import Spade from "../Assets/Spade.svg";
import Heart from "../Assets/Heart.svg";
import Diamond from "../Assets/Diamond.svg";
import Unknown from "../Assets/Unknown.svg";

export interface CardProps {
  card?: Card;
  small?: boolean;
}

export const CardDisplay = (props: CardProps) => {
  const { card, small } = props;

  const getCardComp = (card: Card | undefined) => {
    // unturned card
    if (!card) {
      return <img className="suit-icon" src={Unknown} />;
    }

    const suitChar = card.toString()[0];
    const cardNum = getCardNumber(card);
    let cardStr = "";
    let cardImg;
    switch (suitChar) {
      case "C":
        cardImg = Club;
        break;
      case "S":
        cardImg = Spade;
        break;
      case "H":
        cardImg = Heart;
        break;
      case "D":
        cardImg = Diamond;
        break;
    }

    switch (cardNum) {
      case 11:
        cardStr = "J";
        break;
      case 12:
        cardStr = "Q";
        break;
      case 13:
        cardStr = "K";
        break;
      case 14:
        cardStr = "A";
        break;
      default:
        cardStr = cardNum.toString();
    }

    return (
      <>
        <img className="suit-icon" src={cardImg} />
        <span className="card-text">{cardStr}</span>
      </>
    );
  };

  const getClassName = () => {
    let base = !small ? "card-container" : "card-container card-container-small";
    if (!card) base += " card-back";

    return base;
  };

  return <div className={getClassName()}>{getCardComp(card)}</div>;
};
