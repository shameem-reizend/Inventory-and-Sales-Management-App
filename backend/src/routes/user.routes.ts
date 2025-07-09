import { Router } from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const userRoutes = Router();

userRoutes.use(authenticate);
userRoutes.use(authorize('admin')); // Only admin

userRoutes.get('/', getUsers);
userRoutes.post('/', createUser);
userRoutes.put('/:id', updateUser);
userRoutes.delete('/:id', deleteUser);

export default userRoutes;
