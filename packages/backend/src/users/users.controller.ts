import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto, UpdateBrokerProfileDto } from './dto/users.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Put('broker-profile')
  async updateBrokerProfile(@Request() req, @Body() dto: UpdateBrokerProfileDto) {
    return this.usersService.updateBrokerProfile(req.user.id, dto);
  }

  @Get('broker-profile')
  async getBrokerProfile(@Request() req) {
    return this.usersService.getBrokerProfile(req.user.id);
  }
}
