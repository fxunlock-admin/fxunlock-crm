import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getInactiveAffiliateAlerts } from '../controllers/affiliateAlertController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get inactive affiliate alerts (no activity in 6 weeks)
router.get('/inactive-alerts', getInactiveAffiliateAlerts);

export default router;
