import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { DealsService } from './deals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateDealDto, UpdateDealDto, FilterDealsDto } from './dto/deals.dto';

@Controller('deals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DealsController {
  constructor(private dealsService: DealsService) {}

  @Post()
  @Roles(UserRole.AFFILIATE)
  async create(@Request() req, @Body() dto: CreateDealDto) {
    return this.dealsService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Request() req, @Query() filters: FilterDealsDto) {
    return this.dealsService.findAll(filters, req.user.role, req.user.id);
  }

  @Get('my-deals')
  @Roles(UserRole.AFFILIATE)
  async getMyDeals(@Request() req) {
    return this.dealsService.getMyDeals(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.dealsService.findOne(id, req.user.id, req.user.role);
  }

  @Put(':id')
  @Roles(UserRole.AFFILIATE)
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateDealDto) {
    return this.dealsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.AFFILIATE)
  async cancel(@Request() req, @Param('id') id: string) {
    return this.dealsService.cancel(id, req.user.id);
  }
}
