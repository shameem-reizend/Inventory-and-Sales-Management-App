import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import { AppError } from '../utils/AppError';

// Get all users
export const getUsers = async (_: Request, res: Response): Promise<void> => {
  const userRepo = AppDataSource.getRepository(User);
  const users = await userRepo.find({ select: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'] });
  res.json(users);
};

// Add new user
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userRepo = AppDataSource.getRepository(User);
  const { name, email, password, role } = req.body;

  const existing = await userRepo.findOneBy({ email });
  if (existing) {
    next(new AppError('Email already exists', 400))
    return 
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = userRepo.create({ name, email, password: hashed, role });
  await userRepo.save(user);

  res.status(201).json({ message: 'User created' });
};

// Update user
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userRepo = AppDataSource.getRepository(User);
  const { id } = req.params;
  const { name, email, isActive } = req.body;

  const user = await userRepo.findOneBy({ id: Number(id) });
  if (!user) {
    next(new AppError('User not found', 404));
    return 
  }

  user.name = name ?? user.name;
  user.email = email ?? user.email;
  user.isActive = isActive ?? user.isActive;

  await userRepo.save(user);
  res.json({ message: 'User updated' });
};

// Delete user
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userRepo = AppDataSource.getRepository(User);
  const { id } = req.params;

  const user = await userRepo.findOneBy({ id: Number(id) });
  if (!user) {
    next(new AppError('User not found', 404));
    return 
  }

  await userRepo.remove(user);
  res.json({ message: 'User deleted' });
};
