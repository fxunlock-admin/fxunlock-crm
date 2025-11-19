import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateMessageDto } from './dto/messages.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateMessageDto) {
    return this.messagesService.create(req.user.id, dto);
  }

  @Get('connection/:connectionId')
  async findByConnection(@Request() req, @Param('connectionId') connectionId: string) {
    return this.messagesService.findByConnection(connectionId, req.user.id, req.user.role);
  }

  @Put('connection/:connectionId/read')
  async markAsRead(@Request() req, @Param('connectionId') connectionId: string) {
    return this.messagesService.markAsRead(connectionId, req.user.id);
  }
}
