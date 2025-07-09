import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  getTopSellingProducts,
  deleteProduct,
} from '../controllers/product.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const productRoutes = Router();

productRoutes.use(authenticate);
productRoutes.use(authorize('admin', 'manager', 'sales'));

productRoutes.get('/', getProducts);
productRoutes.get('/top', getTopSellingProducts);
productRoutes.get('/:id', getProductById);
productRoutes.post('/', createProduct);
productRoutes.put('/:id', updateProduct);
productRoutes.delete('/:id', deleteProduct);

export default productRoutes;
