import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
import { BreadcrumbComponent, BreadcrumbItem } from 'src/app/theme/shared/components/breadcrumb/breadcrumb.component';
import { IconService, IconDirective } from '@ant-design/icons-angular';
import { 
  SearchOutline, 
  BellOutline, 
  DownloadOutline, 
  CloseOutline, 
  ToolOutline, 
  EyeOutline, 
  CheckOutline, 
  ExclamationCircleOutline
} from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-hr-requests',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, ValidationModal, FormsModule, RouterModule, BreadcrumbComponent, IconDirective],
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
  // Filter properties
  filterName = '';
  filterFrom = '';
  filterTo = '';
  // Suppression de filterStatus car on ne traite que les demandes en attente

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  itemsPerPageOptions = [5, 10, 15, 25];
  statusList = [RequestStatus.PENDING, RequestStatus.APPROVED, RequestStatus.REJECTED];
  private ws$?: WebSocketSubject<any>;
  successMessage = '';
  errorMessage = '';
  selectedRequest: SalaryAdvanceRequest | null = null;
  modalComment: string = '';
  modalLoading: boolean = false;
  modalError: string = '';
  
  // Nouvelles propriétés pour le design harmonisé
  showSearch = false;
  showNotifications = false;
  showFilters = false;
  currentDate = new Date();
  notifications: any[] = [];
  
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Accueil', route: '/hr/hr-statistics' },
    { label: 'Toutes les demandes', active: true }
  ];

  private iconService = inject(IconService);

  constructor(private salaryAdvanceService: SalaryAdvanceService) {
    // Add Ant Design icons
    this.iconService.addIcon(
      SearchOutline, 
      BellOutline, 
      DownloadOutline, 
      CloseOutline, 
      ToolOutline, 
      EyeOutline, 
      CheckOutline, 
      ExclamationCircleOutline
    );
  }

  get filteredRequests() {
    return this.requests.filter(req => {
      const matchesName = !this.filterName || (req.employeeFullName || '').toLowerCase().includes(this.filterName.toLowerCase());
      const date = new Date(req.requestDate);
      const from = this.filterFrom ? new Date(this.filterFrom) : null;
      const to = this.filterTo ? new Date(this.filterTo) : null;
      const matchesFrom = !from || date >= from;
      const matchesTo = !to || date <= to;
      
      // Seulement les demandes en attente de traitement
      const isPending = req.status === RequestStatus.PENDING;
      
      return matchesName && matchesFrom && matchesTo && isPending;
    });
  }

  // Pagination methods
  get paginatedRequests() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredRequests.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRequests.length / this.itemsPerPage);
  }

  get paginationInfo(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredRequests.length);
    return `${start}-${end} sur ${this.filteredRequests.length}`;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1; // Reset to first page when changing items per page
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  get pendingRequests(): number {
    return this.requests.filter(req => req.status === RequestStatus.PENDING).length;
  }

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

  // Nouvelles méthodes pour le design harmonisé
  toggleSearch() {
    this.showSearch = !this.showSearch;
  }

  closeSearch() {
    this.showSearch = false;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  closeNotifications() {
    this.showNotifications = false;
  }


  getEmployeeInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  hasProfilePicture(request: SalaryAdvanceRequest): boolean {
    return !!request.employeeProfilePicture;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'block';
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'check-circle';
      case 'warning': return 'exclamation-circle';
      case 'error': return 'close-circle';
      case 'info': return 'info-circle';
      default: return 'bell';
    }
  }

  approveRequest(req: SalaryAdvanceRequest) {
    // Vérification préalable pour éviter les actions multiples
    if (req.status !== 'PENDING') {
      this.showError('Cette demande ne peut plus être validée.');
      return;
    }

    this.salaryAdvanceService.approveRequest(req.id, '').subscribe({
      next: () => {
        this.showSuccess('Demande validée avec succès.');
        this.fetchRequests();
      },
      error: (err) => {
        this.handleError(err, 'validation');
      }
    });
  }

  rejectRequest(req: SalaryAdvanceRequest) {
    // Vérification préalable pour éviter les actions multiples
    if (req.status !== 'PENDING') {
      this.showError('Cette demande ne peut plus être rejetée.');
      return;
    }

    this.salaryAdvanceService.rejectRequest(req.id, '').subscribe({
      next: () => {
        this.showSuccess('Demande rejetée avec succès.');
        this.fetchRequests();
      },
      error: (err) => {
        this.handleError(err, 'rejet');
      }
    });
  }

  applyFilters() {
    // Les filtres sont appliqués automatiquement via le getter filteredRequests
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  clearFilters() {
    this.filterFrom = '';
    this.filterTo = '';
    this.applyFilters();
  }

  // Méthodes pour la gestion professionnelle des messages
  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = ''; // Effacer les erreurs précédentes
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = ''; // Effacer les succès précédents
    setTimeout(() => {
      this.errorMessage = '';
    }, 6000);
  }

  private handleError(err: any, action: string): void {
    let errorMessage = '';
    
    // Gestion spécifique des erreurs selon le type
    if (err.status === 400) {
      errorMessage = `Action impossible : ${err.error?.message || 'Données invalides'}`;
    } else if (err.status === 403) {
      errorMessage = 'Vous n\'avez pas les permissions pour effectuer cette action.';
    } else if (err.status === 404) {
      errorMessage = 'La demande n\'existe plus ou a été supprimée.';
    } else if (err.status === 409) {
      errorMessage = 'Cette demande a déjà été traitée par un autre utilisateur.';
    } else if (err.status >= 500) {
      errorMessage = 'Erreur serveur. Veuillez réessayer dans quelques instants.';
    } else {
      errorMessage = `Erreur lors du ${action} : ${err.error?.message || err.message || 'Erreur inconnue'}`;
    }

    this.showError(errorMessage);
  }
}
