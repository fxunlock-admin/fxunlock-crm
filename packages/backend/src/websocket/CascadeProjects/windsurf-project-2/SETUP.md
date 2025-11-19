# FX Unlocked CRM - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager

## Step 1: Install Dependencies

Navigate to the project root and install all dependencies:

```bash
cd /Users/dominicmustafa/CascadeProjects/windsurf-project/packages/backend/src/websocket/CascadeProjects/windsurf-project-2

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

## Step 2: Set Up PostgreSQL Database

1. **Create a new PostgreSQL database:**

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fxu_crm;

# Create user (optional)
CREATE USER fxu_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE fxu_crm TO fxu_admin;

# Exit
\q
```

## Step 3: Configure Environment Variables

### Backend Configuration

Create `backend/.env` file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your database credentials:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/fxu_crm"
JWT_SECRET="your-super-secret-jwt-key-change-this-to-something-very-secure"
PORT=8002
NODE_ENV=development
```

**Important:** Replace `your_password` with your actual PostgreSQL password and generate a strong JWT secret.

### Frontend Configuration

Create `frontend/.env` file:

```bash
cd ../frontend
cp .env.example .env
```

The default configuration should work:

```env
VITE_API_URL=http://localhost:8002
```

## Step 4: Initialize Database

Run Prisma migrations and seed the database:

```bash
cd ../backend

# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# Seed the database with sample data
npm run prisma:seed
```

This will create:
- **Admin user:** admin@fxunlock.com / Admin123!
- **Staff user:** staff@fxunlock.com / Staff123!
- Sample brokers, affiliates, and commissions

## Step 5: Start the Application

### Option 1: Start Both Servers Together (Recommended)

From the project root:

```bash
npm run dev
```

This will start:
- **Backend API:** http://localhost:8002
- **Frontend:** http://localhost:5173

### Option 2: Start Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 6: Access the Application

Open your browser and navigate to:

**Frontend:** [http://localhost:5173](http://localhost:5173)

**Login with default credentials:**
- Email: `admin@fxunlock.com`
- Password: `Admin123!`

**Backend API:** [http://localhost:8002](http://localhost:8002)
- Health check: [http://localhost:8002/health](http://localhost:8002/health)

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Verify PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   
   # Or check manually
   psql -U postgres -c "SELECT version();"
   ```

2. Check your DATABASE_URL in `backend/.env`

3. Ensure the database exists:
   ```bash
   psql -U postgres -l
   ```

### Port Already in Use

If port 8002 or 5173 is already in use:

**Backend:** Change PORT in `backend/.env`
```env
PORT=8003
```

**Frontend:** Change port in `frontend/vite.config.ts`
```typescript
server: {
  port: 5174,
  // ...
}
```

### Prisma Issues

If you encounter Prisma errors:

```bash
cd backend

# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Or just regenerate client
npx prisma generate
```

### Module Not Found Errors

Clear node_modules and reinstall:

```bash
# From project root
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install:all
```

## Development Tools

### Prisma Studio (Database GUI)

View and edit your database:

```bash
cd backend
npm run prisma:studio
```

Opens at: [http://localhost:5555](http://localhost:5555)

### API Testing

Use tools like:
- **Postman** or **Insomnia** for API testing
- **curl** for quick tests

Example:
```bash
# Login
curl -X POST http://localhost:8002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fxunlock.com","password":"Admin123!"}'

# Get affiliates (replace TOKEN)
curl http://localhost:8002/api/affiliates \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Building for Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## Next Steps

1. **Change default passwords** immediately after first login
2. **Update JWT_SECRET** to a strong random string
3. **Configure your broker and affiliate data**
4. **Set up regular database backups**
5. **Review and customize the branding** to match FX Unlocked's style

## Support

For issues or questions:
- Check the main [README.md](./README.md)
- Review API documentation in README
- Contact: hello@fx-unlocked.com

---

**Security Note:** Never commit `.env` files to version control. The `.gitignore` file is configured to exclude them.
