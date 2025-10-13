import { useContext } from "react";
import { AdminContextType } from "../Providers/AdminProvider";
import { Space, Typography } from "../antdES";
import { GameContextType } from "../Providers/GameProvider";

interface GameInfoProps {
  context: React.Context<{}>;
}

export const GameInfo = (props: GameInfoProps) => {
  const { context } = props;
  const infoContext = useContext(context) as AdminContextType | GameContextType;
  const { gameConfig } = infoContext.state;

  return (
    <div>
      <Space direction="vertical">
        <Typography.Text>
          Tie Breaker Enabled:{" "}
          {gameConfig?.enableTieBreaker?.toString().toUpperCase() ?? "?"}
        </Typography.Text>
        <Typography.Text>
          Initial Hand Amount: {gameConfig?.intialHandAmt ?? "?"} chips
        </Typography.Text>
        <Typography.Text>
          Minimum Buy In: {gameConfig?.minBuyIn ?? "?"} chips
        </Typography.Text>
        <Typography.Text>
          Time Between Rounds: {gameConfig?.nextRoundDelay ?? "?"} seconds
        </Typography.Text>
        <Typography.Text>
          Manual Start Next Round:{" "}
          {gameConfig?.manualNextRound?.toString().toUpperCase() ?? "?"}
        </Typography.Text>
      </Space>
    </div>
  );
};
