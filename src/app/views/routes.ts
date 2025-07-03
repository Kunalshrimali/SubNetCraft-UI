import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'my-ipam',
    loadComponent: () =>
      import('./components/my-ipam/my-ipam.component').then(
        (m) => m.MyIpamComponent
      ),
  },
  {
    path: 'user-management',
    loadComponent: () =>
      import('./components/user-management/user-management.component').then(
        (m) => m.UserManagementComponent
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'my-ipam',
  },
];
