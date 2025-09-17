"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEmailSocket = void 0;
const setupEmailSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        // Join user-specific room for email updates
        socket.on('join-user-room', (userId) => {
            socket.join(`user-${userId}`);
            console.log(`User ${userId} joined their room`);
        });
        // Leave user room
        socket.on('leave-user-room', (userId) => {
            socket.leave(`user-${userId}`);
            console.log(`User ${userId} left their room`);
        });
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
    // Function to send real-time email updates
    const sendEmailUpdate = (userId, type, data) => {
        io.to(`user-${userId}`).emit('email-update', { type, data });
    };
    const sendNewEmailNotification = (userId, email) => {
        io.to(`user-${userId}`).emit('new-email', email);
    };
    return {
        sendEmailUpdate,
        sendNewEmailNotification
    };
};
exports.setupEmailSocket = setupEmailSocket;
//# sourceMappingURL=socket.js.map