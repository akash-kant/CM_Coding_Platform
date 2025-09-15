import express from 'express';
import Question from '../models/Question.js';

const router = express.Router();

// This function gets ALL questions (for the home page)
const getQuestions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    const questions = await Question.find(filter);
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- THIS IS THE MISSING PART ---
// This new function gets a SINGLE question by its ID
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (question) {
      res.json(question);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Define the routes
router.route('/').get(getQuestions);
router.route('/:id').get(getQuestionById); // This line adds the route for a single question

export default router;