import { Button, Card, Typography } from "antd";
import { Card as CardEnum } from "../../utils/enums";
import { CardDisplay } from "../CardDisplay/CardDisplay";
import { ReactNode } from "react";

import "./GameBoard.less";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

export const GameBoard = () => {
  const getPlayers = (): ReactNode[] => {
    const playerComponents: ReactNode[] = [];
    playerComponents.push(
      <Card className="player-card" title="Player 1" size="small" key="1">
        <span>Chips: 100</span>
      </Card>
    );
    playerComponents.push(
      <Card className="player-card" title="Player 2" size="small" key="2">
        <span>Chips: 4000</span>
      </Card>
    );
    playerComponents.push(
      <Card className="player-card" title="Player 3" size="small" key="3">
        <span>Chips: 12</span>
      </Card>
    );

    for (let i = 4; i < 8; i++) {
      playerComponents.push(
        <Card
          className="player-card"
          title="Empty Player Slot"
          size="small"
          key={i.toString()}
        >
          <Typography.Text disabled>Chips: N/A</Typography.Text>
        </Card>
      );
    }

    return playerComponents;
  };

  return (
    <div id="game-board-container">
      <div id="players-container">{getPlayers()}</div>

      <div id="community-hand-container">
        <Typography>Player 2's Turn</Typography>
        <div id="community-cards">
          <CardDisplay card={CardEnum.HEART_TEN} />
          <CardDisplay card={CardEnum.DIAMOND_JACK} />
          <CardDisplay card={CardEnum.CLUB_ACE} />
          <CardDisplay card={CardEnum.SPADE_QUEEN} />
        </div>
        <Typography.Text italic>Community Cards</Typography.Text>
      </div>

      <div id="info-container">
        <div id="connection-stats">
          <Typography.Text>Not Connected</Typography.Text>
        </div>
        <div id="your-info">
          <div id="your-actions">
            <div id="buttons">
              <Button>RAISE</Button>
              <Button>CHECK</Button>
              <Button>FOLD</Button>
            </div>
            <Typography.Text>Your Chips: 0</Typography.Text>
          </div>
          <div id="your-hand-container">
            <div id="your-hand">
              <CardDisplay card={CardEnum.CLUB_ACE} />
              <CardDisplay card={CardEnum.DIAMOND_SEVEN} />
            </div>
            <Typography.Text italic>Your Hand</Typography.Text>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
};
