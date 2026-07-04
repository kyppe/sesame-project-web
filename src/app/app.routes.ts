import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RhDashboardComponent } from './rh-dashboard/rh-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { adminGuard, rhGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'rh', component: RhDashboardComponent, canActivate: [rhGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
