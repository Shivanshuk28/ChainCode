import express from 'express';
import { submitSolution, getSubmissions, getSubmissionById } from '../controllers/submissionController.js';
import auth from '../middleware/auth.js'; // Assuming you have an auth middleware

const router = express.Router();

router.post('/submit', auth, submitSolution);
router.get('/user', auth, getSubmissions);
router.get('/:submissionId', auth, getSubmissionById);

export default router;