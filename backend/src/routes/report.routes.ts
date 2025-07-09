import { Router } from 'express';
import { getPendingPayments, getRevenueReport, getTransactionHistory } from '../controllers/report.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { exportRevenueAsPDF, exportRevenueAsExcel } from '../controllers/export.controller';

const reportRoutes = Router();

reportRoutes.use(authenticate);
reportRoutes.use(authorize('accountant', 'admin'));

reportRoutes.get('/revenue', getRevenueReport);
reportRoutes.get('/transactions', getTransactionHistory);
reportRoutes.get('/pending', getPendingPayments);
reportRoutes.get('/download/pdf', exportRevenueAsPDF);
reportRoutes.get('/download/excel', exportRevenueAsExcel);

export default reportRoutes;
