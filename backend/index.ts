import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { v6 } from "uuid";

const app = express();
const server = createServer(app); // http

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(express.json());
app.use(cors());
