import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RequestActivity {
  type: 'SUBMISSION' | 'COMMENT' | 'VALIDATION' | 'REJECTION' | 'PAYMENT' | 'CLOSURE' | 'UPDATE' | 'REMINDER';
  status: 'pending' | 'approved' | 'rejected';
  actor: string;
  actorRole?: string;
  comment?: string;
  timestamp: string;
  details?: string;
}

@Component({
  selector: 'app-snake-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request-activity-timeline.component.html',
  styleUrls: ['./request-activity-timeline.component.scss']
})
export class SnakeTimelineComponent implements OnInit {
  @Input() activities: RequestActivity[] = [];
  hoveredStep: number | null = null;

  ngOnInit() {}

  isStepCompleted(index: number): boolean {
    return this.activities[index]?.status === 'approved';
  }

  isStepActive(index: number): boolean {
    // Optionally, highlight the last approved or first pending
    const firstPending = this.activities.findIndex(a => a.status === 'pending');
    return index === (firstPending === -1 ? this.activities.length - 1 : firstPending);
  }

  isStepPending(index: number): boolean {
    return this.activities[index]?.status === 'pending';
  }

  getCompletedStepsCount(): number {
    return this.activities.filter(a => a.status === 'approved').length;
  }

  getRemainingStepsCount(): number {
    return this.activities.length - this.getCompletedStepsCount();
  }

  getCompletionPercentage(): number {
    if (this.activities.length === 0) return 0;
    const percent = (this.getCompletedStepsCount() / this.activities.length) * 100;
    return percent > 100 ? 100 : Math.round(percent);
  }

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'SUBMISSION': 'send',
      'COMMENT': 'chat_bubble',
      'VALIDATION': 'check_circle',
      'REJECTION': 'cancel',
      'PAYMENT': 'payments',
      'CLOSURE': 'flag',
      'UPDATE': 'edit',
      'REMINDER': 'notifications'
    };
    return icons[type] || 'info';
  }

  getActionLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'SUBMISSION': 'a soumis la demande d\'avance',
      'COMMENT': 'a ajouté un commentaire',
      'VALIDATION': 'a validé la demande',
      'REJECTION': 'a rejeté la demande',
      'PAYMENT': 'a effectué le paiement',
      'CLOSURE': 'a clôturé le dossier',
      'UPDATE': 'a mis à jour la demande',
      'REMINDER': 'a envoyé un rappel'
    };
    return labels[type] || 'a effectué une action';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'approved':
        return 'check_circle';
      case 'pending':
        return 'pending';
      case 'rejected':
        return 'cancel';
      default:
        return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'approved':
        return 'Approuvée';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejetée';
      default:
        return status;
    }
  }
} 