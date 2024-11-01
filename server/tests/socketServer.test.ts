import { describe, test, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
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

  test('should create and edit a note', (done) => {
    clientSocket.emit('authenticate', 'testUser');

    clientSocket.on('authenticated', () => {
      clientSocket.emit('createNote', 'Test Note');

      clientSocket.on('noteCreated', (note) => {
        expect(note).toHaveProperty('id');
        const noteId = note.id;

        clientSocket.emit('joinNote', noteId);

        clientSocket.on('noteContent', (note) => {
          expect(note.id).toBe(noteId);

          clientSocket.emit('editNote', {
            noteId,
            content: 'Updated Content',
          });

          clientSocket.on('noteUpdated', (updatedNote) => {
            expect(updatedNote.content).toBe('Updated Content');
            done;
          });
        });
      });
    });
  });
});