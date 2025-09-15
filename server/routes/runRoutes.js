import express from 'express';
const router = express.Router();
import { runCode } from '../controllers/runController.js';

router.route('/').post(runCode);

export default router;