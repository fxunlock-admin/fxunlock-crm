import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { BidsService } from './bids.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateBidDto, UpdateBidDto } from './dto/bids.dto';

@Controller('bids')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BidsController {
  constructor(private bidsService: BidsService) {}

  @Get()
  async findAll(@Request() req) {
    return this.bidsService.findAllByUser(req.user.id, req.user.role);
  }

  @Post()
  @Roles(UserRole.BROKER)
  async create(@Request() req, @Body() dto: CreateBidDto) {
    return this.bidsService.create(req.user.id, dto);
  }

  @Get('deal/:dealRequestId')
  async findByDeal(@Request() req, @Param('dealRequestId') dealRequestId: string) {
    return this.bidsService.findByDeal(dealRequestId, req.user.id, req.user.role);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.bidsService.findOne(id, req.user.id, req.user.role);
  }

  @Put(':id')
  @Roles(UserRole.BROKER)
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateBidDto) {
    return this.bidsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.BROKER)
  async withdraw(@Request() req, @Param('id') id: string) {
    return this.bidsService.withdraw(id, req.user.id);
  }

  @Post(':id/accept')
  @Roles(UserRole.AFFILIATE)
  async accept(@Request() req, @Param('id') id: string) {
    return this.bidsService.accept(id, req.user.id);
  }

  @Post(':id/reject')
  @Roles(UserRole.AFFILIATE)
  async reject(@Request() req, @Param('id') id: string) {
    return this.bidsService.reject(id, req.user.id);
  }
}
