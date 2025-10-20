import { ReactNode, useContext, useEffect, useState } from "react";
import { AdminContext, AdminContextType } from "../Providers/AdminProvider";
import {
  Button,
  Card,
  Form,
  InputNumber,
  Modal,
  Popover,
  Radio,
  Space,
  Typography,
} from "../antdES";
import { GameConfigType, Player } from "../../utils/types";
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
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { GameInfo } from "../GameInfo/GameInfo";

export const Admin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const adminContext = useContext(AdminContext) as AdminContextType;
  const { adminGameState, gameConfig } = adminContext.state;
  const {
    adminConnect,
    startGame,
    resetGame,
    refresh,
    nextRound,
    disconnectUser,
    updateGameConfig,
  } = adminContext.actions;
  const [form] = Form.useForm();

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

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onCreate = (values: GameConfigType) => {
    updateGameConfig(values);
    setIsModalOpen(false);
  };

  return (
    <div id="admin-container">
      <Modal
        title="Update Game Configuration"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        destroyOnHidden
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Create"
        cancelText="Cancel"
        okButtonProps={{ autoFocus: true, htmlType: "submit" }}
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            name="form_in_modal"
            initialValues={gameConfig}
            clearOnDestroy
            onFinish={(values) => onCreate(values)}
          >
            {dom}
          </Form>
        )}
      >
        <Form.Item name="enableTieBreaker" label="Tie Breaker Enabled">
          <Radio.Group>
            <Radio value={true}>True</Radio>
            <Radio value={false}>False</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="intialHandAmt" label="Inital Hand Amount">
          <InputNumber />
        </Form.Item>
        <Form.Item name="minBuyIn" label="Minumum Buy In">
          <InputNumber />
        </Form.Item>
        <Form.Item name="nextRoundDelay" label="Next Round Delay (seconds)">
          <InputNumber min={0} max={10} />
        </Form.Item>
        <Form.Item name="manualNextRound" label="Manual Start Next Round">
          <Radio.Group>
            <Radio value={true}>True</Radio>
            <Radio value={false}>False</Radio>
          </Radio.Group>
        </Form.Item>
      </Modal>
      <div id="players-container">
        <Space>{getPlayers()}</Space>
      </div>
      <div id="game-container">
        <CommunityCards gameState={adminGameState} />
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
      <div id="footer">
        <div id="info">
          <Space direction="vertical">
            <GameInfo gameConfig={gameConfig} />
            <Button onClick={showModal}>CONFIG GAME</Button>
          </Space>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};
