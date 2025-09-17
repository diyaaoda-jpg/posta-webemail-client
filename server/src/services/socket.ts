import { Server } from 'socket.io';

export const setupEmailSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join user-specific room for email updates
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Leave user room
    socket.on('leave-user-room', (userId: string) => {
      socket.leave(`user-${userId}`);
      console.log(`User ${userId} left their room`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Function to send real-time email updates
  const sendEmailUpdate = (userId: string, type: string, data: any) => {
    io.to(`user-${userId}`).emit('email-update', { type, data });
  };

  const sendNewEmailNotification = (userId: string, email: any) => {
    io.to(`user-${userId}`).emit('new-email', email);
  };

  return {
    sendEmailUpdate,
    sendNewEmailNotification
  };
};