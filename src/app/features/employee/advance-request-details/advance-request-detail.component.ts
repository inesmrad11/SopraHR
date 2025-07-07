import { Component } from '@angular/core';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';

@Component({
  selector: 'app-advance-request-detail',
  standalone: true,
  imports: [StatusBadgeComponent],
  templateUrl: './advance-request-detail.component.html',
  styleUrls: ['./advance-request-detail.component.scss']
})
export class AdvanceRequestDetailComponent {
  // In a real app, fetch the request by ID from the API
  request = {
    id: 1,
    amount: 1000,
    submitted: '2024-06-01',
    needed: '2024-06-10',
    reason: 'Urgent besoin',
    status: 'PENDING',
    history: [
      { date: '2024-06-01', status: 'PENDING', comment: 'Demande créée' }
      // ...more history
    ]
  };
} 