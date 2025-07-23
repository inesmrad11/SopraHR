import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationModal } from '../validation-modal/validation-modal';
import { SalaryAdvanceRequest } from '../../../core/models/salary-advance-request.model';
import { RequestStatus } from '../../../core/models/request-status.enum';
import { ActivatedRoute } from '@angular/router';
import { SalaryAdvanceService } from '../../../core/services/salary-advance.service';
import { UserService } from '../../../core/services/user.service';
import { SnakeTimelineComponent, RequestActivity } from 'src/app/shared/components/request-activity-timeline.component';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [
    CommonModule,
    ValidationModal,
    SnakeTimelineComponent
  ],
  templateUrl: './request-details.html',
  styleUrls: ['./request-details.scss']
})
export class RequestDetails implements OnInit {
  @Input() request: SalaryAdvanceRequest | null = null;
  @Input() employee: any = null; // à remplacer par un vrai modèle si besoin
  @Input() advancesInProgress: SalaryAdvanceRequest[] = [];
  requestHistory: any[] = [];

  RequestStatus = RequestStatus;

  modalVisible = false;
  modalAction: 'approve' | 'reject' = 'approve';
  successMessage = '';
  errorMessage = '';
  loading = false;

  mockActivities: RequestActivity[] = [
    {
      type: 'SUBMISSION',
      status: 'pending',
      actor: 'John Doe',
      actorRole: 'Employé',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      comment: 'Demande initiale d’avance sur salaire.'
    },
    {
      type: 'COMMENT',
      status: 'pending',
      actor: 'John Doe',
      actorRole: 'Employé',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.5).toISOString(),
      comment: 'Merci de traiter rapidement.'
    },
    {
      type: 'VALIDATION',
      status: 'approved',
      actor: 'Expert RH',
      actorRole: 'RH',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      comment: 'Demande validée.'
    },
    {
      type: 'PAYMENT',
      status: 'approved',
      actor: 'Comptabilité',
      actorRole: 'Service Paie',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      details: 'Virement effectué sur le compte bancaire.'
    },
    {
      type: 'CLOSURE',
      status: 'approved',
      actor: 'Système',
      timestamp: new Date().toISOString(),
      details: 'Demande clôturée automatiquement après remboursement.'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private salaryAdvanceService: SalaryAdvanceService,
    private userService: UserService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.salaryAdvanceService.getRequestById(id).subscribe(request => {
      this.request = request;
      // Fetch employee details
      this.userService.getUserById(request.employeeId).subscribe(emp => this.employee = emp);
      // Fetch advances in progress for this employee
      this.salaryAdvanceService.getAllRequests().subscribe(all => {
        this.advancesInProgress = all.filter(r =>
          r.employeeId === request.employeeId &&
          r.status !== RequestStatus.REJECTED &&
          r.id !== request.id
        );
      });
      // Fetch request history
      this.salaryAdvanceService.getRequestHistoryById(request.id).subscribe(history => {
        this.requestHistory = history;
      });
    });
  }

  get statusColor() {
    switch (this.request?.status) {
      case RequestStatus.PENDING:
        return 'status-pending';
      case RequestStatus.APPROVED: return 'status-approved';
      case RequestStatus.REJECTED: return 'status-rejected';
      default: return '';
    }
  }
  getStatusLabel(status: RequestStatus) {
    switch (status) {
      case RequestStatus.PENDING:
        return 'En attente';
      case RequestStatus.APPROVED: return 'Validée';
      case RequestStatus.REJECTED: return 'Rejetée';
      default: return status;
    }
  }
  get authorizedCeiling() {
    return this.employee?.salary ? 2 * this.employee.salary : 0;
  }
  get totalInProgress() {
    return this.advancesInProgress.reduce((sum, adv) => sum + (adv.requestedAmount || 0), 0);
  }
  get availableCeiling() {
    return this.authorizedCeiling - this.totalInProgress;
  }
  onApprove() {
    this.modalVisible = true;
    this.modalAction = 'approve';
  }
  onReject() {
    this.modalVisible = true;
    this.modalAction = 'reject';
  }
  onModalConfirm(event: {action: 'approve' | 'reject', comment: string}) {
    if (!this.request) return;
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    if (event.action === 'approve') {
      this.salaryAdvanceService.approveRequest(this.request.id, event.comment).subscribe({
        next: () => {
          this.successMessage = 'Demande approuvée avec succès.';
          this.ngOnInit();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de la validation.';
        },
        complete: () => {
          this.loading = false;
          this.modalVisible = false;
        }
      });
    } else {
      this.salaryAdvanceService.rejectRequest(this.request.id, event.comment).subscribe({
        next: () => {
          this.successMessage = 'Demande rejetée avec succès.';
          this.ngOnInit();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors du rejet.';
        },
        complete: () => {
          this.loading = false;
          this.modalVisible = false;
        }
      });
    }
  }
  onModalCancel() {
    this.modalVisible = false;
  }
}
