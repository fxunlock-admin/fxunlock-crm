import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize('ADMIN', 'STAFF'), getUsers); // Allow Staff to view users for manager dropdown
router.get('/:id', getUser);
router.post('/', authorize('ADMIN'), createUser);
router.put('/:id', updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;
