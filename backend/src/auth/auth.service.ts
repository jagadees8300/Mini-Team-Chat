import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { username, email, password } = signupDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT
    const payload = { sub: user._id, email: user.email, username: user.username };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const payload = { sub: user._id, email: user.email, username: user.username };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }
}

