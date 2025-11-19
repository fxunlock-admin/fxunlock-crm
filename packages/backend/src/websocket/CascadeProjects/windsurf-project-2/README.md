# FX Unlocked CRM System

A modern, full-stack CRM system designed for FX Unlocked to manage affiliates, brokers, commissions, and internal workflows.

## Features

- **Affiliates/IBs Management**: Track affiliate details, deals, and performance
- **Brokers Module**: Manage broker relationships and master deal terms
- **Commission Tracking**: Monthly deal tracking with bulk import capability
- **Dashboard & Analytics**: Real-time insights with charts and KPI tracking
- **User Access Control**: Role-based permissions (Admin, Staff, Read-only)
- **Audit Trail**: Complete history of changes and actions
- **Data Export**: Export reports in PDF/Excel formats

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- TailwindCSS for styling
- shadcn/ui for modern UI components
- Recharts for data visualization
- React Query for data fetching
- React Router for navigation
- Lucide React for icons

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Prisma ORM
- JWT authentication
- bcrypt for password hashing
- CSV parsing for bulk imports

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables:

**Backend** (create `backend/.env`):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/fxu_crm"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=8002
NODE_ENV=development
```

**Frontend** (create `frontend/.env`):
```env
VITE_API_URL=http://localhost:8002
```

3. Set up the database:
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

4. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8002

## Default Login Credentials

**Admin User:**
- Email: admin@fxunlock.com
- Password: Admin123!

**Staff User:**
- Email: staff@fxunlock.com
- Password: Staff123!

**Please change these passwords after first login!**

## Project Structure

```
fxu-crm/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── index.ts         # App entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # App entry point
│   └── package.json
└── package.json
```

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Affiliates
- `GET /api/affiliates` - List all affiliates
- `POST /api/affiliates` - Create affiliate
- `GET /api/affiliates/:id` - Get affiliate details
- `PUT /api/affiliates/:id` - Update affiliate
- `DELETE /api/affiliates/:id` - Delete affiliate

### Brokers
- `GET /api/brokers` - List all brokers
- `POST /api/brokers` - Create broker
- `GET /api/brokers/:id` - Get broker details
- `PUT /api/brokers/:id` - Update broker
- `DELETE /api/brokers/:id` - Delete broker

### Commissions
- `GET /api/commissions` - List all commissions
- `POST /api/commissions` - Create commission
- `POST /api/commissions/bulk` - Bulk import commissions
- `GET /api/commissions/:id` - Get commission details
- `PUT /api/commissions/:id` - Update commission
- `DELETE /api/commissions/:id` - Delete commission

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/revenue` - Get revenue analytics
- `GET /api/dashboard/top-affiliates` - Get top performing affiliates

### Users
- `GET /api/users` - List all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

## Deployment

For production deployment, please refer to the deployment guide in the documentation.

## Support

For issues or questions, contact: hello@fx-unlocked.com

## License

Proprietary - FX Unlocked © 2025
