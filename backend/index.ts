import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { AuthType } from "../utils/types";
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

io.on(SocketEvent.NEW_CONNECTION, (socket) => {
  const auth = socket.handshake.auth as AuthType;

  if (!auth.userName) {
    auth.userName = `User ${game.players.length + 1}`;
  }
  game.addPlayer(auth.userName, auth.userID);
  console.log(auth.userName + " joined");

  for (let [_, s] of io.of("/").sockets) {
    s.emit(
      SocketEvent.SEND_GAME_STATE,
      game.serialiseGame(s.handshake.auth.userID)
    );
  }

  socket.on("disconnect", () => {
    game.removePlayer(auth.userID);
    console.log(auth.userName + " left");

    //notify rest of disconnect
    for (let [_, s] of io.of("/").sockets) {
      s.emit(
        SocketEvent.SEND_GAME_STATE,
        game.serialiseGame(s.handshake.auth.userID)
      );
    }
  });
});

server.listen(4000, () => console.log("Server started on port 4000"));
