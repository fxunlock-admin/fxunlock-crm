import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import affiliateRoutes from './routes/affiliateRoutes';
import affiliateNoteRoutes from './routes/affiliateNoteRoutes';
import affiliateAlertRoutes from './routes/affiliateAlertRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import brokerRoutes from './routes/brokerRoutes';
import commissionRoutes from './routes/commissionRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import userRoutes from './routes/userRoutes';
import exchangeRateRoutes from './routes/exchangeRateRoutes';
import companyKpiRoutes from './routes/companyKpiRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/affiliates', affiliateRoutes);
app.use('/api/affiliate-notes', affiliateNoteRoutes);
app.use('/api/affiliate-alerts', affiliateAlertRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/brokers', brokerRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exchange', exchangeRateRoutes);
app.use('/api/company-kpis', companyKpiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║                                                      ║');
  console.log('║          FX Unlocked CRM - Backend Server           ║');
  console.log('║                                                      ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('Available routes:');
  console.log('  - POST   /api/auth/login');
  console.log('  - GET    /api/auth/me');
  console.log('  - GET    /api/affiliates');
  console.log('  - GET    /api/brokers');
  console.log('  - GET    /api/commissions');
  console.log('  - GET    /api/dashboard/stats');
  console.log('  - GET    /api/users');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});
