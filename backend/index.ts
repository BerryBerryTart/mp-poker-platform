import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { AuthType, PlaceBetType } from "../utils/types";
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

function sendGameStateToAll() {
  for (let [_, s] of io.of("/").sockets) {
    s.emit(
      SocketEvent.SEND_GAME_STATE,
      game.serialiseGame(s.handshake.auth.userID)
    );
  }
}
function sendGameStateToAdmin() {
  io.of("/admin").emit(
    SocketEvent.ADMIN_SEND_GAME_STATE,
    game.serialiseGame("", true)
  );
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
    game.placeBet(payload.userID, payload.bet);
    sendGameStateToAll();
  });

  socket.on("disconnect", () => {
    game.removePlayer(auth.userID);
    console.log(auth.userName + " left");

    //notify rest of disconnect
    sendGameStateToAll();

    //Send to Admin too
    sendGameStateToAdmin();
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
    sendGameStateToAdmin();
  });
});

server.listen(4000, () => console.log("Server started on port 4000"));
