import { Router } from 'express';
import {
  getCommissions,
  getCommission,
  createCommission,
  bulkCreateCommissions,
  updateCommission,
  deleteCommission,
} from '../controllers/commissionController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getCommissions); // Staff see only commissions for their managed affiliates
router.get('/:id', getCommission);
router.post('/', authorize('ADMIN'), createCommission); // Only Admin can create
router.post('/bulk', authorize('ADMIN'), bulkCreateCommissions); // Only Admin can bulk import
router.put('/:id', authorize('ADMIN'), updateCommission); // Only Admin can edit
router.delete('/:id', authorize('ADMIN'), deleteCommission); // Only Admin can delete

export default router;
