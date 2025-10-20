import {
  createContext,
  PropsWithChildren,
  useRef,
  useState,
  useEffect,
} from "react";
import { DefaultEventsMap } from "socket.io";
import { io, Socket } from "socket.io-client";
import { SocketEvent } from "../../utils/enums";
import { GameConfigType, SerialisedGame } from "../../utils/types";
import { notification } from "../antdES";

export interface AdminContextType {
  state: {
    adminGameState: SerialisedGame | undefined;
    gameConfig: GameConfigType | undefined;
    connected: boolean;
  };
  actions: {
    adminConnect: () => void;
    startGame: () => void;
    resetGame: () => void;
    refresh: () => void;
    nextRound: () => void;
    disconnectUser: (userID: string) => void;
    updateGameConfig: (config: GameConfigType) => void;
  };
}

export const AdminContext = createContext({});

export const AdminProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [adminGameState, setAdminGameState] = useState<
    SerialisedGame | undefined
  >();
  const [gameConfig, setGameConfig] = useState<GameConfigType | undefined>();
  const [api, contextHolder] = notification.useNotification();
  const [connected, setConnected] = useState(false);
  const sock = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

  useEffect(() => {
    if (sock.current) {
      setConnected(true);
    } else {
      setConnected(false);
    }
  }, [sock.current]);

  const adminConnect = () => {
    if (sock.current) return;
    const socket = io(import.meta.env.VITE_WEBSOCKET_URL + "/admin");

    socket.on(SocketEvent.CLIENT_DISCONNECT, () => {
      setConnected(false);
    });
    socket.on(SocketEvent.ADMIN_SEND_GAME_STATE, (payload: SerialisedGame) => {
      setAdminGameState(payload);
    });
    socket.on(SocketEvent.SEND_GAME_CONFIG, (payload: GameConfigType) => {
      setGameConfig(payload);
    });
    socket.on(SocketEvent.ERROR, (payload: string) => {
      api.error({
        description: payload,
        message: "Error!",
      });
    });
    sock.current = socket;
  };

  const sockCheck = () => {
    if (!sock.current) {
      api.error({
        message: "Socket Error!",
        description: "No Connection.",
      });
      return false;
    }
    return true;
  };

  const startGame = () => {
    if (sockCheck()) sock.current!.emit(SocketEvent.ADMIN_START_GAME);
  };

  const resetGame = () => {
    if (sockCheck()) sock.current!.emit(SocketEvent.ADMIN_RESET_GAME);
  };

  const refresh = () => {
    if (sockCheck()) sock.current!.emit(SocketEvent.REFRESH_DATA);
  };

  const nextRound = () => {
    if (sockCheck()) sock.current!.emit(SocketEvent.ADMIN_NEXT_ROUND);
  };

  const disconnectUser = (userID: string) => {
    if (sockCheck())
      sock.current!.emit(SocketEvent.ADMIN_DISCONNECT_USER, { userID });
  };

  const updateGameConfig = (config: GameConfigType) => {
    if (sockCheck())
      sock.current!.emit(SocketEvent.ADMIN_UPDATE_GAME_CONFIG, config);
  };

  const value = {
    state: { adminGameState, gameConfig, connected },
    actions: {
      adminConnect,
      startGame,
      resetGame,
      refresh,
      nextRound,
      disconnectUser,
      updateGameConfig,
    },
  } as AdminContextType;
  return (
    <AdminContext value={value}>
      {contextHolder}
      {children}
    </AdminContext>
  );
};
