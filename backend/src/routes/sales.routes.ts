import { Router } from 'express';
import {
  createSalesOrder,
  getAllOrders,
  approveOrder,
  rejectOrder,
  markOrderAsPaid,
} from '../controllers/sales.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const salesRoutes = Router();

// Sales Rep: Create & View own orders
salesRoutes.use(authenticate);
salesRoutes.get('/', getAllOrders);
salesRoutes.post('/', authorize('sales', 'manager'), createSalesOrder);

// Manager: Approve / Reject
salesRoutes.put('/:id/approve', authorize('manager'), approveOrder);
salesRoutes.put('/:id/reject', authorize('manager'), rejectOrder);
salesRoutes.put('/:id/pay', authorize('accountant'), markOrderAsPaid);

export default salesRoutes;
