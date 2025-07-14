import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import salesRoutes from './routes/sales.routes';
import reportRoutes from './routes/report.routes';
import notificationRoutes from './routes/notification.routes';
import { AppError } from './utils/AppError';
import { globalErrorHandler } from './middlewares/GlobalErrorHandler';

dotenv.config();

const app = express();

interface CustomError extends Error {
  status?: string;
  statusCode?: number;
}

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend origin
  credentials: true,               // Required to allow cookies
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

app.all('/local', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

export default app;
