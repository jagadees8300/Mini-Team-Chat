import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Channel, ChannelDocument } from '../schemas/channel.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
  ) {}

  async create(createMessageDto: CreateMessageDto, userId: string) {
    const { content, channelId } = createMessageDto;

    // Verify channel exists and user has access
    const channel = await this.channelModel.findById(channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Check if user is a member (for private channels) or channel is public
    if (channel.isPrivate && !channel.members.some(m => m.toString() === userId)) {
      throw new ForbiddenException('You do not have access to this channel');
    }

    const message = new this.messageModel({
      content,
      sender: new Types.ObjectId(userId),
      channel: new Types.ObjectId(channelId),
    });

    const savedMessage = await message.save();
    return this.messageModel
      .findById(savedMessage._id)
      .populate('sender', 'username email')
      .populate('channel', 'name')
      .exec();
  }

  async findByChannel(
    channelId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    // Verify channel exists and user has access
    const channel = await this.channelModel.findById(channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Check if user is a member (for private channels) or channel is public
    if (channel.isPrivate && !channel.members.some(m => m.toString() === userId)) {
      throw new ForbiddenException('You do not have access to this channel');
    }

    const skip = (page - 1) * limit;

    const messages = await this.messageModel
      .find({ channel: new Types.ObjectId(channelId) })
      .populate('sender', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    const total = await this.messageModel.countDocuments({
      channel: new Types.ObjectId(channelId),
    });

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMessageCount(channelId: string) {
    return this.messageModel.countDocuments({
      channel: new Types.ObjectId(channelId),
    });
  }
}

