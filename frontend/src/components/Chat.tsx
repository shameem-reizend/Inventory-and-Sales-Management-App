import { useEffect, useState } from 'react';
import { getSocket } from '../socket';

export const Chat = () => {
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const socket = getSocket();

    const handleNotification = (data: { message: string }) => {
      console.log('Notification received:', data);
      setNotifications((prev) => [data.message, ...prev]);
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">🔔 Notifications</h2>
      <ul className="list-disc pl-6 text-sm">
        {notifications.map((n, idx) => (
          <li key={idx}>{n}</li>
        ))}
      </ul>
    </div>
  );
};
