import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'advance-request-list',
    pathMatch: 'full'
  },
  {
    path: 'employee-home',
    loadComponent: () => import('./employee-home/employee-home.component').then(m => m.EmployeeHomeComponent)
  },
  {
    path: 'advance-request-form',
    loadComponent: () => import('./advance-request-form/advance-request-form.component').then(m => m.AdvanceRequestFormComponent)
  },
  {
    path: 'advance-request-details/:id',
    loadComponent: () => import('./advance-details/advance-details').then(m => m.AdvanceDetails)
  },
  {
    path: 'advance-request-list',
    loadComponent: () => import('./advance-request-list/advance-request-list.component').then(m => m.AdvanceRequestListComponent)
  },
  {
    path: 'notifications',
    loadComponent: () => import('src/app/shared/components/notification/notification-center-page/notification-center-page.component').then(m => m.NotificationCenterPageComponent)
  }
];
