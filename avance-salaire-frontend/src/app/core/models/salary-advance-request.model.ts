import { RequestStatus } from './request-status.enum';

export interface SalaryAdvanceRequest {
  id: number;
  requestedAmount: number;
  reason: string;
  status: RequestStatus;
  requestDate: string;       // ISO string
  neededDate: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  employeeFullName?: string;
  approvedByFullName?: string;
  isFullyPaid?: boolean; // true if advance is fully paid
  repaymentProgress?: number; // 0-100, percent paid
  employeeId?: number; // id of the employee who made the request
  employeeEmail?: string; // email of the employee who made the request
  employeeProfilePicture?: string; // profile picture of the employee who made the request
  repaymentMonths: number;
  employeeSalaryNet?: number;
  plafondDisponible?: number;
  totalAvancesNonRemboursees?: number;
}
