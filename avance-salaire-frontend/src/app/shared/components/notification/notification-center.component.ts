import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule
import { NotificationService } from 'src/app/core/services/notification.service';
import { Notification } from 'src/app/core/models/notification.model';
import { NOTIFICATION_ICONS, NotificationType } from 'src/app/core/models/notification-type.enum'; // Import NOTIFICATION_ICONS
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';

interface GroupedNotification {
  label: string;
  notifications: Notification[];
}

@Component({
  selector: 'app-notification-center',
  standalone: true, // Add standalone: true
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
  imports: [CommonModule, DatePipe] // Add imports array
})
export class NotificationCenterComponent implements OnInit {
  // Remove groupedNotifications and use flat notifications list
  notifications: Notification[] = [];
  showPanel = false;
  icons = NOTIFICATION_ICONS;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    public router: Router,
    public route: ActivatedRoute,
    @Inject(ToastrService) private toastr: ToastrService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.notificationService.notifications.subscribe(list => {
      this.notifications = list;
    });
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  togglePanel() {
    this.showPanel = !this.showPanel;
  }

  markAsRead(notification: Notification, event: MouseEvent) {
    event.stopPropagation();
    this.notificationService.markAsRead(notification.id);
  }

  markAllAsRead(event: MouseEvent) {
    event.stopPropagation();
    const unreadIds = this.notifications.filter(n => !n.read).map(n => n.id);
    // This assumes a backend endpoint exists to mark multiple as read
    // If not, we would loop and call markAsRead for each
    unreadIds.forEach(id => this.notificationService.markAsRead(id));
  }

  viewRequest(requestId: number, event: MouseEvent) {
    event.stopPropagation();
    const user = this.authService.getCurrentUser();
    if (!user) return;
    let route = '';
    if (user.role && user.role.toUpperCase().includes('HR')) {
      route = `/hr/request-details/${requestId}`;
    } else {
      route = `/employee/advance-request-details/${requestId}`;
    }
    this.router.navigate([route]);
    this.showPanel = false;
  }

  sendReminder(requestId: number, event: MouseEvent) {
    event.stopPropagation();
    this.http.post(`${environment.apiUrl}/notifications/send-reminder`, { requestId }).subscribe({
      next: () => this.toastr.success('Rappel envoyé à l’employé.'),
      error: () => this.toastr.error('Erreur lors de l’envoi du rappel.')
    });
  }

  addToCalendar(notification: Notification, event: MouseEvent) {
    event.stopPropagation();
    const title = encodeURIComponent(notification.title);
    const details = encodeURIComponent(notification.message);
    const a = document.createElement('a');
    a.href = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    a.target = '_blank';
    a.click();
    this.toastr.info('Événement de calendrier ouvert dans un nouvel onglet.');
  }

  goToNotifications(event: MouseEvent) {
    event.preventDefault();
    this.showPanel = false;
    this.router.navigate(['notifications'], { relativeTo: this.route });
  }

  getIcon(type: NotificationType): string {
    return this.icons[type] || 'notifications';
  }

  getEmoji(type: NotificationType): string {
    switch (type) {
      case 'INFO': return 'ℹ️';
      case 'WARNING': return '⚠️';
      case 'ERROR': return '❌';
      case 'POSITIVE_FEEDBACK': return '🎉';
      case 'ACTION_REMINDER': return '⏰';
      case 'CONGRATS_NO_LATE_REPAYMENT': return '🏅';
      case 'CALENDAR_REMINDER': return '📅';
      case 'DOCUMENT_MISSING': return '📄';
      case 'REQUEST_APPROVAL': return '✅';
      case 'REQUEST_REJECTION': return '🚫';
      case 'UPCOMING_INSTALLMENT': return '💸';
      case 'PATTERN_DETECTION': return '🔎';
      case 'TEAM_PERFORMANCE': return '💪';
      case 'UNUSUAL_REQUEST': return '❗';
      case 'SUGGESTION': return '💡';
      case 'STATISTICS_ALERT': return '📊';
      case 'MAINTENANCE': return '🛠️';
      case 'APP_UPDATE': return '⬆️';
      default: return '🔔';
    }
  }

  getColor(type: NotificationType): string {
    switch (type) {
      case 'INFO': return '#3498db';
      case 'WARNING': return '#f39c12';
      case 'ERROR': return '#e74c3c';
      case 'POSITIVE_FEEDBACK': return '#2ecc71';
      case 'ACTION_REMINDER': return '#faad14';
      case 'CONGRATS_NO_LATE_REPAYMENT': return '#52c41a';
      case 'CALENDAR_REMINDER': return '#8e44ad';
      case 'DOCUMENT_MISSING': return '#b37feb';
      case 'REQUEST_APPROVAL': return '#52c41a';
      case 'REQUEST_REJECTION': return '#e74c3c';
      case 'UPCOMING_INSTALLMENT': return '#13c2c2';
      case 'PATTERN_DETECTION': return '#1677ff';
      case 'TEAM_PERFORMANCE': return '#fa541c';
      case 'UNUSUAL_REQUEST': return '#faad14';
      case 'SUGGESTION': return '#faad14';
      case 'STATISTICS_ALERT': return '#3498db';
      case 'MAINTENANCE': return '#8e44ad';
      case 'APP_UPDATE': return '#1677ff';
      default: return '#888';
    }
  }

  getSubtext(notif: Notification): string {
    // Example: return '2 min ago', '5 August', or custom subtext
    const now = new Date();
    const created = new Date(notif.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} hours ago`;
    if (now.getFullYear() === created.getFullYear()) {
      return created.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
    }
    return created.toLocaleDateString();
  }
} 