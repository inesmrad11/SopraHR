import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }
  
  logout() {
    this.authService.logout();
  }
}
