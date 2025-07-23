import { RequestStatus } from './request-status.enum';

export interface RequestHistory {
  id: number;
  requestId: number;
  previousStatus: RequestStatus;
  newStatus: RequestStatus;
  changedBy: string; // You can also use `User` if needed
  comment?: string;
  changedAt: string;
  statusChange?: string; // derived
}
