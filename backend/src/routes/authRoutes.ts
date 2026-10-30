import { Router } from 'express';
import { login, getMe } from '../controllers/authController';
import { requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', login);
router.get('/me', requireAdmin, getMe);

export default router;
