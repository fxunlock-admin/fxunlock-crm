# FlowXchange - Reverse-Auction Marketplace for FX Affiliates/IBs

A production-quality MVP that demonstrates the full reverse-auction workflow: verified FX affiliates/IBs anonymously post desired deals; brokers filter and bid; counter-offers; acceptance; then identities are revealed and the parties are connected.

## 🚀 Features

- **Anonymous Deal Posting**: Affiliates create anonymized deal requests
- **Reverse Auction**: Brokers compete with their best offers
- **Real-time Negotiations**: Counter-offers with live updates via WebSocket
- **Identity Reveal**: Parties revealed only after deal acceptance
- **Secure Messaging**: Direct communication after connection
- **Stripe Subscriptions**: Monthly broker subscriptions (test mode)
- **Role-Based Access Control**: Affiliate, Broker, and Admin roles
- **Audit Logging**: Complete activity tracking

## 🏗️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **Redis** - Caching and queue management
- **Socket.IO** - Real-time bidirectional communication
- **BullMQ** - Job queue processing
- **Stripe** - Payment processing
- **JWT** - Authentication
- **Zod** - Schema validation

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Zustand** - State management
- **React Query** - Data fetching and caching
- **Socket.IO Client** - Real-time updates
- **Lucide React** - Icon library

### DevOps
- **Docker Compose** - Local development environment
- **pnpm** - Fast, disk space efficient package manager
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📋 Prerequisites

- Node.js 18+ 
- pnpm 8+
- Docker & Docker Compose
- Stripe account (for subscriptions)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
# Install pnpm if you haven't
npm install -g pnpm

# Install dependencies
pnpm install
```

### 2. Environment Setup

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
# Database
DATABASE_URL="postgresql://flowxchange:flowxchange@localhost:5432/flowxchange?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Stripe (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_BROKER_PRICE_ID="price_your_broker_subscription_price_id"

# App URLs
NODE_ENV="development"
BACKEND_PORT=3001
FRONTEND_PORT=3000
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

# Admin Account
ADMIN_EMAIL="admin@flowxchange.com"
ADMIN_PASSWORD="Admin123!"
```

### 3. Start Docker Services

```bash
# Start PostgreSQL and Redis
pnpm docker:up

# Verify services are running
docker ps
```

### 4. Database Setup

```bash
# Generate Prisma client
cd packages/backend
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database with sample data
pnpm db:seed
```

### 5. Start Development Servers

```bash
# From root directory, start both backend and frontend
pnpm dev

# Or start individually:
# Backend: cd packages/backend && pnpm dev
# Frontend: cd packages/frontend && pnpm dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api

## 👥 Test Accounts

After seeding, you can login with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@flowxchange.com | Admin123! |
| Affiliate 1 | affiliate1@example.com | Affiliate123! |
| Affiliate 2 | affiliate2@example.com | Affiliate123! |
| Broker 1 | broker1@example.com | Broker123! |
| Broker 2 | broker2@example.com | Broker123! |

## 🔄 Core Workflow

### 1. Affiliate Creates Deal
- Login as affiliate
- Navigate to "My Deals" → "Create New Deal"
- Fill in deal requirements (commission, volume, region, instruments)
- Submit anonymized deal request

### 2. Broker Browses & Bids
- Login as broker (requires active subscription)
- Browse available deals
- Submit competitive bid with offered terms
- Add optional message

### 3. Negotiation
- Affiliate reviews bids
- Send counter-offers
- Broker responds with updated terms
- Real-time notifications via WebSocket

### 4. Acceptance & Connection
- Affiliate accepts best bid
- Identities revealed to both parties
- Direct messaging channel opens
- Partnership begins

## 🗂️ Project Structure

```
flowxchange/
├── packages/
│   ├── backend/              # NestJS API
│   │   ├── prisma/          # Database schema & migrations
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── auth/        # Authentication & JWT
│   │       ├── users/       # User management
│   │       ├── deals/       # Deal requests
│   │       ├── bids/        # Bidding system
│   │       ├── negotiations/ # Counter-offers
│   │       ├── connections/ # Partnerships
│   │       ├── messages/    # Direct messaging
│   │       ├── subscriptions/ # Stripe integration
│   │       ├── admin/       # Admin panel
│   │       ├── websocket/   # Real-time updates
│   │       └── audit/       # Activity logging
│   │
│   └── frontend/            # Next.js App
│       └── src/
│           ├── app/         # Pages & routes
│           ├── components/  # UI components
│           ├── lib/         # Utilities & API client
│           └── store/       # State management
│
├── docker-compose.yml       # Docker services
├── pnpm-workspace.yaml      # Monorepo config
└── package.json            # Root scripts
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Deals
- `GET /api/deals` - List deals (filtered by role)
- `POST /api/deals` - Create deal (Affiliate only)
- `GET /api/deals/:id` - Get deal details
- `PUT /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Cancel deal

### Bids
- `POST /api/bids` - Create bid (Broker only)
- `GET /api/bids/deal/:dealId` - Get bids for deal
- `POST /api/bids/:id/accept` - Accept bid (Affiliate)
- `POST /api/bids/:id/reject` - Reject bid

### Negotiations
- `POST /api/negotiations` - Create counter-offer
- `GET /api/negotiations/bid/:bidId` - Get negotiation history

### Connections
- `GET /api/connections` - List connections
- `GET /api/connections/:id` - Get connection details

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/connection/:id` - Get messages

