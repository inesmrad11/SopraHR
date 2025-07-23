export interface CreateSalaryAdvanceRequestDTO {
    requestedAmount: number;
    reason: string;
    neededDate: string; // ISO format
    repaymentMonths: number;
}
  