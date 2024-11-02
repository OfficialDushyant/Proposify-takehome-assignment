import { describe,it, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Client, { Socket } from 'socket.io-client';
import { initializeSocket } from '../src/SocketServer';

describe('Socket Server', () => {
  let ioServer: Server;
  let httpServer;
  let clientSocket: Socket;

  beforeAll(() => {
    httpServer = createServer();
    ioServer = new Server(httpServer);
    initializeSocket(httpServer);
    httpServer.listen();
  });

  afterAll(() => {
    ioServer.close();
    httpServer.close();
  });

  beforeEach(async () => {
    clientSocket = Client(`http://localhost:${(httpServer.address() as any).port}`);
    await new Promise((resolve: any) => clientSocket.on('connect', resolve));
  });

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  it('should allow a client to connect and authenticate', (done) => {
    const username = 'TestUser';

    clientSocket.emit('authenticate', username);

    clientSocket.on('authenticated', (userData) => {
      expect(userData).toHaveProperty('id');
      expect(userData).toHaveProperty('username', username);
      done;
    });
  });

  it('should create a new note and broadcast it', (done) => {
    const noteTitle = 'Test Note';

    // Listen for 'noteCreated' event
    clientSocket.on('noteCreated', (note) => {
      expect(note).toHaveProperty('id');
      expect(note).toHaveProperty('content');
      expect(note).toHaveProperty('lastEditedBy', '');
      done;
    });

    // Emit 'createNote' event
    clientSocket.emit('createNote', noteTitle);
  });

  it('should edit a note and broadcast the update', (done) => {
    const delta = { ops: [{ insert: 'Hello, world!' }] };

    clientSocket.once('noteCreated', (note) => {
      // Join the note
      clientSocket.emit('joinNote', note.id);

      // Listen for 'noteUpdated' event
      clientSocket.on('noteUpdated', (data) => {
        expect(data).toHaveProperty('noteId', note.id);
        expect(data).toHaveProperty('delta');
        expect(data.delta).toEqual(delta);
        done;
      });

      // Emit 'editNote' event
      clientSocket.emit('editNote', { noteId: note.id, delta });
    });

    // Emit 'createNote' event to create a new note
    clientSocket.emit('createNote', 'Note to Edit');
  });

  it('should delete a note and broadcast the deletion', (done) => {
    clientSocket.once('noteCreated', (note) => {
      // Listen for 'noteDeleted' event
      clientSocket.on('noteDeleted', (noteId) => {
        expect(noteId).toBe(note.id);
        done;
      });

      // Emit 'deleteNote' event
      clientSocket.emit('deleteNote', note.id);
    });

    // Emit 'createNote' event to create a new note
    clientSocket.emit('createNote', 'Note to Delete');
  });
});