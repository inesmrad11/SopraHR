export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'employee-space',
    title: 'Espace Employé',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'employee-home',
        title: 'Accueil',
        type: 'item',
        url: '/employee/employee-home',
        classes: 'nav-item',
        icon: 'dashboard',
        breadcrumbs: false
      },
      {
        id: 'advance-request-form',
        title: 'Demander une avance',
        type: 'item',
        url: '/employee/advance-request-form',
        classes: 'nav-item',
        icon: 'credit-card',
        breadcrumbs: true
      },
      {
        id: 'advance-request-list',
        title: 'Mes demandes',
        type: 'item',
        url: '/employee/advance-request-list',
        classes: 'nav-item',
        icon: 'profile',
        breadcrumbs: true
      },
      {
        id: 'notifications',
        title: 'Mes notifications',
        type: 'item',
        url: 'notifications',
        classes: 'nav-item',
        icon: 'bell',
        breadcrumbs: true
      }
    ]
  },
  {
    id: 'authentication',
    title: 'Authentification',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'logout',
        title: 'Se déconnecter',
        type: 'item',
        classes: 'nav-item',
        url: '/logout',
        icon: 'logout',
        target: false,
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'settings',
    title: 'Paramètres',
    type: 'item',
    url: '/employee/settings',
    classes: 'nav-item',
    icon: 'setting',
    breadcrumbs: false
  }
];
