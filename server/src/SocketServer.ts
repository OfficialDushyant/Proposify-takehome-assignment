// src/SocketServer.ts
import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

interface User {
  id: string;
  username: string;
}

interface Note {
  content: string;
  lastEditedBy: string;
}

let note: Note = {
  content: '',
  lastEditedBy: '',
};

const users: Record<string, User> = {};

export function initializeSocket(server: HTTPServer) {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', (username: string) => {
      users[socket.id] = { id: socket.id, username };
      socket.emit('authenticated', users[socket.id]);
      socket.broadcast.emit('userJoined', users[socket.id]);
      socket.emit('noteUpdate', note);
    });

    // Handle note editing
    socket.on('editNote', (data: { content: string }) => {
      note.content = data.content;
      note.lastEditedBy = users[socket.id]?.username || 'Unknown';
      socket.broadcast.emit('noteUpdate', note);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      socket.broadcast.emit('userLeft', users[socket.id]);
      delete users[socket.id];
    });
  });
}