import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'today', pathMatch: 'full' },
  {
    path: 'today',
    loadComponent: () => import('./pages/today/today.component').then(m => m.TodayComponent)
  },
  {
    path: 'upcoming',
    loadComponent: () => import('./pages/upcoming/upcoming.component').then(m => m.UpcomingComponent)
  },
  {
    path: 'all',
    loadComponent: () => import('./pages/all-tasks/all-tasks.component').then(m => m.AllTasksComponent)
  },
  { path: '**', redirectTo: 'today' }
];
