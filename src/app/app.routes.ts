import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RhDashboardComponent } from './rh-dashboard/rh-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'rh', component: RhDashboardComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