### Subscriptions (Broker)
- `POST /api/subscriptions/create-checkout-session` - Start subscription
- `POST /api/subscriptions/create-portal-session` - Manage subscription
- `GET /api/subscriptions/status` - Check subscription status

### Admin
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/verify` - Verify user
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/audit-logs` - View audit logs

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Role-Based Access Control** (RBAC)
- **PII Redaction** - Affiliate info hidden until deal acceptance
- **Server-side Filtering** - Brokers only see eligible deals
- **Audit Logging** - All actions tracked
- **Input Validation** - Zod schemas & class-validator
- **SQL Injection Protection** - Prisma ORM
- **CORS Configuration** - Controlled origins

## 🧪 Testing

```bash
# Backend tests
cd packages/backend
pnpm test

# E2E tests
pnpm test:e2e

# Frontend tests
cd packages/frontend
pnpm test
```

## 📦 Building for Production

```bash
# Build all packages
pnpm build

# Build backend only
cd packages/backend && pnpm build

# Build frontend only
cd packages/frontend && pnpm build
```

## 🐳 Docker Commands

```bash
# Start services
pnpm docker:up

# Stop services
pnpm docker:down

# View logs
docker-compose logs -f

# Reset database
docker-compose down -v
pnpm docker:up
```

## 🔧 Useful Commands

```bash
# Database
pnpm db:migrate      # Run migrations
pnpm db:seed         # Seed database
pnpm db:studio       # Open Prisma Studio

# Development
pnpm dev             # Start all services
pnpm build           # Build all packages
pnpm lint            # Lint all packages

# Clean
rm -rf node_modules packages/*/node_modules
pnpm install
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
docker-compose restart postgres
```

### Port Already in Use
```bash
# Kill process on port 3000 or 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Prisma Client Issues
```bash
cd packages/backend
pnpm db:generate
```

### WebSocket Connection Failed
- Ensure backend is running on port 3001
- Check CORS settings in backend
- Verify JWT token is valid

## 📝 Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://... |
| REDIS_URL | Redis connection string | redis://localhost:6379 |
| JWT_SECRET | Secret for JWT signing | (required) |
| STRIPE_SECRET_KEY | Stripe secret key | (required) |
| BACKEND_PORT | Backend server port | 3001 |
| FRONTEND_PORT | Frontend server port | 3000 |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@flowxchange.com

---

**Note**: This is a development build. For production deployment, ensure you:
- Use strong JWT secrets
- Enable HTTPS
- Configure proper CORS origins
- Set up production Stripe keys
- Enable rate limiting
- Configure proper logging
- Set up monitoring and alerts
# fxunlock-crm
