import { Router } from "express";
import { getAllUnreadNotifications, getAllUserNotification, markAllAsRead, markNotificationAsRead } from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth.middleware";

const notificationRoutes = Router();

notificationRoutes.get('/', authenticate, getAllUserNotification);
notificationRoutes.get('/unread', authenticate, getAllUnreadNotifications);
notificationRoutes.put('/:notificationId/read', markNotificationAsRead);
notificationRoutes.put('/mark-as-read', authenticate, markAllAsRead);

export default notificationRoutes;