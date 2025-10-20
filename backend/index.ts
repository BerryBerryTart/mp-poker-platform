import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import {
  AuthType,
  GameConfigType,
  PlaceBetType,
  PlayerActionType,
} from "../utils/types";
import { GameManager } from "../utils/utils";
import { GameState, SocketEvent } from "../utils/enums";

const app = express();
const server = createServer(app); // http

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(express.json());
app.use(cors());

const game = new GameManager();

interface GameSocket extends Socket {
  userID?: string;
}

function broadcastGame(adminOnly = false) {
  if (!adminOnly) {
    for (let [_, s] of io.of("/").sockets) {
      s.emit(
        SocketEvent.SEND_GAME_STATE,
        game.serialiseGame(s.handshake.auth.userID)
      );
    }
  }
  io.of("/admin").emit(
    SocketEvent.ADMIN_SEND_GAME_STATE,
    game.serialiseGame("", true)
  );
}

function sendGameStateToAll(adminOnly = false) {
  // rebroadcast with next next round game state
  if (game.gameState === GameState.ROUND_END && game.nextRoundDelay) {
    setTimeout(() => {
      console.log("STARTING NEXT ROUND");
      game.setupGame(true);
      broadcastGame(adminOnly);
    }, game.nextRoundDelay * 1000);
  }
  broadcastGame(adminOnly);
}

function sendGameConfigToAll() {
  for (let [_, s] of io.of("/").sockets) {
    s.emit(SocketEvent.SEND_GAME_CONFIG, game.serialiseGameDetails());
  }
  io.of("/admin").emit(
    SocketEvent.SEND_GAME_CONFIG,
    game.serialiseGameDetails()
  );
}

function getSocketID(userID: string): string {
  for (let [id, s] of io.of("/").sockets) {
    let sock = s as GameSocket;
    if (sock.userID === userID) {
      return id;
    }
  }
  //this shouldn't ever really happen.
  throw new Error("Socket ID not found");
}

function sendError(socket: GameSocket, error: unknown) {
  if (typeof error === "string")
    socket.emit(SocketEvent.ERROR, error.toString());
  else if (error instanceof Error)
    socket.emit(SocketEvent.ERROR, error.message);
}

io.on(SocketEvent.NEW_CONNECTION, (socket: GameSocket) => {
  const auth = socket.handshake.auth as AuthType;

  if (!auth.userName) {
    auth.userName = `User ${game.players.length + 1}`;
  }
  game.addPlayer(auth.userName, auth.userID);
  console.log(auth.userName + " joined");

  //set socket IDs for easy identification later
  socket.userID = auth.userID;

  sendGameStateToAll();
  sendGameConfigToAll();

  socket.on(SocketEvent.PLACE_BET, (payload: PlaceBetType) => {
    try {
      game.placeBet(payload.userID, payload.bet);
      sendGameStateToAll();
    } catch (error) {
      console.log(error);
      sendError(socket, error);
    }
  });

  socket.on(SocketEvent.CHECK, (payload: PlayerActionType) => {
    try {
      game.check(payload.userID);
      sendGameStateToAll();
    } catch (error) {
      console.log(error);
      sendError(socket, error);
    }
  });

  socket.on(SocketEvent.FOLD, (payload: PlayerActionType) => {
    try {
      game.fold(payload.userID);
      sendGameStateToAll();
    } catch (error: unknown) {
      console.log(error);
      sendError(socket, error);
    }
  });

  socket.on("disconnect", () => {
    game.removePlayer(auth.userID);
    console.log(auth.userName + " left");

    //notify rest of disconnect
    sendGameStateToAll();
  });
});

io.of("/admin").on(SocketEvent.NEW_CONNECTION, (socket: GameSocket) => {
  socket.emit(SocketEvent.ADMIN_SEND_GAME_STATE, game.serialiseGame("", true));
  socket.emit(SocketEvent.SEND_GAME_CONFIG, game.serialiseGameDetails());
  socket.on(SocketEvent.ADMIN_START_GAME, () => {
    //deal out cards and broadcast
    console.log("STARTING GAME");
    try {
      game.setupGame();
      sendGameStateToAll();
    } catch (error: unknown) {
      console.log(error);
      sendError(socket, error);
    }
  });
  socket.on(SocketEvent.ADMIN_NEXT_ROUND, () => {
    try {
      game.setupGame(true);
      sendGameStateToAll();
    } catch (error: unknown) {
      console.log(error);
      sendError(socket, error);
    }
  });
  socket.on(SocketEvent.ADMIN_RESET_GAME, () => {
    console.log("RESET GAME");
    game.reset();
    sendGameStateToAll();
  });
  socket.on(
    SocketEvent.ADMIN_DISCONNECT_USER,
    (payload: { userID: string }) => {
      const { userID } = payload;
      try {
        const u = game.playerValidation(userID);
        const id = getSocketID(userID);
        io.of("/").in(id).disconnectSockets(true);
        console.log(u.userName + " removed by Admin");
      } catch (error: unknown) {
        console.log(error);
        sendError(socket, error);
      }
    }
  );
  socket.on(SocketEvent.ADMIN_UPDATE_GAME_CONFIG, (payload: GameConfigType) => {
    game.updateGameDetails(payload);
    sendGameConfigToAll();
  });
  socket.on(SocketEvent.REFRESH_DATA, () => {
    console.log("REFRESH DATA REQUEST");
    sendGameStateToAll(true);
  });
});

server.listen(4000, () => console.log("Server started on port 4000"));
