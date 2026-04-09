// src/lib/socket.js
import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const socket = io(URL, {
  withCredentials: true,
  transports: ['polling', 'websocket'], // Start with polling, upgrade to websocket
  reconnectionDelay: 3000,              // Wait 3s before first reconnect attempt
  reconnectionDelayMax: 15000,          // Max 15s between retries
  reconnectionAttempts: 10,             // Don't retry forever
  timeout: 20000,                       // Connection timeout (for cold starts)
});

export default socket;
