import express from 'express';
const router = express.Router();
import { 
    updateUserProgress, 
    getUserStats, 
    getUserProgress, 
    getRecentSubmissions 
} from '../controllers/userController.js'; 
import { protect } from '../middleware/authMiddleware.js';

router.route('/progress').put(protect, updateUserProgress);
router.route('/stats').get(protect, getUserStats);
router.route('/progress').get(protect, getUserProgress);
router.route('/submissions').get(protect, getRecentSubmissions);

export default router;