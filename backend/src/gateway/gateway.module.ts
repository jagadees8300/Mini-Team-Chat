import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { PresenceService } from './presence.service';
import { Message, MessageSchema } from '../schemas/message.schema';
import { Channel, ChannelSchema } from '../schemas/channel.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ChatGateway, PresenceService],
  exports: [PresenceService],
})
export class GatewayModule {}

