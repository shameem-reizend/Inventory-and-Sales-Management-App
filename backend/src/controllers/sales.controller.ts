import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { SalesOrder } from '../entities/SalesOrder';
import { SalesOrderItem } from '../entities/SalesOrderItem';
import { Product } from '../entities/Product';
import { AuthRequest } from '../middlewares/auth.middleware';
import { User } from '../entities/User';
import { io, connectedUsers } from '../socket';
import { Notification } from '../entities/Notification';
import { AppError } from '../utils/AppError';

// Create Sales Order
export const createSalesOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    next(new AppError('At least one item is required.', 400))
    return 
  }
 
  const salesOrderRepo = AppDataSource.getRepository(SalesOrder);
  const itemRepo = AppDataSource.getRepository(SalesOrderItem);
  const productRepo = AppDataSource.getRepository(Product);
  const userRepo = AppDataSource.getRepository(User);

  try {
    const salesRep = await userRepo.findOneBy({ id: req.user!.id });

    if (!salesRep) {
      throw new AppError('Sales rep not found', 404);
    }

    const salesOrder = salesOrderRepo.create({
      salesRep,
      status: 'pending',
      items: [],
    });

    await salesOrderRepo.save(salesOrder); // save first to get ID

    for (const item of items) {
      const product = await productRepo.findOneBy({ id: item.productId });
      if (!product) {
        next(new AppError(`Product ID ${item.productId} not found`, 404))
        return 
      }

      const unitPrice = product.unitPrice;
      const totalPrice = Number(unitPrice) * item.quantity;

      const orderItem = itemRepo.create({
        product,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        salesOrder,
      });

      await itemRepo.save(orderItem);
    }

    res.status(201).json({ message: 'Sales order created' });
  } catch (err) {
    next(new AppError('Failed to create order', 500))
  }
};

// Get all sales orders
export const getAllOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const repo = AppDataSource.getRepository(SalesOrder);
  const userRole = req.user!.role;

  const statusFilter = req.query.status as string | undefined;
  const userIdParam = req.query.userId as string | undefined;

  const where: any = {};

  if (userRole === 'sales') {
    where.salesRep = { id: req.user!.id };
  } else if (userIdParam) {
    const userId = parseInt(userIdParam);
    if (!isNaN(userId)) {
      where.salesRep = { id: userId };
    } else {
      next(new AppError('Invalid user', 400))
      return 
    }
  }

  if (statusFilter) {
    where.status = statusFilter.toLowerCase();
  }

  try {
    const orders = await repo.find({
      relations: ['salesRep', 'approvedBy', 'items', 'items.product'],
      where,
      order: { createdAt: 'DESC' }
    });

    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    next(new AppError('Server error', 500))
  }
};



// Approve order
export const approveOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const repo = AppDataSource.getRepository(SalesOrder);
  const productRepo = AppDataSource.getRepository(Product);
  const notificationRepo = AppDataSource.getRepository(Notification);

  const order = await repo.findOne({
    where: { id: Number(id) },
    relations: ['items', 'items.product', 'salesRep']
  });

  if (!order){
    next(new AppError('Order not found', 404))
    return 
  }
  if (order.status !== 'pending') {
    next(new AppError('Order already processed', 400))
    return
  } 

  // Deduct inventory
  for (const item of order.items) {
    if (item.quantity > item.product.stock) {
      next(new AppError(`Not enough stock for product ${item.product.name}`, 400))
      return 
    }
  }

  for (const item of order.items) {
    item.product.stock -= item.quantity;
    await productRepo.save(item.product);
  }

  order.status = 'approved';
  order.approvedAt = new Date();
  order.approvedBy = { id: req.user!.id } as User;

  await repo.save(order);

  await notificationRepo.save({
    type: 'order-approved',
    message: `Order #${order.id} has been approved!`,
    sender: { id: req.user!.id },
    receiver: { id: order.salesRep.id },
  });

  const salesRepId = order.salesRep?.id?.toString();
  const targetSocketId = connectedUsers.get(salesRepId);

  console.log('salesRepId:', salesRepId);
  console.log('targetSocketId:', targetSocketId);

  if (targetSocketId) {

    io.to(targetSocketId).emit('notification', {
      type: 'order-approved',
      message: `Order #${order.id} has been approved!`,
      sender: { id: req.user!.id },
      receiver: { id: order.salesRep.id },
    });

  }
  res.json({ message: 'Order approved and stock updated' });
};

// Reject order
export const rejectOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const repo = AppDataSource.getRepository(SalesOrder);
  const notificationRepo = AppDataSource.getRepository(Notification)

  const order = await repo.findOne({
    where: { id: Number(id) },
    relations: ['salesRep'],
  });
  if (!order) {
    next(new AppError('Order not found', 404))
    return
  }
  if (order.status !== 'pending') {
    next(new AppError('Order already processed', 400))
    return
  }

  order.status = 'rejected';
  order.approvedAt = new Date();
  order.approvedBy = { id: req.user!.id } as User;

  await repo.save(order);
  
  const salesRepId = order.salesRep?.id?.toString();
  const targetSocketId = connectedUsers.get(salesRepId);

  console.log('salesRepId:', salesRepId);
  console.log('targetSocketId:', targetSocketId);

  await notificationRepo.save({
    type: 'order-rejected',
    message: `Order #${order.id} has been rejected!`,
    sender: { id: req.user!.id },
    receiver: { id: order.salesRep.id },
  });

  if (targetSocketId) {
    io.to(targetSocketId).emit('notification', {
      type: 'order-rejected',
      message: `Order #${order.id} has been rejected!`,
      sender: { id: req.user!.id },
      receiver: { id: order.salesRep.id },
    });
  }

  res.json({ message: 'Order rejected' });
};

// Mark order as paid
export const markOrderAsPaid = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const orderRepo = AppDataSource.getRepository(SalesOrder);

  const order = await orderRepo.findOneBy({ id: Number(id) });

  if (!order) {
    next(new AppError('Order not found', 404))
    return
  } 
  if (order.status !== 'approved') {
    next(new AppError('Only approved orders can be marked as paid', 400))
    return
  } 
  if (order.isPaid) {
    next(new AppError('Order is already paid', 400))
    return
  } 

  order.isPaid = true;
  order.paidAt = new Date();

  await orderRepo.save(order);
  res.json({ message: 'Order marked as paid successfully' });
};

