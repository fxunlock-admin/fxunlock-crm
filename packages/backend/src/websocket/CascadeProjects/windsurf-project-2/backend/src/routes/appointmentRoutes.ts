import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController';

const router = express.Router();

router.use(authenticate);

router.get('/', getAppointments);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
