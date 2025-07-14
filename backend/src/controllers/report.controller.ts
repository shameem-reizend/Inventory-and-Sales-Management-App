import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { SalesOrder } from '../entities/SalesOrder';
import { SalesOrderItem } from '../entities/SalesOrderItem';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Between, Raw } from 'typeorm';
import { AppError } from '../utils/AppError';

// Revenue by Product / Category / Month
export const getRevenueReport = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  const itemRepo = AppDataSource.getRepository(SalesOrderItem);

  try {
    const items = await itemRepo
      .createQueryBuilder('item')
      .leftJoin('item.salesOrder', 'order')
      .leftJoin('item.product', 'product')
      .select([
        "product.name AS productName",
        "product.category AS category",
        "TO_CHAR(order.approvedAt, 'YYYY-MM') AS month",
        "SUM(item.totalPrice)::numeric AS totalRevenue",
        "SUM(item.quantity) AS totalUnitsSold"
      ])
      .where("order.status = :status AND order.isPaid = true", { status: 'approved' })
      .groupBy("product.name, product.category, TO_CHAR(order.approvedAt, 'YYYY-MM')")
      .orderBy("month", "DESC")
      .getRawMany();

    res.json(items);
  } catch (err) {
    console.error(err);
    next(new AppError('Failed to generate report', 500));
  }
};

// All approved and paid transactions
export const getTransactionHistory = async (_req: AuthRequest, res: Response): Promise<void> => {
  const repo = AppDataSource.getRepository(SalesOrder);

  const orders = await repo.find({
    where: {
      status: 'approved',
      isPaid: true,
    },
    relations: ['salesRep', 'approvedBy', 'items', 'items.product'],
    order: {
      paidAt: 'DESC',
    },
  });

  res.json(orders);
};

// All approved but unpaid orders
export const getPendingPayments = async (_req: AuthRequest, res: Response): Promise<void> => {
  const repo = AppDataSource.getRepository(SalesOrder);

  const orders = await repo.find({
    where: {
      status: 'approved',
      isPaid: false,
    },
    relations: ['salesRep', 'items', 'items.product'],
    order: {
      approvedAt: 'DESC',
    },
  });

  res.json(orders);
};

