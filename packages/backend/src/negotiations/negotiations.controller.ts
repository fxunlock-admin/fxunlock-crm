import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { NegotiationsService } from './negotiations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateNegotiationDto } from './dto/negotiations.dto';

@Controller('negotiations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NegotiationsController {
  constructor(private negotiationsService: NegotiationsService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateNegotiationDto) {
    return this.negotiationsService.create(req.user.id, req.user.role, dto);
  }

  @Get('bid/:bidId')
  async findByBid(@Request() req, @Param('bidId') bidId: string) {
    return this.negotiationsService.findByBid(bidId, req.user.id, req.user.role);
  }
}
