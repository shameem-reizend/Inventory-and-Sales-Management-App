import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';

// Get all users
export const getUsers = async (_: Request, res: Response): Promise<void> => {
  const userRepo = AppDataSource.getRepository(User);
  const users = await userRepo.find({ select: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'] });
  res.json(users);
};

// Add new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const userRepo = AppDataSource.getRepository(User);
  const { name, email, password, role } = req.body;

  const existing = await userRepo.findOneBy({ email });
  if (existing) {
    res.status(400).json({ message: 'Email already exists' });
    return 
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = userRepo.create({ name, email, password: hashed, role });
  await userRepo.save(user);

  res.status(201).json({ message: 'User created' });
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const userRepo = AppDataSource.getRepository(User);
  const { id } = req.params;
  const { name, role, isActive } = req.body;

  const user = await userRepo.findOneBy({ id: Number(id) });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return 
  }

  user.name = name ?? user.name;
  user.role = role ?? user.role;
  user.isActive = isActive ?? user.isActive;

  await userRepo.save(user);
  res.json({ message: 'User updated' });
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const userRepo = AppDataSource.getRepository(User);
  const { id } = req.params;

  const user = await userRepo.findOneBy({ id: Number(id) });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return 
  }

  await userRepo.remove(user);
  res.json({ message: 'User deleted' });
};
