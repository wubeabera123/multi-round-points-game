// src/socket.ts
import { io } from "socket.io-client";

const socket = io("https://multi-round-points-game.onrender.com"); // backend URL

export default socket;
