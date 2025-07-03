import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'My IPAM',
    url: '/pages/my-ipam',
    iconComponent: { name: 'cil-sitemap' },
  },
  {
    name: 'User Management',
    url: '/pages/user-management',
    iconComponent: { name: 'cil-user' }
  },
  {
    name: 'Logout',
    url:'/logout',
    iconComponent: { name: 'cil-account-logout' }
  }
]


