import { Router } from 'express';
import { getAnalytics } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(protect, adminOnly);
router.get('/analytics', getAnalytics);
export default router;