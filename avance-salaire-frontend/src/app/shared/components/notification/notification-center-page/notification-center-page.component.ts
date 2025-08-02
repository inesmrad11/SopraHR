import { Component, OnInit, inject } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Notification } from 'src/app/core/models/notification.model';
import { NotificationType, NOTIFICATION_ICONS } from 'src/app/core/models/notification-type.enum';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import { BreadcrumbComponent, BreadcrumbItem } from 'src/app/theme/shared/components/breadcrumb/breadcrumb.component';
import { 
  CheckOutline, 
  DeleteOutline, 
  CloseOutline, 
  LeftOutline, 
  RightOutline, 
  CiCircleOutline, 
  ClockCircleOutline, 
  HeartOutline,
  SearchOutline,
  BellOutline,
  UserOutline,
  InfoCircleOutline
} from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-notification-center-page',
  standalone: true,
  templateUrl: './notification-center-page.component.html',
  styleUrls: ['./notification-center-page.component.scss'],
  imports: [CommonModule, FormsModule, IconDirective, BreadcrumbComponent]
})
export class NotificationCenterPageComponent implements OnInit {
  private iconService = inject(IconService);
  private notificationService = inject(NotificationService);

  notifications: Notification[] = [];
  filtered: Notification[] = [];
  search = '';
  typeFilter = '';
  onlyUnread = false;
  page = 1;
  pageSize = 10;
  itemsPerPageOptions = [5, 10, 15, 25];
  selectedNotifications = new Set<number>();
  modalNotif: Notification | null = null;
  
