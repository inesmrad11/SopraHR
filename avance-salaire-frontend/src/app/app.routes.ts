import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin/dashboard', component: DashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
  
  // Admin routes
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  // HR routes
  {
    path: 'hr',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['HR', 'ADMIN'] },
    children: [
      { path: 'dashboard', component: DashboardComponent }, // Using admin dashboard for now
      { path: 'analytics', component: DashboardComponent }, // Replace with actual component
      { path: 'request-management', component: DashboardComponent } // Replace with actual component
    ]
  },
  
  // Employee routes
  {
    path: 'employee',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent }, // Using admin dashboard for now
      { path: 'advanced-request', component: DashboardComponent }, // Replace with actual component
      { path: 'advanced-history', component: DashboardComponent } // Replace with actual component
    ]
  },
  
  // Catch all route
  { path: '**', redirectTo: '/login' }
];
