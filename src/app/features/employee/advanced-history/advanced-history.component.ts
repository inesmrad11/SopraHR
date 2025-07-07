import { Component } from '@angular/core';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-advanced-history',
  standalone: true,
  imports: [StatusBadgeComponent, RouterModule],
  templateUrl: './advanced-history.component.html',
  styleUrls: ['./advanced-history.component.scss']
})
export class AdvancedHistoryComponent {
  requests = [
    { id: 1, amount: 1000, submitted: '2024-06-01', needed: '2024-06-10', status: 'PENDING' },
    { id: 2, amount: 500, submitted: '2024-05-15', needed: '2024-05-20', status: 'APPROVED' },
    // ...fetch from API in real app
  ];
} 