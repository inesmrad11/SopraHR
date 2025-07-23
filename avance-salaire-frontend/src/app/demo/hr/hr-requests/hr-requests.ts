import { Component, OnInit, OnDestroy } from '@angular/core';
import { SalaryAdvanceService } from '../../../core/services/salary-advance.service';
import { SalaryAdvanceRequest } from '../../../core/models/salary-advance-request.model';
import { interval, Subscription } from 'rxjs';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { RequestStatus } from '../../../core/models/request-status.enum';
import { ValidationModal } from '../validation-modal/validation-modal';
import { FormsModule } from '@angular/forms';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hr-requests',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, ValidationModal, FormsModule, RouterModule],
  templateUrl: './hr-requests.html',
  styleUrls: ['./hr-requests.scss'],
  animations: [
    trigger('statusPop', [
      transition(':enter', [
        style({ transform: 'scale(1.2) rotate(-10deg)' }),
        animate('400ms cubic-bezier(.68,-0.55,.27,1.55)', style({ transform: 'scale(1) rotate(0)' }))
      ]),
      transition('* => *', [
        style({ transform: 'scale(1.2) rotate(-10deg)' }),
        animate('400ms cubic-bezier(.68,-0.55,.27,1.55)', style({ transform: 'scale(1) rotate(0)' }))
      ])
    ])
  ]
})
export class HrRequests implements OnInit, OnDestroy {
  requests: SalaryAdvanceRequest[] = [];
  loading = false;
  error = '';
  RequestStatus = RequestStatus;
  private refreshSub?: Subscription;
  private previousStatuses: { [id: number]: string } = {};
  modalVisible = false;
  modalAction: 'approve' | 'reject' = 'approve';
  modalRequest: SalaryAdvanceRequest | null = null;
  filterName = '';
  filterStatus = '';
  filterFrom = '';
  filterTo = '';
  statusList = [RequestStatus.PENDING, RequestStatus.APPROVED, RequestStatus.REJECTED];
  private ws$?: WebSocketSubject<any>;
  successMessage = '';
  errorMessage = '';
  loadingActionId: number | null = null;
  selectedRequest: SalaryAdvanceRequest | null = null;
  modalComment: string = '';
  modalLoading: boolean = false;
  modalError: string = '';

  get filteredRequests() {
    return this.requests.filter(req => {
      const matchesName = !this.filterName || (req.employeeFullName || '').toLowerCase().includes(this.filterName.toLowerCase());
      const matchesStatus = !this.filterStatus || req.status === this.filterStatus;
      const date = new Date(req.requestDate);
      const from = this.filterFrom ? new Date(this.filterFrom) : null;
      const to = this.filterTo ? new Date(this.filterTo) : null;
      const matchesFrom = !from || date >= from;
      const matchesTo = !to || date <= to;
      return matchesName && matchesStatus && matchesFrom && matchesTo;
    });
  }

  constructor(private salaryAdvanceService: SalaryAdvanceService) {}

  ngOnInit() {
    this.fetchRequests();
    this.refreshSub = interval(30000).subscribe(() => this.fetchRequests());
    // WebSocket pour updates temps réel
    this.ws$ = webSocket('ws://localhost:9009/ws/advance-requests');
    this.ws$.subscribe({
      next: (msg) => {
        // On rafraîchit la liste à chaque message reçu
        this.fetchRequests();
      },
      error: (err) => {
        console.warn('WebSocket error', err);
        // Optionnel : tenter de se reconnecter après un délai
      },
      complete: () => {
        console.warn('WebSocket closed');
      }
    });
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
    this.ws$?.complete();
  }

