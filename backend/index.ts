import express from "express";
import { createServer } from "http";
import { DefaultEventsMap, Server, Socket } from "socket.io";
import cors from "cors";
import { AuthType, PlaceBetType, PlayerActionType } from "../utils/types";
import { GameManager } from "../utils/utils";
import { SocketEvent } from "../utils/enums";

const app = express();
const server = createServer(app); // http

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(express.json());
app.use(cors());

const game = new GameManager();

function sendGameStateToAll(adminOnly = false) {
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

function sendError(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  error: unknown
) {
  if (typeof error === "string")
    socket.emit(SocketEvent.ERROR, error.toString());
  else if (error instanceof Error)
    socket.emit(SocketEvent.ERROR, error.message);
}

io.on(SocketEvent.NEW_CONNECTION, (socket) => {
  const auth = socket.handshake.auth as AuthType;

  if (!auth.userName) {
    auth.userName = `User ${game.players.length + 1}`;
  }
  game.addPlayer(auth.userName, auth.userID);
  console.log(auth.userName + " joined");

  sendGameStateToAll();

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

io.of("/admin").on(SocketEvent.NEW_CONNECTION, (socket) => {
  socket.emit(SocketEvent.ADMIN_SEND_GAME_STATE, game.serialiseGame("", true));
  socket.emit(SocketEvent.ADMIN_SEND_GAME_CONFIG, game.serialiseGameDetails());
  socket.on(SocketEvent.ADMIN_START_GAME, () => {
    //deal out cards and broadcast
    console.log("STARTING GAME");
    game.setupGame();
    sendGameStateToAll();
  });
  socket.on(SocketEvent.ADMIN_RESET_GAME, () => {
    console.log("RESET GAME");
    game.reset();
    sendGameStateToAll();
  });
  socket.on(SocketEvent.REFRESH_DATA, () => {
    console.log("REFRESH DATA REQUEST");
    sendGameStateToAll(true);
  });
});

server.listen(4000, () => console.log("Server started on port 4000"));
