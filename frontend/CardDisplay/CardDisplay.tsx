import { Card } from "../../utils/enums";
import ".Card.less";
import Club from "../Assets/Club.svg";
import Spade from "../Assets/Spade.svg";
import Heart from "../Assets/Heart.svg";
import Diamond from "../Assets/Diamond.svg";

export interface CardProps {
  card: Card;
}

export const CardDisplay = (props: CardProps) => {
  const { card } = props;

  const getSuitIcon = (card: Card) => {
    const suitChar = card.toString()[0];
    switch (suitChar) {
      case "C":
        return Club;
      case "S":
        return Spade;
      case "H":
        return Heart;
      case "D":
        return Diamond;
    }
    return undefined;
  };

  return <div className="card-container"></div>;
};
