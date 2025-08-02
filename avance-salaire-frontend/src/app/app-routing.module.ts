// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project import
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';
import { EmployeeLayoutComponent } from './theme/layouts/employee-layout/employee-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { RequestDetails } from './demo/hr/request-details/request-details';
import { HrLayoutComponent } from './theme/layouts/hr-layout/hr-layout.component';
import { NotificationCenterPageComponent } from './shared/components/notification/notification-center-page/notification-center-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: GuestLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./demo/pages/authentication/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
      }
    ]
  },
  {
    path: 'employee',
    component: EmployeeLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['EMPLOYEE'] },
    loadChildren: () => import('./demo/employee/employee.routes').then(m => m.routes)
  },
  {
    path: 'hr/requests/:id',
    component: RequestDetails
  },
  {
    path: 'hr',
    component: HrLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['HR', 'HR_EXPERT'] },
    loadChildren: () => import('./demo/hr/hr.routes').then(m => m.routes)
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
