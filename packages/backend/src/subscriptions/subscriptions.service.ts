import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, SubscriptionStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { brokerProfile: true },
    });

    if (!user || user.role !== UserRole.BROKER) {
      throw new BadRequestException('Only brokers can subscribe');
    }

    if (user.brokerProfile?.subscriptionStatus === SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('You already have an active subscription');
    }

    let customerId = user.brokerProfile?.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      await this.prisma.brokerProfile.update({
        where: { userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: this.configService.get('STRIPE_BROKER_PRICE_ID'),
          quantity: 1,
        },
      ],
      success_url: `${this.configService.get('FRONTEND_URL')}/dashboard?subscription=success`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/dashboard?subscription=cancelled`,
      metadata: {
        userId: user.id,
      },
    });

    return { sessionId: session.id, url: session.url };
  }

  async createPortalSession(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { brokerProfile: true },
    });

    if (!user || user.role !== UserRole.BROKER) {
      throw new BadRequestException('Only brokers can access billing portal');
    }

    if (!user.brokerProfile?.stripeCustomerId) {
      throw new BadRequestException('No billing account found');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.brokerProfile.stripeCustomerId,
      return_url: `${this.configService.get('FRONTEND_URL')}/dashboard`,
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) return;

    const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);

    await this.prisma.brokerProfile.update({
      where: { userId },
      data: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        stripeSubscriptionId: subscription.id,
        subscriptionStartDate: new Date(subscription.current_period_start * 1000),
        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
      },
    });

    await this.auditService.log({
      userId,
      action: 'SUBSCRIPTION_ACTIVATED',
      entity: 'BrokerProfile',
      entityId: userId,
      details: { subscriptionId: subscription.id },
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const brokerProfile = await this.prisma.brokerProfile.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!brokerProfile) return;

    const status = subscription.status === 'active' 
      ? SubscriptionStatus.ACTIVE 
      : subscription.status === 'past_due'
      ? SubscriptionStatus.PAST_DUE
      : SubscriptionStatus.INACTIVE;

    await this.prisma.brokerProfile.update({
      where: { id: brokerProfile.id },
      data: {
        subscriptionStatus: status,
        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
      },
    });

    await this.auditService.log({
      userId: brokerProfile.userId,
      action: 'SUBSCRIPTION_UPDATED',
      entity: 'BrokerProfile',
      entityId: brokerProfile.userId,
      details: { status, subscriptionId: subscription.id },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const brokerProfile = await this.prisma.brokerProfile.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!brokerProfile) return;

    await this.prisma.brokerProfile.update({
      where: { id: brokerProfile.id },
      data: {
        subscriptionStatus: SubscriptionStatus.CANCELLED,
      },
    });

    await this.auditService.log({
      userId: brokerProfile.userId,
      action: 'SUBSCRIPTION_CANCELLED',
      entity: 'BrokerProfile',
      entityId: brokerProfile.userId,
      details: { subscriptionId: subscription.id },
    });
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const brokerProfile = await this.prisma.brokerProfile.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!brokerProfile) return;

    await this.prisma.brokerProfile.update({
      where: { id: brokerProfile.id },
      data: {
        subscriptionStatus: SubscriptionStatus.PAST_DUE,
      },
    });

    await this.auditService.log({
      userId: brokerProfile.userId,
      action: 'PAYMENT_FAILED',
      entity: 'BrokerProfile',
      entityId: brokerProfile.userId,
      details: { invoiceId: invoice.id },
    });
  }

  async getSubscriptionStatus(userId: string) {
    const brokerProfile = await this.prisma.brokerProfile.findUnique({
      where: { userId },
    });

    if (!brokerProfile) {
      throw new NotFoundException('Broker profile not found');
    }

    return {
      status: brokerProfile.subscriptionStatus,
      startDate: brokerProfile.subscriptionStartDate,
      endDate: brokerProfile.subscriptionEndDate,
    };
  }
}
