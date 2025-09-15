import express from 'express';
import { submitSolution } from '../controllers/submitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, submitSolution);

export default router;