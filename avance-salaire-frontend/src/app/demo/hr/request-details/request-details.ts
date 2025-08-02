import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationModal } from '../validation-modal/validation-modal';
import { SalaryAdvanceRequest } from '../../../core/models/salary-advance-request.model';
import { RequestStatus } from '../../../core/models/request-status.enum';
import { ActivatedRoute } from '@angular/router';
import { SalaryAdvanceService } from '../../../core/services/salary-advance.service';
import { UserService } from '../../../core/services/user.service';
import { SnakeTimelineComponent, RequestActivity } from 'src/app/shared/components/request -activity-timeline/request-activity-timeline.component';
import { CommentThreadComponent } from 'src/app/shared/components/comment-thread/comment-thread.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [
    CommonModule,
    ValidationModal,
    SnakeTimelineComponent,
    CommentThreadComponent
  ],
  templateUrl: './request-details.html',
  styleUrls: ['./request-details.scss']
})
export class RequestDetails implements OnInit {
  @Input() request: SalaryAdvanceRequest | null = null;
  @Input() employee: any = null; // à remplacer par un vrai modèle si besoin
  @Input() advancesInProgress: SalaryAdvanceRequest[] = [];
  requestHistory: any[] = [];
  activities: RequestActivity[] = [];
  currentUser: User | null = null;

  RequestStatus = RequestStatus;

  modalVisible = false;
  modalAction: 'approve' | 'reject' = 'approve';
  successMessage = '';
  errorMessage = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private salaryAdvanceService: SalaryAdvanceService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
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
      // Fetch request history and map to timeline activities
      this.salaryAdvanceService.getRequestHistoryById(request.id).subscribe(history => {
        this.activities = history.map(h => ({
          type: this.mapStatusToType(h.newStatus),
          status: this.mapStatusToTimelineStatus(h.newStatus),
          actor: h.changedBy,
          timestamp: h.changedAt,
          comment: h.comment
        }));
      });
    });
  }

  private mapStatusToType(status: string): RequestActivity['type'] {
    switch (status) {
      case 'PENDING': return 'SUBMISSION';
      case 'APPROVED': return 'VALIDATION';
      case 'REJECTED': return 'REJECTION';
      default: return 'UPDATE';
    }
  }

  private mapStatusToTimelineStatus(status: string): RequestActivity['status'] {
    switch (status) {
      case 'PENDING': return 'pending';
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      default: return 'pending';
    }
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
