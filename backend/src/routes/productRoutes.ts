import { Router } from 'express';
import {
  getProducts,
  searchPredictive,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  getAdminStats,
  getStoreSettings,
  updateStoreSettings,
} from '../controllers/productController';
import { requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getProducts);
router.get('/search', searchPredictive);
router.get('/stats', requireAdmin, getAdminStats);
router.get('/settings', getStoreSettings);
router.put('/settings', requireAdmin, updateStoreSettings);
router.get('/:id', getProductById);

// Rutas de administración protegidas
router.post('/', requireAdmin, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.patch('/:id/stock', requireAdmin, updateProductStock);
router.delete('/:id', requireAdmin, deleteProduct);

export default router;
