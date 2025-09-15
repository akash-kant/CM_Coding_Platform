import express from 'express';
import { runCode, submitCode } from '../controllers/compilerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/run', runCode); // Can be public or protected, your choice
router.post('/submit', protect, submitCode); // Must be protected

export default router;