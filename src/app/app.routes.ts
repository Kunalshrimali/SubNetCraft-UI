import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: 'pages',
    component: DefaultLayoutComponent,
    canActivate: [authGuard],
    loadChildren: () => import('./views/routes').then((m) => m.routes),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./views/pages/page404/page404.component').then(
        (m) => m.Page404Component
      ),
  },
  {
    path: '500',
    loadComponent: () =>
      import('./views/pages/page500/page500.component').then(
        (m) => m.Page500Component
      ),
  },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./views/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'logout',
    loadComponent: () =>
      import('./views/pages/logout/logout.component').then(
        (m) => m.LogoutComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./views/pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'request-new-ip',
    loadComponent: () =>
      import('./views/pages/request-new-ip/request-new-ip.component').then(
        (m) => m.RequestNewIPComponent
      ),
  },
  {
    path: 'request-new-ip',
    loadComponent: () =>
      import('./views/pages/request-new-ip/request-new-ip.component').then(
        (m) => m.RequestNewIPComponent
      ),
  },
  {
    path: 'subnet',
    loadComponent: () =>
      import('./views/pages/subnet/subnet.component').then(
        (m) => m.SubnetComponent
      ),
  },
  {
    path: 'work-in-progress',
    loadComponent: () =>
      import(
        './views/components/work-in-progress/work-in-progress.component'
      ).then((m) => m.WorkInProgressComponent),
  },
  { path: '', redirectTo: 'pages', pathMatch: 'full' },
  { path: '**', redirectTo: '500' },
];
