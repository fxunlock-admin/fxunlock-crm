# FlowXchange Setup Guide

## Quick Start

Follow these steps to get FlowXchange running locally:

### 1. Install Dependencies

```bash
# Install pnpm globally if you haven't
npm install -g pnpm

# Install all dependencies
pnpm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` and update these critical values:

```env
# JWT Secret - Generate a secure random string
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Stripe Keys - Get from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_BROKER_PRICE_ID="price_your_broker_subscription_price_id"
```

**Note**: The other values in `.env.example` are already configured for local development.

### 3. Start Docker Services

```bash
# Start PostgreSQL and Redis
pnpm docker:up

# Verify services are running
docker ps
```

You should see two containers running:
- `flowxchange-postgres` on port 5432
- `flowxchange-redis` on port 6379

### 4. Setup Database

```bash
# Navigate to backend
cd packages/backend

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed with sample data
pnpm db:seed

# Return to root
cd ../..
```

### 5. Start Development Servers

```bash
# Start both backend and frontend
pnpm dev
```

This will start:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:3000

### 6. Login & Test

Open http://localhost:3000 and login with:

**Admin Account:**
- Email: `admin@flowxchange.com`
- Password: `Admin123!`

**Affiliate Account:**
- Email: `affiliate1@example.com`
- Password: `Affiliate123!`

**Broker Account:**
- Email: `broker1@example.com`
- Password: `Broker123!`

## Stripe Setup (Optional for Full Testing)

To test broker subscriptions:

1. Create a Stripe account at https://stripe.com
2. Go to https://dashboard.stripe.com/test/apikeys
3. Copy your test keys to `.env`
4. Create a subscription product:
   - Go to Products → Add Product
   - Set recurring billing (monthly)
   - Copy the Price ID to `STRIPE_BROKER_PRICE_ID`

## Troubleshooting

### "Port already in use"
```bash
# Kill processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### "Cannot connect to database"
```bash
# Restart Docker services
pnpm docker:down
pnpm docker:up
```

### "Prisma Client not generated"
```bash
cd packages/backend
pnpm db:generate
```

### WebSocket connection issues
- Ensure backend is running on port 3001
- Check browser console for errors
- Verify JWT token is valid (logout and login again)

## Next Steps

1. **Create a Deal** (as Affiliate)
   - Login as affiliate1@example.com
   - Go to "My Deals" → "Create New Deal"
   - Fill in the form and submit

2. **Place a Bid** (as Broker)
   - Login as broker1@example.com
   - Note: Brokers need an active subscription to bid
   - Browse deals and submit a bid

3. **Negotiate & Accept**
   - Switch back to affiliate account
   - Review bids and send counter-offers
   - Accept a bid to create a connection

4. **Message**
   - After acceptance, identities are revealed
   - Use the messaging feature to communicate

## Development Tips

- **Prisma Studio**: Run `pnpm db:studio` to view/edit database
- **API Testing**: Use tools like Postman or Thunder Client
- **Real-time Testing**: Open multiple browser windows with different accounts
- **Logs**: Check terminal output for backend logs

## Production Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Set up production Stripe keys
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Review security settings
- [ ] Set NODE_ENV=production

---

Need help? Check the main README.md or open an issue on GitHub.
