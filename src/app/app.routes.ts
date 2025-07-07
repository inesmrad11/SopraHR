import { Routes } from '@angular/router';
import { DashboardComponent } from './features/employee/dashboard/dashboard.component';
import { AdvanceRequestFormComponent } from './features/employee/advanced-request/advance-request-form.component';
import { AdvancedHistoryComponent } from './features/employee/advanced-history/advanced-history.component';
import { AdvanceRequestDetailComponent } from './features/employee/advance-request-details/advance-request-detail.component';

export const routes: Routes = [
  { path: 'employee/dashboard', component: DashboardComponent },
  { path: 'employee/request/new', component: AdvanceRequestFormComponent },
  { path: 'employee/requests', component: AdvancedHistoryComponent },
  { path: 'employee/request/:id', component: AdvanceRequestDetailComponent },
  // ...other routes
]; 