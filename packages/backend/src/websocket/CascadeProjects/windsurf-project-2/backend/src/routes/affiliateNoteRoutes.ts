import { Router } from 'express';
import {
  getAffiliateNotes,
  createAffiliateNote,
  updateAffiliateNote,
  deleteAffiliateNote,
} from '../controllers/affiliateNoteController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/:affiliateId', getAffiliateNotes); // Get all notes for an affiliate
router.post('/:affiliateId', createAffiliateNote); // Create a note for an affiliate
router.put('/:id', updateAffiliateNote); // Update a note (own notes only, or admin)
router.delete('/:id', deleteAffiliateNote); // Delete a note (own notes only, or admin)

export default router;
