import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  const userRepo = AppDataSource.getRepository(User);
  const { name, email, password, role } = req.body;

  try {
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ message: 'Email already in use' });
      return 
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = userRepo.create({ name, email, password: hashed, role });
    await userRepo.save(user);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const userRepo = AppDataSource.getRepository(User);
  const { email, password } = req.body;

  try {
    const user = await userRepo.findOne({ where: { email } });
    if (!user){
      res.status(404).json({ message: 'User not found' });
      return
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch){
       res.status(401).json({ message: 'Invalid credentials' });
       return
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const refreshToken = (req: Request, res: Response): void => {
  const token = req.cookies.refreshToken;
  if (!token){
    res.status(401).json({ message: 'No refresh token' });
    return
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: number };
    const newAccessToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  const userRepo = AppDataSource.getRepository(User);
  const userId = req.user?.id; // Assuming user ID is set in req.user by middleware

  if (!userId){
    res.status(401).json({ message: 'Unauthorized' });
    return
  }

  try {
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user){
      res.status(404).json({ message: 'User not found' });
      return
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};