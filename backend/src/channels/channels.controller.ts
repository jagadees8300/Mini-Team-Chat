import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('channels')
@UseGuards(JwtAuthGuard)
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  create(@Body() createChannelDto: CreateChannelDto, @Request() req) {
    return this.channelsService.create(createChannelDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.channelsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.channelsService.findOne(id, req.user.userId);
  }

  @Post(':id/join')
  joinChannel(@Param('id') id: string, @Request() req) {
    return this.channelsService.joinChannel(id, req.user.userId);
  }

  @Post(':id/leave')
  leaveChannel(@Param('id') id: string, @Request() req) {
    return this.channelsService.leaveChannel(id, req.user.userId);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string, @Request() req) {
    return this.channelsService.getMembers(id, req.user.userId);
  }
}

