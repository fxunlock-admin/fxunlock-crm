import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('connections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConnectionsController {
  constructor(private connectionsService: ConnectionsService) {}

  @Get()
  async findAll(@Request() req) {
    return this.connectionsService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.connectionsService.findOne(id, req.user.id, req.user.role);
  }
}
