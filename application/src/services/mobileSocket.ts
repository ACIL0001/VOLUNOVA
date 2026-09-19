import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '../config/apiConfig';

let socket: Socket | null = null;

export function getMobileSocket(): Socket {
  if (!socket) {
    const socketUrl = getSocketUrl();
    console.log('⚡ [MobileSocket] Connecting to:', socketUrl);

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1500,
    });

    socket.on('connect', () => {
      console.log('⚡ [MobileSocket] Connected to VOLUNOVA Real-Time Engine, Socket ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚡ [MobileSocket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚡ [MobileSocket] Connection error:', err.message);
    });
  }

  return socket;
}

export function subscribeVolunteerNotifications(
  userId: string,
  onNewNotification: (notif: any) => void
): () => void {
  const s = getMobileSocket();
  if (!s.connected) {
    s.connect();
  }

  s.emit('join_user', userId);
  console.log('⚡ [MobileSocket] Joined user room:', `user:${userId}`);

  const handler = (data: any) => {
    if (data && data.notification) {
      console.log('⚡ [MobileSocket] Real-time notification received:', data.notification.type);
      onNewNotification(data.notification);
    }
  };

  s.on('notification:new', handler);

  return () => {
    s.off('notification:new', handler);
    s.emit('leave_user', userId);
  };
}
