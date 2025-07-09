
import { io as clientIO, Socket } from 'socket.io-client';

let socket: Socket;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = clientIO('http://localhost:8000', {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
};
