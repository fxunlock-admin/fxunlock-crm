import { Controller, Get, Put, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, UserStatus, DealStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  async getAllUsers(@Query('role') role?: UserRole, @Query('status') status?: UserStatus) {
    return this.adminService.getAllUsers({ role, status });
  }

  @Put('users/:id/verify')
  async verifyUser(@Request() req, @Param('id') id: string) {
    return this.adminService.verifyUser(id, req.user.id);
  }

  @Put('users/:id/suspend')
  async suspendUser(@Request() req, @Param('id') id: string) {
    return this.adminService.suspendUser(id, req.user.id);
  }

  @Put('users/:id/reject')
  async rejectUser(@Request() req, @Param('id') id: string) {
    return this.adminService.rejectUser(id, req.user.id);
  }

  @Get('deals')
  async getAllDeals(@Query('status') status?: DealStatus) {
    return this.adminService.getAllDeals({ status });
  }

  @Put('deals/:id/close')
  async closeDeal(@Request() req, @Param('id') id: string) {
    return this.adminService.closeDeal(id, req.user.id);
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('entity') entity?: string,
    @Query('action') action?: string,
  ) {
    return this.adminService.getAuditLogs({ userId, entity, action });
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }
}
