import { Router } from 'express';
import { getNearby } from '../controllers/nearbyController.js';

const router = Router();
router.get('/', getNearby);
export default router;


