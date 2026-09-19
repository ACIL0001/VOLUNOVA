import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Permissive to allow web localhost, mobile Expo, and LAN IPs
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    // Join user-specific private room for real-time notifications
    socket.on('join_user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('user:join', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('leave_user', (userId: string) => {
      if (userId) {
        socket.leave(`user:${userId}`);
      }
    });

    socket.on('user:leave', (userId: string) => {
      if (userId) {
        socket.leave(`user:${userId}`);
      }
    });

    // Join mission-specific live operations room
    socket.on('join_mission', (missionId: string) => {
      if (missionId) {
        socket.join(`mission:${missionId}`);
      }
    });

    socket.on('leave_mission', (missionId: string) => {
      if (missionId) {
        socket.leave(`mission:${missionId}`);
      }
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('[Socket.IO] Socket server not initialized yet');
  }
  return io;
}

export function emitToUser(userId: string | object, event: string, payload: any) {
  if (!io) return;
  const idStr = userId.toString();
  io.to(`user:${idStr}`).emit(event, payload);
}

export function emitToMission(missionId: string | object, event: string, payload: any) {
  if (!io) return;
  const idStr = missionId.toString();
  io.to(`mission:${idStr}`).emit(event, payload);
}
