import { ReactNode } from "react";
import { Space, Tag, Typography } from "../antdES";
import { GameConfigType } from "../../utils/types";

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

  return (
    <div>
      <Space direction="vertical">
        <Typography.Text>
          Cards Per Suit:{" "}
          {getTag(gameConfig?.cardsPerSuit, "purple", "cards")}
        </Typography.Text>
        <Typography.Text>
          Total Suits:{" "}
          {getTag(gameConfig?.totalSuits, "gold", "suits")}
        </Typography.Text>
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
