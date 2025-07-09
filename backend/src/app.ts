import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import salesRoutes from './routes/sales.routes';
import reportRoutes from './routes/report.routes';

dotenv.config();

const app = express();

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

export default app;
