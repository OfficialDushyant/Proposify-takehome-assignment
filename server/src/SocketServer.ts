// src/SocketServer.ts
import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

interface User {
  id: string;
  username: string;
}

interface Note {
  id: string;
  label: string;
  content: any;
  lastEditedBy: string;
}

let notes: Record<string, Note> = {}

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
      socket.emit('noteList', Object.values(notes));
      socket.broadcast.emit('userJoined', users[socket.id]);
    });

    // Handle creating a new note
    socket.on('createNote', (noteTitle: string) => {
      const noteId = generateUniqueId();
      const newNote: Note = {
        id: noteId,
        label:noteTitle,
        content: '',
        lastEditedBy: '',
      };
      notes[noteId] = newNote;

      // Notify all users about the new note
      io.emit('noteCreated', newNote);
    });

    // Handle deleting a note
    socket.on('deleteNote', (noteId: string) => {
      delete notes[noteId];

      // Notify all users about the deletion
      io.emit('noteDeleted', noteId);
    });

    // Handle editing a note
    socket.on('editNote', (data: { noteId: string; content: string;}) => {
      const { noteId, content } = data;
      const note = notes[noteId];
      if (note) {
        note.content = content;
        note.lastEditedBy = users[socket.id]?.username || 'Unknown';

        // Broadcast the update to other users editing the same note
        socket.broadcast.to(noteId).emit('noteUpdated', note);
      }
    });

     // Handle joining a note's room
     socket.on('joinNote', (noteId: string) => {
      socket.join(noteId);

      // Send the current content of the note
      const note = notes[noteId];
      if (note) {
        socket.emit('noteContent', note);
      }
    });

    // Handle leaving a note's room
    socket.on('leaveNote', (noteId: string) => {
      socket.leave(noteId);
    });


    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      socket.broadcast.emit('userLeft', users[socket.id]);
      delete users[socket.id];
    });
  });
}

// Utility function to generate unique IDs
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}