  // Nouvelles propriétés pour le design harmonisé
  showSearch = false;
  currentDate = new Date();
  
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Accueil', route: '/hr/hr-statistics' },
    { label: 'Centre de notifications', active: true }
  ];

  constructor() {
    // Register all required icons
    this.iconService.addIcon(
      CheckOutline,
      DeleteOutline,
      CloseOutline,
      LeftOutline,
      RightOutline,
      CiCircleOutline,
      ClockCircleOutline,
      HeartOutline,
      SearchOutline,
      BellOutline,
      UserOutline,
      InfoCircleOutline
    );
  }

  ngOnInit() {
    // Charger les notifications
    this.notificationService.loadNotifications();
    
    // S'abonner aux changements
    this.notificationService.notifications.subscribe(list => {
      this.notifications = list;
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filtered = this.notifications.filter(n =>
      (!this.typeFilter || n.type === this.typeFilter) &&
      (!this.onlyUnread || !n.read) &&
      (!this.search || n.message.toLowerCase().includes(this.search.toLowerCase()) || n.title?.toLowerCase().includes(this.search.toLowerCase()))
    );
    this.page = 1;
    this.selectedNotifications.clear();
  }

  markAsRead(notif: Notification) {
    this.notificationService.markAsRead(notif.id);
    notif.read = true;
  }

  markAllAsRead() {
    this.filtered.forEach(n => {
      if (!n.read) this.markAsRead(n);
    });
  }

  deleteNotification(notif: Notification) {
    this.filtered = this.filtered.filter(n => n.id !== notif.id);
    this.notifications = this.notifications.filter(n => n.id !== notif.id);
    this.selectedNotifications.delete(notif.id);
  }

  setTypeFilter(type: string) {
    this.typeFilter = type;
    this.applyFilters();
  }

  setOnlyUnread(event: Event) {
    this.onlyUnread = (event.target as HTMLInputElement).checked;
    this.applyFilters();
  }

  setSearch(val: string) {
    this.search = val;
    this.applyFilters();
  }

  get paginationInfo(): string {
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.filtered.length);
    return `${start}-${end} sur ${this.filtered.length}`;
  }

  getTotalPages(): number {
    return Math.ceil(this.filtered.length / this.pageSize) || 1;
  }

  onItemsPerPageChange(): void {
    this.page = 1; // Reset to first page when changing items per page
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  nextPage(): void {
    if (this.page < this.getTotalPages()) {
      this.page++;
    }
  }

  goToPage(page: number) {
    const totalPages = this.getTotalPages();
    if (page >= 1 && page <= totalPages) {
      this.page = page;
    }
  }

  handleNotificationSelect(id: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedNotifications.add(id);
    } else {
      this.selectedNotifications.delete(id);
    }
  }

  allSelected(): boolean {
    return this.filtered.length > 0 && this.filtered.every(n => this.selectedNotifications.has(n.id));
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.filtered.forEach(n => this.selectedNotifications.add(n.id));
    } else {
      this.selectedNotifications.clear();
    }
  }

  markSelectedAsRead() {
    this.filtered.forEach(n => {
      if (this.selectedNotifications.has(n.id) && !n.read) {
        this.markAsRead(n);
      }
    });
    this.selectedNotifications.clear();
  }

  deleteSelected() {
    this.filtered = this.filtered.filter(n => !this.selectedNotifications.has(n.id));
    this.notifications = this.notifications.filter(n => !this.selectedNotifications.has(n.id));
    this.selectedNotifications.clear();
  }

  clearSelection() {
    this.selectedNotifications.clear();
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  showDetails(notif: Notification) {
    this.modalNotif = notif;
  }

  closeDetailsModal() {
    this.modalNotif = null;
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'INFO': return 'Information';
      case 'WARNING': return 'Avertissement';
      case 'ERROR': return 'Erreur';
      case 'POSITIVE_FEEDBACK': return 'Succès';
      case 'ACTION_REMINDER': return 'Rappel';
      default: return type;
    }
  }

  getSenderTypeLabel(type?: string): string {
    switch (type) {
      case 'SYSTEM': return 'Système';
      case 'RH': return 'Ressources Humaines';
      case 'EMPLOYEE': return 'Employé(e)';
      default: return 'Système';
    }
  }



  getTypeClass(type: string): string {
    const classMap: { [key: string]: string } = {
      'INFO': 'info',
      'WARNING': 'warning',
      'ERROR': 'error',
      'REQUEST_APPROVAL': 'success',
      'REQUEST_REJECTION': 'error',
      'REQUEST_CANCELLATION': 'warning',
      'REQUEST_COMPLETION': 'success',
      'REQUEST_PENDING': 'info',
      'REQUEST_IN_PROGRESS': 'info',
      'DOCUMENT_MISSING': 'warning',
      'CONGRATS_NO_LATE_REPAYMENT': 'success',
      'FINANCIAL_ADVICE': 'info',
      'POLICY_UPDATE': 'warning',
      'UPCOMING_INSTALLMENT': 'warning',
      'WORKLOAD_ALERT': 'error',
      'TEAM_PERFORMANCE': 'info',
      'UNUSUAL_REQUEST': 'warning',
      'FEEDBACK_REMINDER': 'info',
      'ACTIVITY_PEAK': 'info',
      'MAINTENANCE': 'warning',
      'APP_UPDATE': 'info',
      'ACTION_REMINDER': 'warning',
      'SUGGESTION': 'info',
      'STATISTICS_ALERT': 'info',
      'CALENDAR_REMINDER': 'info',
      'INACTIVITY_REMINDER': 'warning',
      'POSITIVE_FEEDBACK': 'positive_feedback',
      'ANTICIPATION_ALERT': 'warning',
      'PROFILE_SUGGESTION': 'info',
      'PREVENTIVE_ALERT': 'warning',
      'RULE_CHANGE': 'warning',
      'PROGRESSIVE_REMINDER_24H': 'warning',
      'PROGRESSIVE_REMINDER_3D': 'warning',
      'PROGRESSIVE_REMINDER_5D': 'warning',
      'COLLECTIVE_STATS': 'info',
      'PATTERN_DETECTION': 'info'
    };
    return classMap[type] || 'info';
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getPageEnd(): number {
    return Math.min(this.page * this.pageSize, this.filtered.length);
  }

  // Nouvelles méthodes pour le design harmonisé
  toggleSearch() {
    this.showSearch = !this.showSearch;
  }

  closeSearch() {
    this.showSearch = false;
  }
}