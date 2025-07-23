export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export const RequestStatusDisplay = {
  [RequestStatus.PENDING]: 'En attente',
  [RequestStatus.APPROVED]: 'Validée',
  [RequestStatus.REJECTED]: 'Rejetée'
};