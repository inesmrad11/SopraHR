import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { SnakeTimelineComponent, RequestActivity } from 'src/app/shared/components/request -activity-timeline/request-activity-timeline.component';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { ActivatedRoute } from '@angular/router';
import { SalaryAdvanceRequest } from 'src/app/core/models/salary-advance-request.model';
import { RequestStatus } from 'src/app/core/models/request-status.enum';
import { forkJoin } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleTranslatePipe } from 'src/app/core/pipes/role-translate.pipe';
import { IconDirective } from '@ant-design/icons-angular';

@Component({
  selector: 'app-advance-details',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, SnakeTimelineComponent, RoleTranslatePipe, IconDirective],
  templateUrl: './advance-details.html',
  styleUrl: './advance-details.scss',
  providers: [DatePipe]
})
export class AdvanceDetails implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  activities: RequestActivity[] = [];
  requestId: number = 0;
  request: SalaryAdvanceRequest | null = null;
  comments: any[] = [];
  newComment: string = '';
  private commentInterval: any;

  constructor(private advanceRequestService: AdvanceRequestService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.requestId) {
      // Charger les détails de la demande
      this.advanceRequestService.getRequestById(this.requestId).subscribe((request: SalaryAdvanceRequest) => {
        this.request = request;
      });
      
      // Charger la timeline
      this.advanceRequestService.getRichTimeline(this.requestId).subscribe((steps: any[]) => {
        this.activities = steps.map(step => ({
          type: step.type,
          status: this.mapStatus(step.status),
          actor: step.actor,
          actorRole: step.actorRole,
          timestamp: step.timestamp,
          comment: step.comment,
          details: step.details
        }));
      });
      
      this.loadComments();
      this.commentInterval = setInterval(() => this.loadComments(), 20000);
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    if (this.commentInterval) {
      clearInterval(this.commentInterval);
    }
  }

  loadComments() {
    this.advanceRequestService.getComments(this.requestId).subscribe(comments => {
      this.comments = comments;
    });
  }

  postComment() {
    if (!this.newComment.trim()) return;
    const comment = {
      type: 'EMPLOYE',
      message: this.newComment
    };
    this.advanceRequestService.addComment(this.requestId, comment).subscribe(() => {
      this.newComment = '';
      this.loadComments();
    });
  }

  mapStatus(status: string): 'pending' | 'approved' | 'rejected' {
    switch (status) {
      case 'En attente': return 'pending';
      case 'Validée': return 'approved';
      case 'Payée': return 'approved';
      case 'Clôturée': return 'approved';
      case 'Rejetée': return 'rejected';
      default: return 'pending';
    }
  }

  getAvatarUrl(email: string, name: string, profilePicture?: string): string {
    // Utiliser la vraie photo de profil si elle existe
    if (profilePicture) {
      return profilePicture;
    }
    // Sinon, utiliser une photo par défaut
    return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  onImageError(event: any): void {
    // Fallback vers une photo par défaut si l'image ne charge pas
    event.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
  }

  // Méthodes pour les statistiques
  getCompletedSteps(): number {
    return this.activities.filter(a => a.status === 'approved').length;
  }

  getCompletionPercentage(): number {
    if (this.activities.length === 0) return 0;
    
    // Calculer le pourcentage basé sur les étapes complétées
    const completedSteps = this.getCompletedSteps();
    const totalSteps = this.activities.length;
    
    // Si la demande est rejetée, la progression est 0%
    if (this.request?.status === 'REJECTED') {
      return 0;
    }
    
    // Si la demande est validée mais pas encore payée, progression de 50%
    if (this.request?.status === 'APPROVED' && completedSteps === 0) {
      return 50;
    }
    
    // Calcul normal basé sur les étapes
    const percent = (completedSteps / totalSteps) * 100;
    return Math.min(100, Math.round(percent));
  }

  // Méthode pour gérer la touche Entrée
  onEnterKey(event: any): void {
    if (event && !event.shiftKey) {
      event.preventDefault();
      this.postComment();
    }
  }

  // Méthode pour faire défiler vers le bas dans la conversation
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Erreur lors du scroll:', err);
    }
  }

  // Méthode pour formater le contenu des messages
  formatMessageContent(message: string): string {
    if (!message) return '';
    // Convertir les retours à la ligne en <br>
    return message.replace(/\n/g, '<br>');
  }

  // Méthode pour formater l'heure des messages
  formatMessageTime(date: string | Date): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  }

  // Méthode pour afficher les séparateurs de date
  showDateSeparator(prevMessage: any, currentMessage: any): boolean {
    if (!prevMessage || !currentMessage) return false;
    
    const prevDate = new Date(prevMessage.createdAt);
    const currentDate = new Date(currentMessage.createdAt);
    
    return prevDate.toDateString() !== currentDate.toDateString();
  }
}
