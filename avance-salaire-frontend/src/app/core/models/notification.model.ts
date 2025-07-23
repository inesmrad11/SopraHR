import { NotificationType } from './notification-type.enum';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  recipientId: number;
  relatedRequestId?: number;
  senderProfilePicture?: string;
  senderName?: string;
  senderType?: 'SYSTEM' | 'RH' | 'EMPLOYEE';
  senderId?: number;
  senderRole?: string;
}