  fetchRequests() {
    this.loading = true;
    this.salaryAdvanceService.getAllRequests().subscribe({
      next: (data) => {
        this.requests.forEach(req => {
          this.previousStatuses[req.id] = req.status;
        });
        this.requests = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors du chargement des demandes.';
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-other';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'APPROVED': return '✔️';
      case 'REJECTED': return '❌';
      default: return 'ℹ️';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'EN ATTENTE';
      case 'APPROVED': return 'VALIDÉE';
      case 'REJECTED': return 'REJETÉE';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-other';
    }
  }

  isStatusChanged(request: SalaryAdvanceRequest): boolean {
    return this.previousStatuses[request.id] && this.previousStatuses[request.id] !== request.status;
  }

  onView(request: SalaryAdvanceRequest) {
    console.log('View request', request);
    // TODO: navigate or open details modal
  }

  onApprove(request: SalaryAdvanceRequest) {
    this.loadingActionId = request.id;
    this.salaryAdvanceService.approveRequest(request.id, '').subscribe({
      next: () => {
        this.successMessage = 'Demande validée avec succès.';
        this.fetchRequests();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors de la validation.';
      },
      complete: () => {
        this.loadingActionId = null;
      }
    });
  }

  onReject(request: SalaryAdvanceRequest) {
    this.loadingActionId = request.id;
    this.salaryAdvanceService.rejectRequest(request.id, '').subscribe({
      next: () => {
        this.successMessage = 'Demande rejetée avec succès.';
        this.fetchRequests();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du rejet.';
      },
      complete: () => {
        this.loadingActionId = null;
      }
    });
  }

  onModalConfirm(event: {action: 'approve' | 'reject', comment: string}) {
    if (!this.modalRequest) return;
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    const req = this.modalRequest;
    const comment = event.comment;
    if (event.action === 'approve') {
      this.salaryAdvanceService.approveRequest(req.id, comment).subscribe({
        next: () => {
          this.successMessage = 'Demande approuvée avec succès.';
          this.fetchRequests();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de l\'approbation.';
        },
        complete: () => {
          this.loading = false;
          this.modalVisible = false;
          this.modalRequest = null;
        }
      });
    } else {
      this.salaryAdvanceService.rejectRequest(req.id, comment).subscribe({
        next: () => {
          this.successMessage = 'Demande rejetée avec succès.';
          this.fetchRequests();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors du rejet.';
        },
        complete: () => {
          this.loading = false;
          this.modalVisible = false;
          this.modalRequest = null;
        }
      });
    }
  }

  onModalCancel() {
    this.modalVisible = false;
    this.modalRequest = null;
  }

  openDetails(req: SalaryAdvanceRequest) {
    this.selectedRequest = req;
    this.modalComment = '';
    this.modalLoading = false;
    this.modalError = '';
  }

  closeDetailsModal() {
    this.selectedRequest = null;
    this.modalComment = '';
    this.modalLoading = false;
    this.modalError = '';
  }

  approveSelectedRequest() {
    if (!this.selectedRequest) return;
    this.modalLoading = true;
    this.salaryAdvanceService.approveRequest(this.selectedRequest.id, this.modalComment).subscribe({
      next: () => {
        this.successMessage = 'Demande validée avec succès.';
        this.closeDetailsModal();
        this.fetchRequests();
      },
      error: (err) => {
        // Affiche le message d'erreur du backend dans la modale, sans fermer la modale ni modifier la demande
        this.modalError = err.error?.message || err.error || err.message || 'Erreur lors de la validation.';
        this.modalLoading = false;
      },
      complete: () => {
        this.modalLoading = false;
      }
    });
  }

  rejectSelectedRequest() {
    if (!this.selectedRequest) return;
    this.modalLoading = true;
    this.salaryAdvanceService.rejectRequest(this.selectedRequest.id, this.modalComment).subscribe({
      next: () => {
        this.successMessage = 'Demande rejetée avec succès.';
        this.closeDetailsModal();
        this.fetchRequests();
      },
      error: (err) => {
        this.modalError = err.message || 'Erreur lors du rejet.';
      },
      complete: () => {
        this.modalLoading = false;
      }
    });
  }
}
