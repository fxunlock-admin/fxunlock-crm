import { Router } from 'express';
import { getExchangeRates } from '../controllers/exchangeRateController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/rates', getExchangeRates);

export default router;
