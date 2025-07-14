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
// userRoutes.use(); // Only admin

userRoutes.get('/', authorize('admin'), getUsers);
userRoutes.post('/', authorize('admin'), createUser);
userRoutes.put('/:id', updateUser);
userRoutes.delete('/:id', authorize('admin'), deleteUser);

export default userRoutes;
