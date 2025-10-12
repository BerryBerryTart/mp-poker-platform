import {
  createContext,
  useRef,
  useState,
  type PropsWithChildren,
  useEffect,
} from "react";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io";
import { SocketEvent } from "../../utils/enums";
import {
  PlaceBetType,
  Player,
  PlayerActionType,
  SerialisedGame,
} from "../../utils/types";
import { notification } from "../antdES";

export interface GameContextType {
  state: {
    connected: boolean;
    gameState: SerialisedGame | undefined;
    self: Player | undefined;
  };
  actions: {
    connect: (userName: string | undefined, userID: string) => void;
    disconnect: () => void;
    placeBet: (userID: string, bet: number) => void;
    check: (userID: string) => void;
    fold: (userID: string) => void;
  };
}

export const GameContext = createContext({});

export const GameProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<SerialisedGame | undefined>();
  const [api, contextHolder] = notification.useNotification();

  const [self, setSelf] = useState<Player | undefined>();

  const sock = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

  const connect = (userName: string | undefined, userID: string) => {
    if (sock.current) return;
    const socket = io("ws://localhost:4000", {
      auth: { userID: userID, userName: userName ?? "" },
    });

    socket.on(SocketEvent.CLIENT_CONNECT, () => {});
    socket.on(SocketEvent.SEND_GAME_STATE, (payload: SerialisedGame) => {
      setGameState(payload);
      const you = payload.players.find((el) => el.userID === userID);
      setSelf(you);
    });
    socket.on(SocketEvent.ERROR, (payload: string) => {
      api.error({
        message: "Error!",
        description: payload,
      });
    });
    socket.on(SocketEvent.CLIENT_DISCONNECT, () => {
      setConnected(false);
      setGameState(undefined);
      setSelf(undefined);
      sock.current = null;
      api.error({
        message: "Error!",
        description: "Force Disconnect By Server",
      });
    });

    setConnected(true);
    sock.current = socket;
  };

  const placeBet = (userID: string, bet: number) => {
    if (!sock.current) return;
    const payload: PlaceBetType = { userID, bet };
    sock.current.emit(SocketEvent.PLACE_BET, payload);
  };

  const check = (userID: string) => {
    if (!sock.current) return;
    const payload: PlayerActionType = { userID };
    sock.current.emit(SocketEvent.CHECK, payload);
  };

  const fold = (userID: string) => {
    if (!sock.current) return;
    const payload: PlayerActionType = { userID };
    sock.current.emit(SocketEvent.FOLD, payload);
  };

  const disconnect = () => {
    setConnected(false);
    setGameState(undefined);
    setSelf(undefined);
    sock.current?.disconnect();
    sock.current = null;
  };

  const value = {
    state: { connected, gameState, self },
    actions: { connect, disconnect, placeBet, check, fold },
  } as GameContextType;
  return (
    <GameContext value={value}>
      {contextHolder}
      {children}
    </GameContext>
  );
};
