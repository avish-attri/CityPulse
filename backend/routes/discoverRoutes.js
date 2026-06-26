import { Router } from 'express';
import {
  getDiscoveries, getDiscovery, createDiscovery, rateDiscovery,
  deleteDiscovery,
} from '../controllers/discoverController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', getDiscoveries);
router.get('/:id', getDiscovery);
router.post('/', protect, upload.array('images', 5), createDiscovery);
router.post('/:id/rate', protect, rateDiscovery);
router.delete('/:id', protect, deleteDiscovery);

export default router;
