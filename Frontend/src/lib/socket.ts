import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://127.0.0.1:5000';
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.IO] Connected to VOLUNOVA Real-Time Engine:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚡ [Socket.IO] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚡ [Socket.IO] Connection error:', err.message);
    });
  }

  return socket;
}

export function subscribeToUserNotifications(userId: string, onNewNotification: (notif: any) => void) {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  s.emit('join_user', userId);

  const handler = (data: any) => {
    if (data && data.notification) {
      onNewNotification(data.notification);
    }
  };

  s.on('notification:new', handler);

  return () => {
    s.off('notification:new', handler);
    s.emit('leave_user', userId);
  };
}

export function subscribeToMissionOps(missionId: string, onSlotUpdated: (data: any) => void) {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  s.emit('join_mission', missionId);

  const handler = (data: any) => {
    onSlotUpdated(data);
  };

  s.on('slot_updated', handler);

  return () => {
    s.off('slot_updated', handler);
    s.emit('leave_mission', missionId);
  };
}
