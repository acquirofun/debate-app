const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handler(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    path: '/socket.io/'
  });

  io.on('connection', (socket) => {
    console.log('✓ User connected:', socket.id);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`🏠 User ${socket.id} joined room ${roomId}`);
      
      // Check if there are other users in the room
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room && room.size > 1) {
        console.log(`👥 Room ${roomId} now has ${room.size} users`);
        // Notify the new user that there are others in the room
        socket.emit('room-users', Array.from(room).filter(id => id !== socket.id));
      } else {
        console.log(`👤 User ${socket.id} is first in room ${roomId}`);
      }
      
      // Always notify others in the room that a new user joined
      socket.to(roomId).emit('user-connected', socket.id);
    });

    socket.on('signal', (data) => {
      console.log('📡 Signal from', data.userId, 'in room', data.roomId);
      socket.to(data.roomId).emit('signal', {
        signal: data.signal,
        userId: data.userId,
      });
    });

    // Share motion with all users in the room
    socket.on('share-motion', (data) => {
      console.log('📜 Sharing motion in room:', data.roomId);
      socket.to(data.roomId).emit('motion-shared', data.motion);
    });

    // Share coin toss result with all users in the room
    socket.on('share-coin-toss', (data) => {
      console.log('🪙 Sharing coin toss in room:', data.roomId);
      socket.to(data.roomId).emit('coin-toss-shared', data);
    });

    // Notify users about turn changes
    socket.on('turn-change', (data) => {
      console.log('🔄 Turn change in room:', data.roomId);
      socket.to(data.roomId).emit('turn-changed', data);
    });

    socket.on('disconnect', () => {
      console.log('👋 User disconnected:', socket.id);
      socket.broadcast.emit('user-disconnected', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});