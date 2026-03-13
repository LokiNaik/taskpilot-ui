import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login',    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'today',    loadComponent: () => import('./pages/today/today.component').then(m => m.TodayComponent),      canActivate: [authGuard] },
  { path: 'upcoming', loadComponent: () => import('./pages/upcoming/upcoming.component').then(m => m.UpcomingComponent), canActivate: [authGuard] },
  { path: 'all',      loadComponent: () => import('./pages/all-tasks/all-tasks.component').then(m => m.AllTasksComponent), canActivate: [authGuard] },
  { path: '',         redirectTo: 'today', pathMatch: 'full' },
];