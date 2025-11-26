import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

// Socket event handlers
export const socketEvents = {
  joinRoom: (socket: Socket, chatRoomId: string) => {
    socket.emit('join:room', { chatRoomId });
  },
  leaveRoom: (socket: Socket, chatRoomId: string) => {
    socket.emit('leave:room', { chatRoomId });
  },
  sendMessage: (socket: Socket, chatRoomId: string, content: string) => {
    socket.emit('send:message', { chatRoomId, content });
  },
  startTyping: (socket: Socket, chatRoomId: string) => {
    socket.emit('typing:start', { chatRoomId });
  },
  stopTyping: (socket: Socket, chatRoomId: string) => {
    socket.emit('typing:stop', { chatRoomId });
  },
  markAsRead: (socket: Socket, messageId: string, chatRoomId: string) => {
    socket.emit('message:read', { messageId, chatRoomId });
  },
  onNewMessage: (socket: Socket, callback: (data: { message: Message }) => void) => {
    socket.on('new:message', callback);
  },
  onJoinedRoom: (socket: Socket, callback: (data: { chatRoomId: string }) => void) => {
    socket.on('joined:room', callback);
  },
  onUserTyping: (socket: Socket, callback: (data: { userId: string; chatRoomId: string; isTyping: boolean }) => void) => {
    socket.on('user:typing', callback);
  },
  onMessageRead: (socket: Socket, callback: (data: { messageId: string; chatRoomId: string }) => void) => {
    socket.on('message:read', callback);
  },
  onNotification: (socket: Socket, callback: (data: { type: string; chatRoomId: string; message: string }) => void) => {
    socket.on('notification', callback);
  },
  onError: (socket: Socket, callback: (data: { message: string }) => void) => {
    socket.on('error', callback);
  },
  onUserOnline: (socket: Socket, callback: (data: { userId: string }) => void) => {
    socket.on('user:online', callback);
  },
  onUserOffline: (socket: Socket, callback: (data: { userId: string }) => void) => {
    socket.on('user:offline', callback);
  },
  off: (socket: Socket, event: string) => {
    socket.off(event);
  },
};

