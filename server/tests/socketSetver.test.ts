import { describe, test, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import Client from 'socket.io-client';
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
    await new Promise((resolve) => clientSocket.on('connect', resolve));
  });

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  test('should authenticate user', async () => {
    const username = 'testUser';

    clientSocket.emit('authenticate', username);

    const authenticatedUser = await new Promise((resolve) => {
      clientSocket.on('authenticated', (user) => {
        resolve(user);
      });
    });

    expect(authenticatedUser).toEqual({
      id: clientSocket.id,
      username: 'testUser',
    });
  });
});