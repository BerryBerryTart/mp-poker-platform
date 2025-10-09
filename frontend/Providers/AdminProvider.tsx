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
  };
}

export const AdminContext = createContext({});

export const AdminProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [adminGameState, setAdminGameState] = useState<
    SerialisedGame | undefined
  >();
  const [gameConfig, setGameConfig] = useState<GameConfigType | undefined>();
  const [api, _] = notification.useNotification();
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
    const socket = io("ws://localhost:4000/admin");

    socket.on(SocketEvent.CLIENT_DISCONNECT, () => {
      setConnected(false);
    });
    socket.on(SocketEvent.ADMIN_SEND_GAME_STATE, (payload: SerialisedGame) => {
      setAdminGameState(payload);
    });
    socket.on(SocketEvent.ADMIN_SEND_GAME_CONFIG, (payload: GameConfigType) => {
      setGameConfig(payload);
    });
    sock.current = socket;
  };

  const startGame = () => {
    if (!sock.current) {
      api.error({
        message: "Socket Error!",
        description: "Failed to start game.",
      });
      return;
    }
    sock.current.emit(SocketEvent.ADMIN_START_GAME);
  };

  const resetGame = () => {
    if (!sock.current) {
      api.error({
        message: "Socket Error!",
        description: "Failed to reset game.",
      });
      return;
    }
    sock.current.emit(SocketEvent.ADMIN_RESET_GAME);
  };

  const value = {
    state: { adminGameState, gameConfig, connected },
    actions: { adminConnect, startGame, resetGame },
  } as AdminContextType;
  return <AdminContext value={value}>{children}</AdminContext>;
};
