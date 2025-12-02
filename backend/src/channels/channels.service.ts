import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Channel, ChannelDocument } from '../schemas/channel.schema';
import { CreateChannelDto } from './dto/create-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
  ) {}

  async create(createChannelDto: CreateChannelDto, userId: string) {
    const channel = new this.channelModel({
      ...createChannelDto,
      createdBy: new Types.ObjectId(userId),
      members: [new Types.ObjectId(userId)],
    });

    return channel.save();
  }

  async findAll(userId: string) {
    // Get all public channels and channels where user is a member
    const channels = await this.channelModel
      .find({
        $or: [
          { isPrivate: false },
          { members: new Types.ObjectId(userId) },
        ],
      })
      .populate('members', 'username email')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .exec();

    return channels;
  }

  async findOne(id: string, userId: string) {
    const channel = await this.channelModel
      .findById(id)
      .populate('members', 'username email')
      .populate('createdBy', 'username')
      .exec();

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Check if user has access (public or member)
    if (channel.isPrivate && !channel.members.some(m => m._id.toString() === userId)) {
      throw new ForbiddenException('You do not have access to this channel');
    }

    return channel;
  }

  async joinChannel(channelId: string, userId: string) {
    const channel = await this.channelModel.findById(channelId);

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Check if already a member
    if (channel.members.some(m => m.toString() === userId)) {
      return channel;
    }

    // Add user to members
    channel.members.push(new Types.ObjectId(userId));
    return channel.save();
  }

  async leaveChannel(channelId: string, userId: string) {
    const channel = await this.channelModel.findById(channelId);

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Remove user from members
    channel.members = channel.members.filter(
      m => m.toString() !== userId,
    ) as Types.ObjectId[];

    return channel.save();
  }

  async getMembers(channelId: string, userId: string) {
    const channel = await this.findOne(channelId, userId);
    return channel.members;
  }
}

