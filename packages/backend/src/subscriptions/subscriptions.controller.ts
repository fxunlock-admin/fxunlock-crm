import { Controller, Post, Get, UseGuards, Request, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BROKER)
  async createCheckoutSession(@Request() req) {
    return this.subscriptionsService.createCheckoutSession(req.user.id);
  }

  @Post('create-portal-session')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BROKER)
  async createPortalSession(@Request() req) {
    return this.subscriptionsService.createPortalSession(req.user.id);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.subscriptionsService.handleWebhook(signature, req.rawBody);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BROKER)
  async getStatus(@Request() req) {
    return this.subscriptionsService.getSubscriptionStatus(req.user.id);
  }
}
