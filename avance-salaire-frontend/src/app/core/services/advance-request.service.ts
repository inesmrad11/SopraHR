import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SalaryAdvanceRequest } from '../models/salary-advance-request.model';
import { RequestStatus } from '../models/request-status.enum';
import { delay } from 'rxjs/operators';

export interface TimelineStep {
  label: string;
  statusCode: RequestStatus;
  isCompleted: boolean;
  isCurrent: boolean;
  isRejected: boolean;
  timestamp?: string;
  comment?: string;
}

export interface AdvanceRequestTimelineData {
  request: SalaryAdvanceRequest;
  timelineSteps: TimelineStep[];
  overallProgress: number;
  timeLeftOrElapsed: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdvanceRequestService {
  private apiUrl = 'http://localhost:9009/api/advance-requests';

  constructor(private http: HttpClient) { }

  getAdvanceRequestTimeline(requestId: number): Observable<AdvanceRequestTimelineData> {
    const mockRequests: SalaryAdvanceRequest[] = [
      {
        id: 1,
        requestedAmount: 750,
        reason: "Besoin urgent pour réparations de voiture.",
        status: RequestStatus.PENDING,
        requestDate: new Date(2025, 6, 1, 10, 0).toISOString(),
        neededDate: new Date(2025, 6, 15).toISOString(),
        createdAt: new Date(2025, 6, 1, 10, 0).toISOString(),
        updatedAt: new Date(2025, 6, 2, 14, 30).toISOString(),
        employeeFullName: "Alice Dupont",
        employeeId: 101,
        repaymentMonths: 3
      },
      {
        id: 2,
        requestedAmount: 1500,
        reason: "Achat d'un nouvel équipement informatique pour le télétravail.",
        status: RequestStatus.APPROVED,
        requestDate: new Date(2025, 5, 10, 9, 0).toISOString(),
        neededDate: new Date(2025, 5, 20).toISOString(),
        approvedAt: new Date(2025, 5, 12, 11, 0).toISOString(),
        createdAt: new Date(2025, 5, 10, 9, 0).toISOString(),
        updatedAt: new Date(2025, 5, 12, 11, 0).toISOString(),
        employeeFullName: "Bob Martin",
        employeeId: 102,
        approvedByFullName: "Carole Lefevre (RH)",
        repaymentMonths: 3
      },
      {
        id: 3,
        requestedAmount: 300,
        reason: "Frais médicaux imprévus.",
        status: RequestStatus.REJECTED,
        requestDate: new Date(2025, 6, 5, 11, 0).toISOString(),
        neededDate: new Date(2025, 6, 10).toISOString(),
        rejectionReason: "La demande dépasse le plafond autorisé pour les avances de salaire.",
        createdAt: new Date(2025, 6, 5, 11, 0).toISOString(),
        updatedAt: new Date(2025, 6, 6, 9, 0).toISOString(),
        employeeFullName: "David Bernard",
        employeeId: 103,
        approvedByFullName: "Eve Dubois (RH)",
        repaymentMonths: 3
      }
    ];

    const request = mockRequests.find(req => req.id === requestId);

    if (!request) {
      return of({
        request: null as any,
        timelineSteps: [],
        overallProgress: 0,
        timeLeftOrElapsed: "Demande introuvable"
      }).pipe(delay(500));
    }

    const workflowOrder: RequestStatus[] = [
      RequestStatus.PENDING,
      RequestStatus.APPROVED
    ];

    const timelineSteps: TimelineStep[] = [];
    let completedStepsCount = 0;

    for (let i = 0; i < workflowOrder.length; i++) {
      const status = workflowOrder[i];
      const step: TimelineStep = {
        label: this.getStepLabel(status),
        statusCode: status,
        isCompleted: false,
        isCurrent: false,
        isRejected: false,
        timestamp: undefined,
        comment: undefined
      };

      if (request.status === RequestStatus.REJECTED) {
        if (status === RequestStatus.PENDING) {
            step.isCompleted = true;
            step.timestamp = request.requestDate;
            step.comment = `Raison de la demande : "${request.reason}"`;
            completedStepsCount++;
        } else if (status === request.status) {
            step.isRejected = true;
            step.timestamp = request.updatedAt;
            step.comment = `Raison du rejet par RH : "${request.rejectionReason}"`;
        } else {
            step.isCompleted = false;
        }
      } else {
        const isPastStep = workflowOrder.indexOf(request.status) > i;
        const isCurrentStep = request.status === status;

        if (isPastStep) {
          step.isCompleted = true;
          completedStepsCount++;
          switch (status) {
            case RequestStatus.PENDING:
              step.timestamp = request.requestDate;
              step.comment = `Raison de la demande : "${request.reason}"`;
              break;
            case RequestStatus.APPROVED:
              step.timestamp = request.approvedAt;
              step.comment = `Approuvée par ${request.approvedByFullName || 'RH'}`;
              break;
          }
        } else if (isCurrentStep) {
          step.isCurrent = true;
          if (status === RequestStatus.PENDING) {
            step.comment = `Raison de la demande : "${request.reason}"`;
          } else if (status === RequestStatus.APPROVED) {
            step.comment = `En attente d'approbation.`;
          }
        }
      }
      timelineSteps.push(step);
    }

    const overallProgress = (completedStepsCount / workflowOrder.length) * 100;

    const neededDate = new Date(request.neededDate);
    const now = new Date();
    const diffTime = neededDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let timeLeftOrElapsed: string;
    if (diffDays > 0) {
      timeLeftOrElapsed = `${diffDays} jour(s) restant(s)`;
    } else if (diffDays < 0) {
      timeLeftOrElapsed = `${Math.abs(diffDays)} jour(s) écoulé(s)`;
    } else {
      timeLeftOrElapsed = "Aujourd'hui";
    }

    if (request.status === RequestStatus.REJECTED) {
      const rejectedStep: TimelineStep = {
        label: "Demande Rejetée",
        statusCode: RequestStatus.REJECTED,
        isCompleted: false,
        isCurrent: false,
        isRejected: true,
        timestamp: request.updatedAt,
        comment: `Raison du rejet par RH : "${request.rejectionReason}"`
      };
      const rejectedIndex = timelineSteps.findIndex(s => s.statusCode === RequestStatus.REJECTED);
      if (rejectedIndex === -1) {
        timelineSteps.push(rejectedStep);
      } else {
        timelineSteps[rejectedIndex] = rejectedStep;
      }
    }

    return of({
      request: request,
      timelineSteps: timelineSteps,
      overallProgress: overallProgress,
      timeLeftOrElapsed: timeLeftOrElapsed
    }).pipe(delay(1000));
  }

  getRequestHistory(requestId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/advance-requests/${requestId}/history`);
  }

  getRequestById(id: number) {
    return this.http.get<SalaryAdvanceRequest>(`/api/advance-requests/${id}`);
  }

  getRichTimeline(requestId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${requestId}/steps`);
  }

  getComments(requestId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${requestId}/comments`);
  }

  addComment(requestId: number, comment: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${requestId}/comments`, comment);
  }

  getAllRequests(): Observable<SalaryAdvanceRequest[]> {
    return this.http.get<SalaryAdvanceRequest[]>(`${this.apiUrl}`);
  }

  private getStepLabel(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.PENDING: return "Demande Soumise";
      case RequestStatus.APPROVED: return "Demande Approuvée";
      case RequestStatus.REJECTED: return "Demande Rejetée";
      default: return "Statut Inconnu";
    }
  }
} 