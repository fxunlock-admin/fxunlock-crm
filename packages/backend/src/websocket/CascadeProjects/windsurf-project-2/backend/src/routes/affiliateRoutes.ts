import { Router } from 'express';
import {
  getAffiliates,
  getAffiliate,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
} from '../controllers/affiliateController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAffiliates); // Staff see only their managed affiliates
router.get('/:id', getAffiliate);
router.post('/', authorize('ADMIN', 'STAFF'), createAffiliate);
router.put('/:id', authorize('ADMIN', 'STAFF'), updateAffiliate);
router.delete('/:id', authorize('ADMIN'), deleteAffiliate); // Only Admin can delete

export default router;
