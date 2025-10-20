import {
  Button,
  Card,
  InputNumber,
  Popover,
  Typography,
  Input,
  Space,
  Timeline,
  FloatButton,
} from "../antdES";
import { CardDisplay } from "../CardDisplay/CardDisplay";
import { ReactNode, useContext, useRef, useState, useEffect } from "react";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { GameContext, GameContextType } from "../Providers/GameProvider";
import { v6 } from "uuid";

import "./GameBoard.less";
import {
  getHandType,
  handTypeToString,
  playerStateToString,
} from "../../utils/utils";
import { CommunityCards } from "../CommunityCards/CommunityCards";
import {
  ActionColour,
  GameState,
  PlayerState,
  Card as CardEnum,
  Theme,
} from "../../utils/enums";
import { Player } from "../../utils/types";

import Info from "../Assets/Info.svg";
import { ThemeContext } from "../Providers/ThemeProvider";
import { GameInfo } from "../GameInfo/GameInfo";

export const GameBoard = () => {
  const [raiseAmt, setRaiseAmt] = useState(0);
  const [userName, setUserName] = useState("");
  const [yourTurn, setYourTurn] = useState(false);

  const userID = useRef<string>(v6());

  const themeContext = useContext(ThemeContext);
  const { theme } = themeContext.state;

  const gameContext = useContext(GameContext) as GameContextType;
  const { connected, gameState, self, gameConfig } = gameContext.state;
  const { connect, disconnect, placeBet, check, fold } = gameContext.actions;

  useEffect(() => {
    console.log(gameState);
    if (
      gameState?.playerQueue[0] &&
      gameState?.playerQueue[0] === userID.current
    ) {
      setYourTurn(true);
    } else {
      setYourTurn(false);
    }
  }, [gameState]);

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
            <Space direction="vertical">
              <Typography.Text style={{ cursor: "default" }}>
                Chips: {p[i].chips}
              </Typography.Text>
              {gameState?.gameState !== GameState.ROUND_END &&
                gameState?.gameState !== GameState.GAME_END && (
                  <>
                    <Typography.Text style={{ cursor: "default" }}>
                      Wager: {p[i].wager}
                    </Typography.Text>
                    <Typography.Text style={{ cursor: "default" }}>
                      {playerStateToString(p[i].state)}
                    </Typography.Text>
                  </>
                )}
              {(gameState?.gameState === GameState.ROUND_END ||
                gameState?.gameState === GameState.GAME_END) && (
                <>
                  <span className="card-content mini-hand">
                    {renderHand(p[i])}
                  </span>
                  <Typography.Text italic type="secondary">
                    {fetchHandString(p[i])}
                  </Typography.Text>
                </>
              )}
            </Space>
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

  const fetchHandString = (p: Player): string => {
    return handTypeToString(getHandType(p, gameState?.flop ?? []));
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

  const handleRaise = (allIn = false) => {
    if (allIn) {
      placeBet(userID.current, self?.chips ?? 0);
    } else {
      placeBet(userID.current, raiseAmt);
    }
    setRaiseAmt(0);
  };

  const raisePopupContent = () => {
    return (
      <Space direction="vertical" align="center">
        {!canRaise() && minRaiseAmt() - raiseAmt > 0 && (
          <Typography.Text type="danger">
            You must bet at least {minRaiseAmt() - raiseAmt} chips
          </Typography.Text>
        )}
        <Space.Compact>
          <InputNumber
            min={0}
            max={self?.chips ?? 0}
            onChange={handleRaiseAmtChange}
            value={raiseAmt}
            width={"100%"}
          />
          <Button onClick={(_) => handleRaise()} disabled={!canRaise()}>
            SUBMIT
          </Button>
        </Space.Compact>
        <Space.Compact>
          <Button
            disabled={disableRaiseAmtBtn(-10)}
            onClick={(_) => handleRaiseChipBtn(-10)}
          >
            -10
          </Button>
          <Button
            disabled={disableRaiseAmtBtn(-5)}
            onClick={(_) => handleRaiseChipBtn(-5)}
          >
            -5
          </Button>
          <Button onClick={(_) => handleRaise(true)}>GO ALL IN!</Button>
          <Button
            disabled={disableRaiseAmtBtn(5)}
            onClick={(_) => handleRaiseChipBtn(5)}
          >
            +5
          </Button>
          <Button
            disabled={disableRaiseAmtBtn(10)}
            onClick={(_) => handleRaiseChipBtn(10)}
          >
            +10
          </Button>
        </Space.Compact>
      </Space>
    );
  };

  const handleRaiseChipBtn = (amt: number) => {
    if (!self?.chips) return;
    setRaiseAmt(raiseAmt + amt);
  };

  const disableRaiseAmtBtn = (amt: number) => {
    if (!self?.chips) return true;
    if (raiseAmt + amt < 0 || raiseAmt + amt > self.chips) {
      return true;
    }
    return false;
  };

  const minRaiseAmt = () => {
    const wagerArr = gameState?.players.map((el) => el.wager) ?? [];
    const maxWager = Math.max(...wagerArr);
    const ownWager = self?.wager ?? 0;
    return Math.min(self?.chips ?? Infinity, maxWager - ownWager);
  };

  const canRaise = () => {
    if (
      gameState?.gameState === GameState.GAME_END ||
      gameState?.gameState === GameState.ROUND_END
    )
      return false;
    if (raiseAmt === 0) return false;
    if (raiseAmt >= minRaiseAmt()) {
      return true;
    }
    return false;
  };

  const renderHand = (p?: Player): ReactNode[] => {
    let h: CardEnum[] = [];
    if (p) {
      h = p.hand;
    } else if (self?.hand) {
      h = self.hand;
    }
    const components: ReactNode[] = [];

    for (let i = 0; i < 2; i++) {
      components.push(
        <CardDisplay
          key={i.toString()}
          card={h[i] ? h[i] : undefined}
          small={!!p}
        />
      );
    }

    return components;
  };

  const getHandTypeString = () => {
    if (!self?.hand || !gameState?.flop) return "";
    if ([...self.hand, ...gameState.flop].length === 0) return "";
    const h = getHandType(self, gameState.flop);
    return handTypeToString(h);
  };

  const handleCheck = () => {
    check(userID.current);
  };

  const canCheck = () => {
    if (
      gameState?.gameState === GameState.GAME_END ||
      gameState?.gameState === GameState.ROUND_END
    )
      return false;
    if (!self) return false;
    if (self.state === PlayerState.FOLDED) return false;
    if (!yourTurn) return false;
    const wagerArr = gameState?.players.map((el) => el.wager) ?? [];
    if (self.wager >= Math.max(...wagerArr)) return true;
    return false;
  };

  const canFold = () => {
    if (
      gameState?.gameState === GameState.GAME_END ||
      gameState?.gameState === GameState.ROUND_END
    )
      return false;
    if (!self) return false;
    if (!yourTurn) return false;
    return true;
  };

  const handleFold = () => {
    fold(userID.current);
  };

  const renderActions = (): ReactNode => {
    const items: { children: ReactNode; color?: string }[] = [];
    const actions = gameState?.actions ?? [];
    for (let i = 0; i < actions.length; i++) {
      items.push({
        color: actions[i]?.color?.toString() ?? ActionColour.DEFAULT,
        children: <Typography.Text>{actions[i].action}</Typography.Text>,
      });
    }

    return <Timeline reverse items={items} />;
  };

  return (
    <div id="game-board-container">
      <div id="players-container">
        <Space>{getPlayers()}</Space>
      </div>
      <CommunityCards gameState={gameState} userID={userID.current} />
      <div id="action-container">
        <div id="timeline-container">{renderActions()}</div>
        <Typography.Text italic type="secondary">
          Game Activity
        </Typography.Text>
      </div>

      <div id="your-info">
        <div id="your-actions">
          <div id="buttons">
            <Popover
              title="Enter Raise Amount"
              trigger="click"
              content={raisePopupContent}
            >
              <Button
                disabled={
                  !connected ||
                  !yourTurn ||
                  gameState?.gameState === GameState.GAME_END ||
                  gameState?.gameState === GameState.ROUND_END
                }
              >
                RAISE
              </Button>
            </Popover>
            <Button disabled={!connected || !canCheck()} onClick={handleCheck}>
              CHECK
            </Button>
            <Button disabled={!connected || !canFold()} onClick={handleFold}>
              FOLD
            </Button>
          </div>
          <Space size="large">
            <Typography.Text>Your Chips: {self?.chips ?? 0}</Typography.Text>
            <Typography.Text>
              Your Current Wager: {self?.wager ?? 0}
            </Typography.Text>
          </Space>
        </div>
        <div id="your-hand-container">
          <div id="your-hand">{renderHand()}</div>
          <Typography.Text italic type="secondary">
            Your Hand{" "}
            {getHandTypeString() ? "(" + getHandTypeString() + ")" : ""}
          </Typography.Text>
        </div>
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
        <div>
          <FloatButton.Group>
            <FloatButton
              icon={
                <img src={Info} style={{ transform: "translateX(-3px)" }} />
              }
              type={theme === Theme.DARK ? "default" : "primary"}
              tooltip={{
                overlay: (
                  <>
                    <Typography.Title level={4} style={{marginTop: "0px"}}>
                      Game Configuration
                    </Typography.Title>
                    <GameInfo gameConfig={gameConfig} />
                  </>
                ),
                color: theme === Theme.DARK ? "#262626" : "#f1f1f1ff",
              }}
            />
            <ThemeToggle />
          </FloatButton.Group>
        </div>
      </div>
    </div>
  );
};
