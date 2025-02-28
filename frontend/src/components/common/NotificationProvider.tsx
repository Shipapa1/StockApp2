import React, { useState } from "react";
import { NotificationContext, NotificationType } from "../context/NotificationContext";
import Notification from "./Notification";

interface NotificationProviderProps {
  children: React.ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Array<{ id: number; type: NotificationType; message: string; duration: number }>>([]);
  const nextId = React.useRef(0);

  const showNotification = (type: NotificationType, message: string, duration = 3000) => {
    const id = nextId.current++;
    setNotifications(prev => [...prev, { id, type, message, duration }]);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="notification-container">
        {notifications.map(({ id, type, message, duration }) => (
          <Notification 
            key={id}
            type={type}
            message={message}
            duration={duration}
            onClose={() => setNotifications(prev => prev.filter(n => n.id !== id))}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;