import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Product } from '../entities/Product';
import { SalesOrderItem } from '../entities/SalesOrderItem';
import { AppError } from '../utils/AppError';

// Get all products
export const getProducts = async (_: Request, res: Response): Promise<void> => {
  const repo = AppDataSource.getRepository(Product);
  const products = await repo.find();
  res.json(products);
};

// Get single product
export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const repo = AppDataSource.getRepository(Product);
  const { id } = req.params;
  const product = await repo.findOneBy({ id: Number(id) });

  if (!product){
    next(new AppError('Product Not Found', 404))
    return
  }
  res.json(product);
};

export const getTopSellingProducts = async (_: Request, res: Response): Promise<void> => {
  const repo = AppDataSource.getRepository(SalesOrderItem);
  const products = await repo.find();

  const maxQuantityProduct = products.reduce((max, curr) =>
    curr.quantity > max.quantity ? curr : max
  );
  res.json(maxQuantityProduct);
};

// Create product
export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const repo = AppDataSource.getRepository(Product);
  const { name, sku, category, unitPrice, stock } = req.body;

  const existing = await repo.findOneBy({ sku });
  if (existing){
    next(new AppError('SKU already exists', 400))
    return 
  }

  const product = repo.create({ name, sku, category, unitPrice, stock });
  await repo.save(product);

  res.status(201).json({ message: 'Product created successfully' });
};

// Update product
export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const repo = AppDataSource.getRepository(Product);
  const { id } = req.params;
  const { name, sku, category, unitPrice, stock, isActive } = req.body;

  const product = await repo.findOneBy({ id: Number(id) });
  if (!product){
    next(new AppError('Product not found', 404));
    return
  }

  product.name = name ?? product.name;
  product.sku = sku ?? product.sku;
  product.category = category ?? product.category;
  product.unitPrice = unitPrice ?? product.unitPrice;
  product.stock = stock ?? product.stock;
  product.isActive = isActive ?? product.isActive;

  await repo.save(product);
  res.json({ message: 'Product updated successfully' });
};

// Delete product
export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const repo = AppDataSource.getRepository(Product);
  const { id } = req.params;

  const product = await repo.findOneBy({ id: Number(id) });
  if (!product){ 
    next(new AppError('Product not found', 404));
    return
  }

  await repo.remove(product);
  res.json({ message: 'Product deleted successfully' });
};
