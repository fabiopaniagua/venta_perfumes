import { Router } from 'express';
import { createOrder, getOrderById, getOrders } from '../controllers/orderController';
import { requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', createOrder);
router.get('/', requireAdmin, getOrders);
router.get('/:id', getOrderById);

export default router;
