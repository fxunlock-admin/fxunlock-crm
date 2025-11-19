import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueAnalytics,
  getTopAffiliates,
  getBrokerPerformance,
  getStaffPerformance,
  getStaffPerformanceDetail,
  getStaffMonthlyRevenue,
} from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/revenue', getRevenueAnalytics);
router.get('/top-affiliates', getTopAffiliates);
router.get('/broker-performance', getBrokerPerformance);
router.get('/staff-performance', getStaffPerformance);
router.get('/staff-performance-detail', getStaffPerformanceDetail);
router.get('/staff-monthly-revenue', getStaffMonthlyRevenue);

export default router;
