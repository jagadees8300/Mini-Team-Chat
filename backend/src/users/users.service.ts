import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findById(id: string) {
    return this.userModel.findById(id).select('-password');
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).select('-password');
  }

  async findByUsername(username: string) {
    return this.userModel.findOne({ username }).select('-password');
  }
}

