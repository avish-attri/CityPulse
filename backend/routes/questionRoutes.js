import { Router } from 'express';
import {
  getQuestions, getQuestion, createQuestion, addAnswer, deleteAnswer, deleteQuestion,
} from '../controllers/questionController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getQuestions);
router.get('/:id', getQuestion);
router.post('/', protect, createQuestion);
router.post('/:id/answers', protect, addAnswer);
router.delete('/:id/answers/:answerId', protect, deleteAnswer);
router.delete('/:id', protect, deleteQuestion);

export default router;
