import { createContext, useContext } from "react";

// Types
export type NotificationType = 'success' | 'warning' | 'error' | 'info';
export interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
}

// Context
export const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {}
});

export const useNotification = () => useContext(NotificationContext);