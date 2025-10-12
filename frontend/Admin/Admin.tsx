import { ReactNode, useContext, useEffect } from "react";
import { AdminContext, AdminContextType } from "../Providers/AdminProvider";
import { Button, Card, Popover, Space, Typography } from "../antdES";
import { Player } from "../../utils/types";
import { CardDisplay } from "../CardDisplay/CardDisplay";
import { GameState } from "../../utils/enums";
import { CommunityCards } from "../CommunityCards/CommunityCards";
import {
  getHandType,
  handTypeToString,
  playerStateToString,
} from "../../utils/utils";

import "./Admin.less";
import Close from "../Assets/Close.svg";

export const Admin = () => {
  const adminContext = useContext(AdminContext) as AdminContextType;
  const { adminGameState, gameConfig } = adminContext.state;
  const {
    adminConnect,
    startGame,
    resetGame,
    refresh,
    nextRound,
    disconnectUser,
  } = adminContext.actions;

  useEffect(() => {
    adminConnect();
  }, []);

  useEffect(() => {
    console.log(adminGameState);
  }, [adminGameState]);

  const handleStartGame = () => {
    console.log("STARTING GAME");
    startGame();
  };

  const reset = () => {
    console.log("RESET GAME");
    resetGame();
  };

  const renderHand = (player: Player): ReactNode[] => {
    const h = player.hand ?? [];
    const components: ReactNode[] = [];

    for (let i = 0; i < 2; i++) {
      components.push(
        <CardDisplay small key={i.toString()} card={h[i] ? h[i] : undefined} />
      );
    }

    return components;
  };

  const fetchHandString = (p: Player): string => {
    return handTypeToString(getHandType(p, adminGameState?.flop ?? []));
  };

  const getPlayers = (): ReactNode[] => {
    const components: ReactNode[] = [];
    const p = adminGameState?.players ?? [];

    for (let i = 0; i < p.length; i++) {
      components.push(
        <Card
          className="player-card"
          title={p[i].userName}
          size="small"
          key={i.toString()}
          extra={getDisconnectComp(p[i].userID)}
        >
          <Space direction="vertical">
            <Typography.Text style={{ cursor: "default" }}>
              Chips: {p[i].chips}
            </Typography.Text>
            {adminGameState?.gameState !== GameState.ROUND_END &&
              adminGameState?.gameState !== GameState.GAME_END && (
                <>
                  <Typography.Text style={{ cursor: "default" }}>
                    Wager: {p[i].wager}
                  </Typography.Text>
                  <Typography.Text style={{ cursor: "default" }}>
                    {playerStateToString(p[i].state)}
                  </Typography.Text>
                </>
              )}
          </Space>
          <span className="card-content mini-hand">{renderHand(p[i])}</span>
          <Typography.Text italic type="secondary">
            {fetchHandString(p[i])}
          </Typography.Text>
        </Card>
      );
    }

    for (let i = p.length; i < 2; i++) {
      components.push(
        <Card
          className="player-card"
          title="Empty Player Slot"
          size="small"
          key={i.toString()}
        >
          <Typography.Text disabled>Waiting For Player</Typography.Text>
        </Card>
      );
    }

    return components;
  };

  const getDisconnectComp = (userID: string): ReactNode => {
    return (
      <Popover
        content={
          <Typography.Text type="danger">Disconnect User</Typography.Text>
        }
      >
        <img src={Close} onClick={(_) => disconnectUser(userID)} />
      </Popover>
    );
  };

  return (
    <div id="admin-container">
      <div id="players-container">
        <Space>{getPlayers()}</Space>
      </div>
      <CommunityCards gameState={adminGameState} />
      <div id="info">
        <Typography>
          Tie Breaker Enabled: {gameConfig?.enableTieBreaker?.toString() ?? "?"}
        </Typography>
        <Typography>
          Initial Hand Amount: {gameConfig?.intialHandAmt ?? "?"}
        </Typography>
        <Typography>Minimum Buy In: {gameConfig?.minBuyIn ?? "?"}</Typography>
        <Button>CONFIG GAME</Button>
      </div>
      <Space>
        <Button
          disabled={
            adminGameState?.gameState !== GameState.PRE_GAME ||
            adminGameState?.players.length < 2
          }
          onClick={handleStartGame}
        >
          START GAME
        </Button>
        <Button
          disabled={adminGameState?.gameState === GameState.PRE_GAME}
          onClick={reset}
        >
          RESET GAME
        </Button>
        <Button
          disabled={adminGameState?.gameState !== GameState.ROUND_END}
          onClick={nextRound}
        >
          NEXT ROUND
        </Button>
        <Button onClick={refresh}>REFRESH DATA</Button>
      </Space>
    </div>
  );
};
