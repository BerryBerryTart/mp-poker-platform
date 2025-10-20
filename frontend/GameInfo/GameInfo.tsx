import { ReactNode, useContext } from "react";
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

  const numberTag = (val: number | undefined, text?: string): ReactNode => {
    if (val === undefined) return <Tag color="default">???</Tag>;
    return (
      <Tag color="blue">
        {val} {text ?? ""}
      </Tag>
    );
  };

  return (
    <div>
      <Space direction="vertical">
        <Typography.Text>
          Tie Breaker Enabled: {booleanTag(gameConfig?.enableTieBreaker)}
        </Typography.Text>
        <Typography.Text>
          Initial Hand Amount: {numberTag(gameConfig?.intialHandAmt, "chips")}
        </Typography.Text>
        <Typography.Text>
          Minimum Buy In: {numberTag(gameConfig?.minBuyIn, "chips")}
        </Typography.Text>
        <Typography.Text>
          Time Between Rounds:{" "}
          {numberTag(gameConfig?.nextRoundDelay, "seconds")}
        </Typography.Text>
        <Typography.Text>
          Manual Start Next Round: {booleanTag(gameConfig?.manualNextRound)}
        </Typography.Text>
      </Space>
    </div>
  );
};
