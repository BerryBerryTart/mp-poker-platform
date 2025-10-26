import { ReactNode } from "react";
import { Space, Tag, Typography } from "../antdES";
import { GameConfigType } from "../../utils/types";

import "./GameInfo.less";
import Club from "../Assets/Club.svg";
import Spade from "../Assets/Spade.svg";
import Heart from "../Assets/Heart.svg";
import Diamond from "../Assets/Diamond.svg";
import Star from "../Assets/Star.svg";
import Square from "../Assets/Square.svg";
import Circle from "../Assets/Circle.svg";
import Triangle from "../Assets/Triangle.svg";
import Crescent from "../Assets/Crescent.svg";
import Sun from "../Assets/Sun.svg";

interface GameInfoProps {
  gameConfig: GameConfigType | undefined;
}

export const GameInfo = (props: GameInfoProps) => {
  const { gameConfig } = props;

  const booleanTag = (val: boolean | undefined): ReactNode => {
    if (val === undefined) return <Tag color="default">???</Tag>;
    return val ? <Tag color="green">True</Tag> : <Tag color="red">False</Tag>;
  };

  const getTag = (
    val: string | number | undefined,
    color: string,
    text?: string
  ): ReactNode => {
    if (val === undefined) return <Tag color="default">???</Tag>;
    return (
      <Tag color={color}>
        {val} {text ?? ""}
      </Tag>
    );
  };

  const getSuits = (): ReactNode[] => {
    const components: ReactNode[] = [];
    if (!gameConfig) return components;
    const suitIcons = [
      <img className="mini-suit-icon" src={Club} />,
      <img className="mini-suit-icon" src={Spade} />,
      <img className="mini-suit-icon" src={Heart} />,
      <img className="mini-suit-icon" src={Diamond} />,
      <img className="mini-suit-icon blue-filter" src={Star} />,
      <img className="mini-suit-icon blue-filter" src={Square} />,
      <img className="mini-suit-icon orange-filter" src={Circle} />,
      <img className="mini-suit-icon orange-filter" src={Triangle} />,
      <img className="mini-suit-icon purple-filter" src={Crescent} />,
      <img className="mini-suit-icon purple-filter" src={Sun} />,
    ];

    for (let i = 0; i < Math.min(gameConfig.totalSuits, 10); i++) {
      components.push(<div className="mini-card">{suitIcons[i]}</div>);
    }
    return components;
  };

  return (
    <div className="game-info-box">
      <Space direction="vertical">
        <Typography.Text>
          Draw Phases: {getTag(gameConfig?.drawPhases.toString(), "lime", "")}
        </Typography.Text>
        <Typography.Text>
          Cards Per Suit: {getTag(gameConfig?.cardsPerSuit, "purple", "cards")}
        </Typography.Text>
        <Typography.Text>
          Total Suits: {getTag(gameConfig?.totalSuits, "gold", "suits")}
        </Typography.Text>
        {gameConfig && (
          <div className="suit-display">
            <Typography.Text>Suits:</Typography.Text>
            <Space style={{ marginLeft: "4px" }} direction="horizontal">
              {getSuits()}
            </Space>
          </div>
        )}
        <Typography.Text>
          Initial Hand Amount:{" "}
          {getTag(gameConfig?.intialHandAmt, "blue", "chips")}
        </Typography.Text>
        <Typography.Text>
          Minimum Buy In: {getTag(gameConfig?.minBuyIn, "blue", "chips")}
        </Typography.Text>
        <Typography.Text>
          Time Between Rounds:{" "}
          {getTag(gameConfig?.nextRoundDelay, "cyan", "seconds")}
        </Typography.Text>
        <Typography.Text>
          Manual Start Next Round: {booleanTag(gameConfig?.manualNextRound)}
        </Typography.Text>
      </Space>
    </div>
  );
};
