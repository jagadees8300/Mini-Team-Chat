import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private onlineUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds

  addUser(userId: string, socketId: string) {
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
    }
    this.onlineUsers.get(userId)!.add(socketId);
  }

  removeUser(userId: string, socketId: string) {
    const socketIds = this.onlineUsers.get(userId);
    if (socketIds) {
      socketIds.delete(socketId);
      if (socketIds.size === 0) {
        this.onlineUsers.delete(userId);
      }
    }
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId) && this.onlineUsers.get(userId)!.size > 0;
  }

  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.keys());
  }

  getUserSocketIds(userId: string): string[] {
    const socketIds = this.onlineUsers.get(userId);
    return socketIds ? Array.from(socketIds) : [];
  }
}

