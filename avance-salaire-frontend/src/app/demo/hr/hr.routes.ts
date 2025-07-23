import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./hr-statistics/hr-statistics').then(m => m.HrStatistics)
  },
  {
    path: 'kanban',
    loadComponent: () => import('./tableau-kanban-rh/tableau-kanban-rh').then(m => m.TableauKanbanRHComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./request-history/request-history').then(m => m.RequestHistory)
  },
  {
    path: 'requests',
    loadComponent: () => import('./hr-requests/hr-requests').then(m => m.HrRequests)
  },
  {
    path: 'requests/:id',
    loadComponent: () => import('./request-details/request-details').then(m => m.RequestDetails)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./hr-statistics/hr-statistics').then(m => m.HrStatistics)
  },
  {
    path: 'notifications',
    loadComponent: () => import('src/app/shared/components/notification/notification-center-page.component').then(m => m.NotificationCenterPageComponent)
  }
];
