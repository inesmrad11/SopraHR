import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { IconService, IconDirective } from '@ant-design/icons-angular';
import { 
  ReloadOutline, 
  CloseOutline, 
  DollarOutline, 
  CreditCardOutline, 
  ExclamationCircleOutline, 
  CheckOutline 
} from '@ant-design/icons-angular/icons';
import { SalaryAdvanceService } from '../../../core/services/salary-advance.service';
import { SalaryAdvanceRequest } from '../../../core/models/salary-advance-request.model';
import { RequestStatus } from '../../../core/models/request-status.enum';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BreadcrumbComponent, BreadcrumbItem } from 'src/app/theme/shared/components/breadcrumb/breadcrumb.component';

const STATUS_MAP = {
  PENDING: 'En attente',
  APPROVED: 'Validée',
  REJECTED: 'Rejetée'
};
const STATUS_ORDER = ['PENDING', 'APPROVED', 'REJECTED'];

@Component({
  selector: 'app-tableau-kanban-rh',
  standalone: true,
  imports: [CommonModule, DragDropModule, BreadcrumbComponent, IconDirective],
  templateUrl: './tableau-kanban-rh.html',
  styleUrl: './tableau-kanban-rh.scss'
})
export class TableauKanbanRHComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Accueil', route: '/hr/hr-statistics' },
    { label: 'Kanban', active: true }
  ];
  columns: { 
    key: string; 
    label: string; 
    color: string; 
    requests: SalaryAdvanceRequest[] 
  }[] = [];
  
  loading = false;
  error = '';
  toast: string = '';
  safeToast: SafeHtml = '';
  lastAction: { 
    request: SalaryAdvanceRequest; 
    from: string; 
    to: string 
  } | null = null;
  undoTimeout: any = null;
  toastAction: (() => void) | null = null;
  selectedRequest: SalaryAdvanceRequest | null = null;

  private iconService = inject(IconService);

  constructor(private salaryAdvanceService: SalaryAdvanceService, private sanitizer: DomSanitizer) {
    // Add Ant Design icons
    this.iconService.addIcon(
      ReloadOutline, 
      CloseOutline, 
      DollarOutline, 
      CreditCardOutline, 
      ExclamationCircleOutline, 
      CheckOutline
    );
  }

  ngOnInit() {
    this.fetchRequests();
  }

  drop(event: CdkDragDrop<SalaryAdvanceRequest[]>, targetStatus: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const request = event.previousContainer.data[event.previousIndex];
      // Changement de statut immédiat, sans confirmation
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      const fromStatus = event.previousContainer.id.replace('cdk-drop-list-', '');
      this.salaryAdvanceService.changeRequestStatus(request.id, targetStatus).subscribe({
        next: () => {
          this.setToast(`Statut mis à jour: ${STATUS_MAP[targetStatus]}`);
          this.lastAction = { request, from: fromStatus, to: targetStatus };
          clearTimeout(this.undoTimeout);
          this.undoTimeout = setTimeout(() => {
            this.toast = '';
            this.lastAction = null;
          }, 5000);
        },
        error: (err) => {
          this.setToast(err.message || 'Erreur lors du changement de statut.');
          setTimeout(() => this.toast = '', 2500);
          // Revert visuel si erreur
          transferArrayItem(event.container.data, event.previousContainer.data, event.currentIndex, event.previousIndex);
        }
      });
    }
  }

  onUndo() {
    if (!this.lastAction) return;
    
    const { request, from, to } = this.lastAction;
    
    // Revert visuel
    const fromCol = this.columns.find(c => c.key === from);
    const toCol = this.columns.find(c => c.key === to);
    
    if (toCol && fromCol) {
      const idx = toCol.requests.findIndex(r => r.id === request.id);
      if (idx > -1) {
        fromCol.requests.push(request);
        toCol.requests.splice(idx, 1);
      }
    }
    
    // Revert API
    this.salaryAdvanceService.changeRequestStatus(request.id, from).subscribe({
      next: () => {
        this.showToast('Changement annulé.', false);
        this.clearUndoTimeout();
        this.lastAction = null;
      },
      error: (err) => {
        this.showToast('Erreur lors de l\'annulation.', false);
      }
    });
  }

  private showToast(message: string, showUndo: boolean) {
    if (showUndo) {
      this.setToast(`${message} <button class='btn btn-outline undo-btn' onclick='this.onUndo()'>Annuler</button>`);
    } else {
      this.setToast(message);
      setTimeout(() => this.toast = '', 3000);
    }
  }

  private setToast(html: string) {
    this.toast = html;
    this.safeToast = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private clearUndoTimeout() {
    if (this.undoTimeout) {
      clearTimeout(this.undoTimeout);
      this.undoTimeout = null;
    }
  }

  get columnsKeys() {
    return this.columns.map(c => c.key);
  }

  // Méthodes pour la gestion des priorités basées sur le montant
  getPriorityClass(amount: number): string {
    if (amount >= 5000) return 'high-priority';
    if (amount >= 2000) return 'medium-priority';
    return 'low-priority';
  }

  getPriorityLabel(amount: number): string {
    if (amount >= 5000) return 'Haute';
    if (amount >= 2000) return 'Moyenne';
    return 'Basse';
  }

  // Méthodes pour les statistiques
  getTotalRequests(): number {
    return this.columns.reduce((total, col) => total + col.requests.length, 0);
  }

  getTotalAmount(): number {
    return this.columns.reduce((total, col) => 
      total + col.requests.reduce((colTotal, req) => colTotal + req.requestedAmount, 0), 0
    );
  }

  openDetails(req: SalaryAdvanceRequest) {
    this.selectedRequest = req;
  }

  closeDetailsModal() {
    this.selectedRequest = null;
  }

  ngOnDestroy() {
    this.clearUndoTimeout();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'EN ATTENTE';
      case 'APPROVED': return 'VALIDÉE';
      case 'REJECTED': return 'REJETÉE';
      default: return status;
    }
  }

  // Ajoutez ces méthodes à votre composant TableauKanbanRHComponent

