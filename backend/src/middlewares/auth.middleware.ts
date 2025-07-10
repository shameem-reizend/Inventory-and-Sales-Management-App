import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RequestHandler } from 'react-router-dom';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
    req.user = decoded;
    next();
  } catch (err) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: Access denied' });
      return;
    }
    next();
  };
};
