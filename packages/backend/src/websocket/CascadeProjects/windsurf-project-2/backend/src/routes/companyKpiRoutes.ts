import { Router } from 'express';
import {
  getCompanyKpis,
  createCompanyKpi,
  updateCompanyKpi,
  deleteCompanyKpi,
  getCompanyKpiSummary,
  updateCompanyKpiActuals,
} from '../controllers/companyKpiController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getCompanyKpis);
router.get('/summary', getCompanyKpiSummary);
router.post('/update-actuals', updateCompanyKpiActuals);
router.post('/', createCompanyKpi);
router.put('/:id', updateCompanyKpi);
router.delete('/:id', deleteCompanyKpi);

export default router;
