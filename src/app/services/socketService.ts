import io, { Socket } from "socket.io-client";

export interface CodeUpdatePayload {
  fileId: string;
  content: string;
  userId: string;
}

export class SocketService {
  private socket: Socket | null = null;
  private roomId: string | null = null;

  connect(roomId: string, userId: string) {
    if (this.socket) return;

    this.socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
    );
    this.roomId = roomId;

    this.socket.emit("join-room", { roomId, userId });
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
    this.roomId = null;
  }

  onCodeUpdate(callback: (payload: CodeUpdatePayload) => void) {
    this.socket?.on("code-update", callback);
  }

  emitCodeUpdate(payload: CodeUpdatePayload) {
    if (!this.socket || !this.roomId) return;
    this.socket.emit("code-update", { ...payload, roomId: this.roomId });
  }
}

export const socketService = new SocketService();
