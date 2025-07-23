import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { NotificationType } from 'src/app/core/models/notification-type.enum';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notification-test-sender',
  templateUrl: './notification-test-sender.component.html',
  styleUrls: ['./notification-test-sender.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class NotificationTestSenderComponent {
  userId: number | null = null;
  title = '';
  message = '';
  type: NotificationType = NotificationType.INFO;
  types = Object.values(NotificationType);
  senderId: number | null = null;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  send() {
    if (!this.userId || !this.title || !this.message) {
      this.toastr.error('Tous les champs sont obligatoires');
      return;
    }
    this.http.post(`${environment.apiUrl}/notifications/send`, {
      userId: this.userId,
      title: this.title,
      message: this.message,
      type: this.type,
      senderId: this.senderId
    }).subscribe({
      next: () => this.toastr.success('Notification envoyée !'),
      error: () => this.toastr.error('Erreur lors de l’envoi')
    });
  }
} 