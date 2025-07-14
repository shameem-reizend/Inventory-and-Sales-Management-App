import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Notification } from "../entities/Notification";
import { AppError } from "../utils/AppError";

interface authenticateRequest extends Request {
      user?: {
        id: number;
        role: string;
        name?: string;
        email?: string;
        password: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
}
export const getAllUserNotification = async (req: authenticateRequest, res: Response, next: NextFunction): Promise<void> => {

    const notificationRepo = AppDataSource.getRepository(Notification);

    try{
        const notifications = await notificationRepo.find({
            where: {receiver: {id: req.user!.id}},
            relations: ['sender']
        });
    
        res.json({
            notifications
        });
    } catch(error){
        next(new AppError('Server error', 500));
    }
};

export const getAllUnreadNotifications = async (req: authenticateRequest, res: Response, next: NextFunction): Promise<void> => {

    const notificationRepo = AppDataSource.getRepository(Notification);

    try{
        const notifications = await notificationRepo.find({
            where: {
                receiver: {id: req.user!.id},
                isRead: false
            },
            relations: ['sender']
        });
    
        res.json({
            notifications,
            count: notifications.length
        });
    } catch(error){
        next(new AppError('Server error', 500));
    }
};

export const markNotificationAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const notificationRepo = AppDataSource.getRepository(Notification);

    try{
        const {notificationId} = req.params;
        console.log(notificationId)
        
        const notification = await notificationRepo.findOneBy({
                id: Number(notificationId)
        })

        if(!notification){
            next(new AppError('Notification not found', 404));
            return
        }

        notification.isRead = true;
        await notificationRepo.save(notification);

        res.status(200).json({ message: 'Notification marked as read' })

    } catch(error){
        next(new AppError('Server error', 500));
    }
}

export const markAllAsRead = async (req: authenticateRequest, res: Response, next: NextFunction): Promise<void> => {

    const notificationRepo = AppDataSource.getRepository(Notification);

    try{
        notificationRepo.update({
            receiver: {id: req.user!.id},
            isRead: false
        }, {
            isRead: true
        })

        res.status(200).json({ message: 'Notifications of user marked as read'});
    } catch(error){
        next(new AppError('Server error', 500));
    }
}

