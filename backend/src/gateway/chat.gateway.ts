import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PresenceService } from './presence.service';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Channel, ChannelDocument } from '../schemas/channel.schema';
import { User, UserDocument } from '../schemas/user.schema';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private presenceService: PresenceService,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Attach user info to socket
      client.userId = payload.sub;
      client.username = payload.username;

      // Add user to presence
      this.presenceService.addUser(payload.sub, client.id);

      // Notify others that user is online
      client.broadcast.emit('user-online', {
        userId: payload.sub,
        username: payload.username,
      });

      // Send current online users to the newly connected user
      const onlineUsers = this.presenceService.getOnlineUsers();
      const onlineUsersData = await Promise.all(
        onlineUsers
          .filter(id => id !== payload.sub)
          .map(async (id) => {
            const user = await this.userModel.findById(id).select('username email');
            return user ? { userId: user._id, username: user.username, email: user.email } : null;
          })
      );

      client.emit('online-users', onlineUsersData.filter(Boolean));
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.presenceService.removeUser(client.userId, client.id);

      // Notify others that user is offline (only if no other sockets for this user)
      if (!this.presenceService.isUserOnline(client.userId)) {
        this.server.emit('user-offline', {
          userId: client.userId,
          username: client.username,
        });
      }
    }
  }

  @SubscribeMessage('join-channel')
  async handleJoinChannel(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    // Verify user has access to channel
    const channel = await this.channelModel.findById(data.channelId);
    if (!channel) {
      return { error: 'Channel not found' };
    }

    if (channel.isPrivate && !channel.members.some(m => m.toString() === client.userId)) {
      return { error: 'Access denied' };
    }

    // Join socket room
    client.join(data.channelId);
    return { success: true, channelId: data.channelId };
  }

  @SubscribeMessage('leave-channel')
  async handleLeaveChannel(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    client.leave(data.channelId);
    return { success: true, channelId: data.channelId };
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { content: string; channelId: string },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    // Verify user has access to channel
    const channel = await this.channelModel.findById(data.channelId);
    if (!channel) {
      return { error: 'Channel not found' };
    }

    if (channel.isPrivate && !channel.members.some(m => m.toString() === client.userId)) {
      return { error: 'Access denied' };
    }

    // Create and save message
    const message = new this.messageModel({
      content: data.content,
      sender: new Types.ObjectId(client.userId),
      channel: new Types.ObjectId(data.channelId),
    });

    const savedMessage = await message.save();
    const populatedMessage = await this.messageModel
      .findById(savedMessage._id)
      .populate('sender', 'username email')
      .populate('channel', 'name')
      .exec();

    // Broadcast to all users in the channel room
    this.server.to(data.channelId).emit('new-message', populatedMessage);

    return { success: true, message: populatedMessage };
  }

  @SubscribeMessage('typing-start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    if (!client.userId) return;
    client.to(data.channelId).emit('user-typing', {
      userId: client.userId,
      username: client.username,
      channelId: data.channelId,
    });
  }

  @SubscribeMessage('typing-stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    if (!client.userId) return;
    client.to(data.channelId).emit('user-stopped-typing', {
      userId: client.userId,
      username: client.username,
      channelId: data.channelId,
    });
  }
}

