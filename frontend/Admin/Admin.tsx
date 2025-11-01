import { ReactNode, useContext, useEffect, useState } from "react";
import { AdminContext, AdminContextType } from "../Providers/AdminProvider";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Radio,
  Row,
  Slider,
  Space,
  Typography,
} from "../antdES";
import { GameConfigType, Player } from "../../utils/types";
import { CardDisplay } from "../CardDisplay/CardDisplay";
import { GameState } from "../../utils/enums";
import { CommunityCards } from "../CommunityCards/CommunityCards";
import {
  flopSum,
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
  const [validForm, setValidForm] = useState(true);
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
        <CardDisplay
          small
          key={i.toString()}
          card={h[i] ? h[i] : ""}
          gameConfig={gameConfig}
        />
      );
    }

    return components;
  };

  const fetchHandString = (p: Player): string => {
    if (!adminGameState || !gameConfig) return "";
    return handTypeToString(
      getHandType(
        p.hand,
        adminGameState.flop ?? [],
        gameConfig.cardsPerSuit,
        gameConfig.handLimit
      ).type
    );
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
            <Typography.Text style={{ cursor: "default" }}>
              Wager: {p[i].wager}
            </Typography.Text>
            <Typography.Text style={{ cursor: "default" }}>
              {playerStateToString(p[i].state)}
            </Typography.Text>
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
    const vals = form.getFieldsValue() as GameConfigType;
    updateGameConfig(vals);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const getDrawPhaseNumberArray = (value: string): number[] => {
    const nums: number[] = [];

    const valueSplit = value.split(",");

    for (let i = 0; i < valueSplit.length; i++) {
      nums.push(Number.parseInt(valueSplit[i]));
    }

    return nums;
  };

  const validateDrawPhase = (value: string) => {
    const valueSplit = value.split(",");

    for (let i = 0; i < valueSplit.length; i++) {
      if (isNaN(Number.parseInt(valueSplit[i]))) {
        return false;
      }
      if (Number.parseInt(valueSplit[i]) < 0) {
        return false;
      }
    }
    return true;
  };

  const validateDrawPhasePromise = async (
    _: any,
    value: any
  ): Promise<void> => {
    if (!validateDrawPhase(value)) {
      return Promise.reject(new Error("Invalid Array."));
    }

    if (flopSum(getDrawPhaseNumberArray(value)) <= 0) {
      return Promise.reject(new Error("Phases must be at least 1."));
    }
    return Promise.resolve();
  };

  const validateForm = () => {
    const val = form.getFieldValue("drawPhases");
    setValidForm(validateDrawPhase(val));
  };

  const getModal = () => {
    return (
      <Modal
        title="Update Game Configuration"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        destroyOnHidden
        okButtonProps={{ autoFocus: true, htmlType: "submit" }}
        footer={
          <>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleOk} type="primary" disabled={!validForm}>
              Update Game
            </Button>
          </>
        }
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            name="form_in_modal"
            initialValues={gameConfig}
            clearOnDestroy
            onChange={validateForm}
          >
            {dom}
          </Form>
        )}
      >
        <Space size={"large"}>
          <Form.Item name="intialHandAmt" label="Inital Hand Amount">
            <InputNumber />
          </Form.Item>
          <Form.Item name="minBuyIn" label="Minumum Buy In">
            <InputNumber />
          </Form.Item>
        </Space>
        <Space size={"large"}>
          <Form.Item name="nextRoundDelay" label="Next Round Delay (seconds)">
            <InputNumber min={0} max={10} />
          </Form.Item>
          <Form.Item name="manualNextRound" label="Manual Start Next Round">
            <Radio.Group>
              <Radio value={true}>True</Radio>
              <Radio value={false}>False</Radio>
            </Radio.Group>
          </Form.Item>
        </Space>
        <Row>
          <Col span={20}>
            <Form.Item name="totalSuits" label="Total Suits">
              <Slider min={2} max={10} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="totalSuits" label=" ">
              <InputNumber min={2} max={10} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={20}>
            <Form.Item name="cardsPerSuit" label="Cards Per Suit">
              <Slider min={1} max={100} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="cardsPerSuit" label=" ">
              <InputNumber min={1} max={100} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="drawPhases"
          label="Draw Phases"
          rules={[{ validator: (_, val) => validateDrawPhasePromise(_, val) }]}
        >
          <Input.TextArea />
        </Form.Item>
      </Modal>
    );
  };

  return (
    <div id="admin-container">
      {getModal()}
      <div id="players-container">
        <Space align="start">{getPlayers()}</Space>
      </div>
      <div id="game-container">
        <CommunityCards gameState={adminGameState} gameConfig={gameConfig} />
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
