import { Router } from 'express';
import { recommendPerfumes } from '../controllers/quizController';

const router = Router();

router.post('/recommend', recommendPerfumes);

export default router;
