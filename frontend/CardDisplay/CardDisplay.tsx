import { Theme } from "../../utils/enums";
import { getCardNumber } from "../../utils/utils";

import "./CardDisplay.less";
import Club from "../Assets/Club.svg";
import Spade from "../Assets/Spade.svg";
import Heart from "../Assets/Heart.svg";
import Diamond from "../Assets/Diamond.svg";
import Unknown from "../Assets/Unknown.svg";
import { ThemeContext } from "../Providers/ThemeProvider";
import { useContext } from "react";
import { GameConfigType } from "../../utils/types";

export interface CardProps {
  card: string;
  small?: boolean;
  gameConfig?: GameConfigType;
}

export const CardDisplay = (props: CardProps) => {
  const { card, small, gameConfig } = props;

  const themeContext = useContext(ThemeContext);
  const { theme } = themeContext.state;

  const getCardComp = (card: string | undefined) => {
    // unturned card
    if (!card || !gameConfig) {
      return <img className="suit-icon" src={Unknown} />;
    }
    const { cardsPerSuit } = gameConfig;

    const suitChar = card.toString()[0];
    const cardNum = getCardNumber(card);
    let cardStr = "";
    let cardImg;
    switch (suitChar) {
      case "A":
        cardImg = Club;
        break;
      case "B":
        cardImg = Spade;
        break;
      case "C":
        cardImg = Heart;
        break;
      case "D":
        cardImg = Diamond;
        break;
    }

    switch (cardNum) {
      case cardsPerSuit - 3:
        cardStr = "J";
        break;
      case cardsPerSuit - 2:
        cardStr = "Q";
        break;
      case cardsPerSuit - 1:
        cardStr = "K";
        break;
      case cardsPerSuit:
        cardStr = "A";
        break;
      default:
        cardStr = (cardNum + 1).toString();
    }

    return (
      <>
        <img className="suit-icon" src={cardImg} />
        <span className="card-text">{cardStr}</span>
      </>
    );
  };

  const getClassName = () => {
    let base = !small
      ? "card-container"
      : "card-container card-container-small";
    if (!card)
      base += theme === Theme.DARK ? " card-back-dark" : " card-back-light";

    return base;
  };

  return <div className={getClassName()}>{getCardComp(card)}</div>;
};
