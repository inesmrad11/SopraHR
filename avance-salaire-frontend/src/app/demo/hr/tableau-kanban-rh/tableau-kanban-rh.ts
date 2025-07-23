import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SalaryAdvanceService } from '../../../core/services/salary-advance.service';
import { SalaryAdvanceRequest } from '../../../core/models/salary-advance-request.model';
import { RequestStatus } from '../../../core/models/request-status.enum';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const STATUS_MAP = {
  PENDING: 'En attente',
  APPROVED: 'Validée',
  REJECTED: 'Rejetée'
};
const STATUS_ORDER = ['PENDING', 'APPROVED', 'REJECTED'];

@Component({
  selector: 'app-tableau-kanban-rh',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './tableau-kanban-rh.html',
  styleUrl: './tableau-kanban-rh.scss'
})
export class TableauKanbanRHComponent implements OnInit {
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

  constructor(private salaryAdvanceService: SalaryAdvanceService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.fetchRequests();
  }

  fetchRequests() {
    this.loading = true;
    this.salaryAdvanceService.getAllRequests().subscribe({
      next: (data) => {
        this.columns = [
          { key: RequestStatus.PENDING, label: 'En attente', color: '#4b2067', requests: data.filter(r => r.status === RequestStatus.PENDING) },
          { key: RequestStatus.APPROVED, label: 'Validée', color: '#a728a7', requests: data.filter(r => r.status === RequestStatus.APPROVED) },
          { key: RequestStatus.REJECTED, label: 'Rejetée', color: '#fbb034', requests: data.filter(r => r.status === RequestStatus.REJECTED) }
        ];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors du chargement des demandes.';
        this.loading = false;
      }
    });
  }

  drop(event: CdkDragDrop<SalaryAdvanceRequest[]>, targetStatus: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const request = event.previousContainer.data[event.previousIndex];
      // Remplacer la confirmation navigateur par un toast custom
      if ((targetStatus === 'APPROVED' || targetStatus === 'REJECTED')) {
        this.setToast(`Confirmer le passage en « ${STATUS_MAP[targetStatus]} » ? <button class='btn btn-primary kanban-toast-btn' id='confirm-toast-btn'>Confirmer</button> <button class='btn btn-outline kanban-toast-btn' id='cancel-toast-btn'>Annuler</button>`);
        this.toastAction = () => {
          // Mise à jour visuelle immédiate
          transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
          const fromStatus = event.previousContainer.id.replace('cdk-drop-list-', '');
          this.salaryAdvanceService.changeRequestStatus(request.id, targetStatus).subscribe({
            next: () => {
              this.setToast(`Statut mis à jour: ${STATUS_MAP[targetStatus]} <button class='btn btn-outline undo-btn'>Annuler</button>`);
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
        };
        setTimeout(() => {
          const confirmBtn = document.getElementById('confirm-toast-btn');
          const cancelBtn = document.getElementById('cancel-toast-btn');
          if (confirmBtn) confirmBtn.onclick = () => { this.toast = ''; this.toastAction && this.toastAction(); this.toastAction = null; };
          if (cancelBtn) cancelBtn.onclick = () => { this.toast = ''; this.toastAction = null; };
        }, 0);
        return;
      }
      // Si pas de confirmation nécessaire
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      const fromStatus = event.previousContainer.id.replace('cdk-drop-list-', '');
      this.salaryAdvanceService.changeRequestStatus(request.id, targetStatus).subscribe({
        next: () => {
          this.setToast(`Statut mis à jour: ${STATUS_MAP[targetStatus]} <button class='btn btn-outline undo-btn'>Annuler</button>`);
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
}