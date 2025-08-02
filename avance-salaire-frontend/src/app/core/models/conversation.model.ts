export interface Conversation {
  id: number;
  requestId: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  employeeProfilePicture: string | null;
  requestAmount: number;
  requestStatus: string;
  lastMessage: string;
  lastMessageTime: Date | null;
  unreadCount: number;
  isSelected: boolean;
}

export interface Message {
  id: number;
  conversationId: number;
  authorId: number;
  authorName: string;
  authorRole: string;
  message: string;
  type: string;
  createdAt: Date;
  isRead: boolean;
} 