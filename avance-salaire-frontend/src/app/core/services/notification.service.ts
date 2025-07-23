import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Notification } from '../models/notification.model';
import { NotificationType } from '../models/notification-type.enum';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private stompClient: Client;
  private notifications$ = new BehaviorSubject<Notification[]>([]);

  constructor(@Inject(ToastrService) private toastr: ToastrService, private http: HttpClient) {}

  connect(userId: number) {
    this.stompClient = new Client({
      brokerURL: undefined,
      webSocketFactory: () => new SockJS('http://localhost:9009/ws-notifications'),
      reconnectDelay: 5000,
    });
    this.stompClient.onConnect = () => {
      this.stompClient.subscribe(`/topic/notifications/${userId}`, (message: IMessage) => {
        const notif: Notification = JSON.parse(message.body);
        this.showNotification(notif);
        this.addNotification(notif);
      });
    };
    this.stompClient.activate();
  }

  private showNotification(notif: Notification) {
    switch (notif.type) {
      case 'ACTION_REMINDER':
      case 'WORKLOAD_ALERT':
      case 'UNUSUAL_REQUEST':
      case 'PREVENTIVE_ALERT':
      case 'PROGRESSIVE_REMINDER_24H':
      case 'PROGRESSIVE_REMINDER_3D':
      case 'PROGRESSIVE_REMINDER_5D':
      case 'INACTIVITY_REMINDER':
        this.toastr.warning(notif.message, notif.title, { timeOut: 10000, closeButton: true });
        break;
      case 'CONGRATS_NO_LATE_REPAYMENT':
      case 'POSITIVE_FEEDBACK':
        this.toastr.success(notif.message, notif.title, { timeOut: 7000 });
        break;
      case 'FINANCIAL_ADVICE':
      case 'SUGGESTION':
      case 'PROFILE_SUGGESTION':
      case 'STATISTICS_ALERT':
      case 'COLLECTIVE_STATS':
      case 'PATTERN_DETECTION':
      case 'ANTICIPATION_ALERT':
      case 'UPCOMING_INSTALLMENT':
      case 'POLICY_UPDATE':
      case 'RULE_CHANGE':
      case 'TEAM_PERFORMANCE':
      case 'ACTIVITY_PEAK':
      case 'CALENDAR_REMINDER':
        this.toastr.info(notif.message, notif.title, { timeOut: 9000 });
        break;
      case 'MAINTENANCE':
      case 'APP_UPDATE':
        this.toastr.info(notif.message, notif.title, { timeOut: 12000, closeButton: true });
        break;
      case 'ERROR':
        this.toastr.error(notif.message, notif.title, { timeOut: 9000 });
        break;
      default:
        this.toastr.info(notif.message, notif.title, { timeOut: 5000 });
    }
  }

  private addNotification(notif: Notification) {
    const current = this.notifications$.value;
    this.notifications$.next([notif, ...current]);
  }

  markAsRead(notificationId: number) {
    return this.http.post(`${environment.apiUrl}/notifications/${notificationId}/mark-as-read`, {}).subscribe(() => {
      // Met à jour l'état local
      const updated = this.notifications$.value.map(n => n.id === notificationId ? { ...n, read: true } : n);
      this.notifications$.next(updated);
    });
  }

  get notifications() {
    return this.notifications$.asObservable();
  }
} 