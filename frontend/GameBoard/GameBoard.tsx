import {
  Button,
  Card,
  InputNumber,
  Popover,
  Typography,
  Input,
  Space,
} from "../antdES";
import { CardDisplay } from "../CardDisplay/CardDisplay";
import { ReactNode, useContext, useRef, useState } from "react";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { GameContext, GameContextType } from "../Providers/GameProvider";
import { v6 } from "uuid";

import "./GameBoard.less";

export const GameBoard = () => {
  const [raiseAmt, setRaiseAmt] = useState(0);
  const [userName, setUserName] = useState("");

  const userID = useRef<string>(v6());

  const gameContext = useContext(GameContext) as GameContextType;
  const { connected, gameState, self } = gameContext.state;
  const { connect, disconnect, placeBet } = gameContext.actions;

  const getPlayers = (): ReactNode[] => {
    const playerComponents: ReactNode[] = [];
    const p = gameState?.players ?? [];
    for (let i = 0; i < 7; i++) {
      let title = p[i] ? p[i].userName : "Empty Player Slot";
      if (p[i] && p[i]?.userID === self?.userID) title += " (You)";
      playerComponents.push(
        <Card
          className="player-card"
          title={title}
          size="small"
          key={i.toString()}
        >
          {!connected && (
            <Popover
              placement="bottom"
              title="Enter Username (optional)"
              trigger="click"
              content={joinPopupContent}
            >
              <Typography.Text type="success" style={{ cursor: "pointer" }}>
                Click To Join
              </Typography.Text>
            </Popover>
          )}
          {connected && p[i] && (
            <>
              <p className="card-content" style={{ cursor: "default" }}>
                Chips: {p[i].chips}
              </p>
              <p className="card-content" style={{ cursor: "default" }}>
                Wager: {p[i].wager}
              </p>
            </>
          )}
          {connected && !p[i] && (
            <Typography.Text disabled style={{ cursor: "default" }}>
              Click To Join
            </Typography.Text>
          )}
        </Card>
      );
    }

    return playerComponents;
  };

  const handleRaiseAmtChange = (value: any) => {
    setRaiseAmt(!isNaN(value) ? value : 0);
  };

  const joinPopupContent = () => {
    return (
      <Space.Compact>
        <Input onChange={(val) => setUserName(val.target.value)} />
        <Button onClick={() => connect(userName, userID.current)}>JOIN</Button>
      </Space.Compact>
    );
  };

  const handleRaise = () => {
    placeBet(userID.current, raiseAmt);
    setRaiseAmt(0);
  };

  const raisePopupContent = () => {
    return (
      <Space.Compact>
        <InputNumber min={0} onChange={handleRaiseAmtChange} value={raiseAmt} />
        <Button onClick={handleRaise} disabled={raiseAmt < 1}>
          SUBMIT
        </Button>
      </Space.Compact>
    );
  };

  const renderHand = (): ReactNode[] => {
    const h = self?.hand ?? [];
    const components: ReactNode[] = [];

    for (let i = 0; i < 2; i++) {
      components.push(
        <CardDisplay key={i.toString()} card={h[i] ? h[i] : undefined} />
      );
    }

    return components;
  };

  const renderCommunityCards = (): ReactNode[] => {
    const c = gameState?.flop ?? [];
    const components: ReactNode[] = [];

    for (let i = 0; i < 5; i++) {
      components.push(
        <CardDisplay key={i.toString()} card={c[i] ? c[i] : undefined} />
      );
    }

    return components;
  };

  return (
    <div id="game-board-container">
      <div id="players-container">
        <Space>{getPlayers()}</Space>
      </div>

      <div id="community-hand-container">
        <Typography>Player 2's Turn</Typography>
        <div id="community-cards">{renderCommunityCards()}</div>
        <Typography.Text italic>Community Cards</Typography.Text>
        <br />
        <Typography>Prize Pot: {gameState?.pot ?? 0}</Typography>
      </div>

      <div id="info-container">
        <div id="connection-stats">
          <Space>
            <Typography.Text>
              {connected ? "Connected!" : "Not Connected"}
            </Typography.Text>
            {connected && (
              <Button
                danger
                type="primary"
                size="small"
                onClick={() => disconnect()}
              >
                Disconnect
              </Button>
            )}
          </Space>
        </div>
        <div id="your-info">
          <div id="your-actions">
            <div id="buttons">
              <Popover
                title="Enter Raise Amount"
                trigger="click"
                content={raisePopupContent}
              >
                <Button disabled={!connected}>RAISE</Button>
              </Popover>
              <Button disabled={!connected}>CHECK</Button>
              <Button disabled={!connected}>FOLD</Button>
            </div>
            <Space size="large">
              <Typography.Text>Your Chips: {self?.chips ?? 0}</Typography.Text>
              <Typography.Text>Your Wager: {self?.wager ?? 0}</Typography.Text>
            </Space>
          </div>
          <div id="your-hand-container">
            <div id="your-hand">{renderHand()}</div>
            <Typography.Text italic>Your Hand</Typography.Text>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
};
