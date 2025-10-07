import { createContext, useRef, useState, type PropsWithChildren } from "react";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io";
import { SocketEvent } from "../../utils/enums";
import { Player, SerialisedGame } from "../../utils/types";

export interface GameContextType {
  state: {
    connected: boolean;
    gameState: SerialisedGame | undefined;
    self: Player | undefined;
  };
  actions: {
    connect: (userName: string | undefined, userID: string) => void;
    disconnect: () => void;
  };
}

export const GameContext = createContext({});

export const GameProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<SerialisedGame | undefined>();
  const [self, setSelf] = useState<Player | undefined>();

  const sock = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

  const connect = (userName: string | undefined, userID: string) => {
    if (sock.current) return;
    const socket = io("ws://localhost:4000", {
      auth: { userID: userID, userName: userName ?? "" },
    });

    socket.on(SocketEvent.CLIENT_CONNECT, () => {
      socket.on(SocketEvent.SEND_GAME_STATE, (payload: SerialisedGame) => {
        setGameState(payload);
        const you = payload.players.find((el) => el.userID === userID);
        setSelf(you);
      });
    });

    setConnected(true);
    sock.current = socket;
  };

  const disconnect = () => {
    setConnected(false);
    setGameState(undefined);
    sock.current?.disconnect();
    sock.current = null;
  };

  const value = {
    state: { connected, gameState, self },
    actions: { connect, disconnect },
  } as GameContextType;
  return <GameContext value={value}>{children}</GameContext>;
};
