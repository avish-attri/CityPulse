import Question from '../models/Question.js';
import { asyncHandler } from '../middleware/validate.js';

export const getQuestions = asyncHandler(async (req, res) => {
  const { city, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (city) {
    filter.$or = [{ city }, { city: { $exists: false } }];
  }

  const questions = await Question.find(filter)
    .populate('author', 'name avatar')
    .populate('answers.author', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Question.countDocuments(filter);
  res.json({ success: true, questions, total, page: Number(page) });
});

export const getQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id)
    .populate('author', 'name avatar')
    .populate('answers.author', 'name avatar');
  if (!question) return res.status(404).json({ message: 'Question not found' });
  res.json({ success: true, question });
});

export const createQuestion = asyncHandler(async (req, res) => {
  const question = await Question.create({
    title: req.body.title,
    content: req.body.content,
    city: req.body.city || req.user.city,
    author: req.user._id,
  });

  await question.populate('author', 'name avatar');
  res.status(201).json({ success: true, question });
});

export const addAnswer = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return res.status(404).json({ message: 'Question not found' });

  question.answers.push({ content: req.body.content, author: req.user._id });
  await question.save();
  await question.populate('answers.author', 'name avatar');
  res.status(201).json({ success: true, question });
});

export const deleteAnswer = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return res.status(404).json({ message: 'Question not found' });

  const answer = question.answers.id(req.params.answerId);
  if (!answer) return res.status(404).json({ message: 'Answer not found' });

  const authorId = answer.author?._id ? answer.author._id.toString() : answer.author?.toString();
  if (authorId && authorId !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  question.answers.pull(req.params.answerId);
  await question.save();
  await question.populate('author', 'name avatar').populate('answers.author', 'name avatar');
  res.json({ success: true, question });
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return res.status(404).json({ message: 'Not found' });
  if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  await question.deleteOne();
  res.json({ success: true });
});
