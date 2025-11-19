import { Router } from 'express';
import {
  getBrokers,
  getBroker,
  createBroker,
  updateBroker,
  deleteBroker,
} from '../controllers/brokerController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getBrokers); // All authenticated users can view brokers
router.get('/:id', getBroker); // All authenticated users can view broker details
router.post('/', authorize('ADMIN'), createBroker); // Only Admin can create
router.put('/:id', authorize('ADMIN'), updateBroker); // Only Admin can edit
router.delete('/:id', authorize('ADMIN'), deleteBroker); // Only Admin can delete

export default router;