// Détermine si une carte doit afficher le gradient animé
shouldShowGradient(req: SalaryAdvanceRequest): boolean {
  // Afficher le gradient pour les montants élevés ou selon d'autres critères
  return req.requestedAmount > 3000 || req.status === RequestStatus.APPROVED;
}

// Détermine si une carte doit afficher le motif en damier
shouldShowPattern(req: SalaryAdvanceRequest): boolean {
  // Afficher le motif pour les demandes en attente avec certains critères
  return req.status === RequestStatus.PENDING && req.requestedAmount > 2000;
}

// Retourne la classe CSS pour le tag basé sur le statut et le montant
getTagClass(req: SalaryAdvanceRequest): string {
  const baseClass = 'card-tag';
  
  if (req.requestedAmount >= 5000) {
    return `${baseClass} tag-research`;
  } else if (req.requestedAmount >= 3000) {
    return `${baseClass} tag-branding`;
  } else if (req.requestedAmount >= 2000) {
    return `${baseClass} tag-data-science`;
  } else if (req.repaymentMonths <= 6) {
    return `${baseClass} tag-ux-stage`;
  } else {
    return `${baseClass} tag-mobile`;
  }
}

// Mise à jour de la méthode fetchRequests pour inclure les nouvelles couleurs
fetchRequests() {
  this.loading = true;
  this.salaryAdvanceService.getAllRequests().subscribe({
    next: (data) => {
      this.columns = [
        { 
          key: RequestStatus.PENDING, 
          label: 'En attente', 
          color: '#e3f0ff', // Soft blue
          requests: data.filter(r => r.status === RequestStatus.PENDING) 
        },
        { 
          key: RequestStatus.APPROVED, 
          label: 'Validée', 
          color: '#e6f9ed', // Soft green
          requests: data.filter(r => r.status === RequestStatus.APPROVED) 
        },
        { 
          key: RequestStatus.REJECTED, 
          label: 'Rejetée', 
          color: '#ffeaea', // Soft red
          requests: data.filter(r => r.status === RequestStatus.REJECTED) 
        }
      ];
      this.loading = false;
    },
    error: (err) => {
      this.error = err.message || 'Erreur lors du chargement des demandes.';
      this.loading = false;
    }
  });
}
}
