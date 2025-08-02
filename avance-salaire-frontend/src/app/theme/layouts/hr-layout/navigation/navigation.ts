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
    id: 'hr-space',
    title: 'Espace RH',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Tableau de bord',
        type: 'item',
        url: '/hr/dashboard',
        classes: 'nav-item',
        icon: 'dashboard',
        breadcrumbs: false
      },
      {
        id: 'requests',
        title: 'Toutes les demandes',
        type: 'item',
        url: '/hr/requests',
        classes: 'nav-item',
        icon: 'profile',
        breadcrumbs: true
      },
      {
        id: 'kanban',
        title: 'Kanban',
        type: 'item',
        url: '/hr/kanban',
        classes: 'nav-item',
        icon: 'appstore',
        breadcrumbs: true
      },
      {
        id: 'history',
        title: 'Historique',
        type: 'item',
        url: '/hr/history',
        classes: 'nav-item',
        icon: 'unordered-list',
        breadcrumbs: true
      },
      {
        id: 'messages',
        title: 'Messagerie',
        type: 'item',
        url: '/hr/messages',
        classes: 'nav-item',
        icon: 'message',
        breadcrumbs: true
      },
      {
        id: 'notifications',
        title: 'Mes notifications',
        type: 'item',
        url: 'notifications',
        classes: 'nav-item',
        icon: 'bell',
        breadcrumbs: false
      },

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
    url: '/hr/settings',
    classes: 'nav-item',
    icon: 'setting',
    breadcrumbs: false
  }
];
