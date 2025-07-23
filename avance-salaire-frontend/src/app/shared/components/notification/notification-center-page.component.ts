import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Notification } from 'src/app/core/models/notification.model';
import { NotificationType } from 'src/app/core/models/notification-type.enum';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notification-center-page',
  standalone: true,
  templateUrl: './notification-center-page.component.html',
  styleUrls: ['./notification-center-page.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class NotificationCenterPageComponent implements OnInit {
  notifications: Notification[] = [];
  filtered: Notification[] = [];
  search = '';
  typeFilter = '';
  onlyUnread = false;
  page = 1;
  pageSize = 10;
  selectedNotifications = new Set<number>();
  modalNotif: Notification | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
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

  getTotalPages(): number {
    return Math.ceil(this.filtered.length / this.pageSize) || 1;
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
    // You can implement a modal here if you want
    alert(`Titre: ${notif.title}\nMessage: ${notif.message}\nAuteur: ${notif.senderName || 'Système'}`);
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getPageEnd(): number {
    return Math.min(this.page * this.pageSize, this.filtered.length);
  }
}