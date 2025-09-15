import express from 'express';
const router = express.Router();
import { 
    updateUserProgress, 
    getUserStats, 
    getUserProgress 
} from '../controllers/userController.js'; 
import { protect } from '../middleware/authMiddleware.js';

router.route('/progress').put(protect, updateUserProgress);
router.route('/stats').get(protect, getUserStats);
router.route('/progress').get(protect, getUserProgress);

export default router;