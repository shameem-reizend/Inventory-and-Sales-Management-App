import { useEffect, useState } from 'react';
import apiClient from '../../services/axiosInterceptor';
import { getSocket } from '../../socket';
import toast from 'react-hot-toast';

interface notificationType {
    id: number;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<notificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
    const fetchNotifications = async () => {
        const response = await apiClient.get("api/notifications");
        const data = response.data;
        setNotifications(data.notifications);
    }

    const unreadNotification = async () => {
        const response = await apiClient.get("api/notifications/unread");
        const data = response.data;
        setUnreadCount(data.count);
    }

    const markAllAsRead = async () => {
        const response = await apiClient.put('api/notifications/mark-as-read');
        const data = response.data;
        if(data.message){
            setIsOpen(false);
        }
    }
    const readNotification = async (id: number) => {
        try{
            setNotifications(prev => prev.map(notification => notification.id === id ? {...notification, isRead: true}: notification))

            await apiClient.put(`api/notifications/${id}/read`);
        } catch(error) {
            setNotifications(prev => prev.map(notification => notification.id === id ? {...notification, isRead: false}: notification))
            console.log("Failed to mark notification as read", error)
        }
        
    }


  useEffect(() => {
    
    fetchNotifications();
    unreadNotification();
  }, [notifications])


  useEffect(() => {
    const socket = getSocket();
    
    const handleNotification = (data: notificationType) => {
        toast(data.message);
        console.log(data.message);
        setNotifications((prev) => [data, ...prev]);
    };

    socket.on('notification', handleNotification);

    return () => {
        socket.off('notification', handleNotification);
    };
  })

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
       
        
        <div className="relative">
        {/* Notification Bell Icon with Count */}
        <button 
            onClick={toggleNotifications}
            className="p-2 rounded-full bg-gray-100 dark:hover:bg-gray-700 relative"
        >
            <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-gray-600 dark:text-gray-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            >
            <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
            />
            </svg>
            
            {/* Notification Count Badge */}
            {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                {unreadCount}
            </span>
            )}
        </button>

        {/* Notification Dropdown */}
        {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700 min-h-80">
            <div className="py-1">
                {/* Header */}
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
                <button onClick={markAllAsRead} className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    Mark all as read
                </button>
                </div>
                
                {/* Notification List */}
                <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                    <div 
                        key={notification.id}
                        onClick={() => readNotification(notification.id)}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.isRead ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
                    >
                        <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <div className={`h-2 w-2 rounded-full ${!notification.isRead ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notification.createdAt}
                            </p>
                        </div>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="px-4 py-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No new notifications</p>
                    </div>
                )}
                </div>
                
            </div>
            </div>
        )}
        </div>
    </div>
  );
};