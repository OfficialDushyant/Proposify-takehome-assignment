// src/index.ts
import express from 'express';
import http from 'http';
import cors from 'cors';
import { initializeSocket } from './SocketServer';

const app = express();
app.use(cors());

const server = http.createServer(app);

// Initialize Socket.io server
initializeSocket(server);

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});