import { Server } from 'socket.io';
export declare const setupEmailSocket: (io: Server) => {
    sendEmailUpdate: (userId: string, type: string, data: any) => void;
    sendNewEmailNotification: (userId: string, email: any) => void;
};
//# sourceMappingURL=socket.d.ts.map