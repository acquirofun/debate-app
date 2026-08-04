import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export const dynamic = 'force-dynamic';

let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  if (!io) {
    const httpServer: HTTPServer = req as any;
    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
        
        // Notify others in the room
        socket.to(roomId).emit('user-connected', socket.id);
      });

      socket.on('signal', (data: { roomId: string; signal: any; userId: string }) => {
        socket.to(data.roomId).emit('signal', {
          signal: data.signal,
          userId: data.userId,
        });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        socket.broadcast.emit('user-disconnected', socket.id);
      });
    });
  }

  return new Response('Socket.IO server running', { status: 200 });
}