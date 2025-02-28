import React, { useState, useEffect } from "react";
import { NotificationType } from "../context/NotificationContext";

interface NotificationProps {
  type: NotificationType;
  message: string;
  duration: number;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, duration, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 100);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);
  
  return (
    <div className={`notification ${type} ${visible ? 'show' : ''}`}>
      {message}
    </div>
  );
};

export default Notification;