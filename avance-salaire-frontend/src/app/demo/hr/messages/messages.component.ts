import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleTranslatePipe } from '../../../core/pipes/role-translate.pipe';
import { Conversation, Message } from '../../../core/models/conversation.model';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { SalaryAdvanceService } from '../../../core/services/salary-advance.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { IconService, IconDirective } from '@ant-design/icons-angular';
import { ReloadOutline } from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RoleTranslatePipe, IconDirective]
})
export class MessagesComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  private authService = inject(AuthService);
  private salaryAdvanceService = inject(SalaryAdvanceService);
  private http = inject(HttpClient);

  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  searchTerm: string = '';
  showConversations = true;
  currentUser: User | null = null;
  showEmojiPicker = false;
  showInfoPopup = false;
  selectedEmployeeInfo: any = null;

  // Émojis simples et populaires
  emojis = ['😊', '😂', '😍', '🥰', '😎', '🤔', '👍', '👎', '❤️', '💙', '💚', '💛', '💜', '💖', '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😉', '😋', '😛', '😝', '😜', '🤪', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😈', '👿', '👹', '👺', '💀', '☠️', '👻', '👽', '👾', '🤖', '💩', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊', '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👵', '🧓', '👴', '👮', '🕵️', '👷', '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '🧌', '💆', '💇', '🚶', '🧍', '🧎', '🏃', '💃', '🕺', '🕴️', '👯', '🧖', '🧗', '🤺', '🏇', '⛷️', '🏂', '🏌️', '🏄', '🚣', '🏊', '⛹️', '🏋️', '🚴', '🚵', '🤸', '🤼', '🤽', '🤾', '🤹', '🧘', '🛀', '🛌', '👭', '👫', '👬', '💏', '💑'];

  constructor(private router: Router, private iconService: IconService) {
    this.iconService.addIcon(ReloadOutline);
  }

  ngOnInit(): void {
    // Récupérer l'utilisateur connecté
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadConversations();
    
    // Ajouter un listener pour fermer le sélecteur d'émojis en cliquant en dehors
    document.addEventListener('click', this.onDocumentClick.bind(this));
    
    // Mettre à jour les conversations toutes les 30 secondes
    setInterval(() => {
      this.updateConversationsPeriodically();
    }, 30000);
  }

  ngOnDestroy(): void {
    // Nettoyer le listener
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadConversations(): void {
    // Charger toutes les demandes d'avance comme conversations
    this.salaryAdvanceService.getAllRequests().subscribe({
      next: (requests) => {
        this.conversations = requests.map(request => ({
          id: request.id,
          requestId: request.id,
          employeeId: request.employeeId || 0,
          employeeName: request.employeeFullName || 'Employé inconnu',
          employeeEmail: request.employeeEmail || '',
          employeeProfilePicture: request.employeeProfilePicture || null,
          requestAmount: request.requestedAmount || 0,
          requestStatus: request.status || 'PENDING',
          lastMessage: request.reason || 'Aucun message',
          lastMessageTime: new Date(request.requestDate || new Date()),
          unreadCount: 0,
          isSelected: false
        }));
        
        // Charger les derniers messages pour chaque conversation
        this.loadLastMessagesForConversations();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des conversations:', error);
        // En cas d'erreur, charger des données de test temporaires
        this.loadTestConversations();
      }
    });
  }

  private loadLastMessagesForConversations(): void {
    let loadedCount = 0;
    const totalConversations = this.conversations.length;

    if (totalConversations === 0) {
      return;
    }

    this.conversations.forEach(conversation => {
      // Charger les commentaires pour obtenir le dernier message
      this.http.get<any[]>(`${environment.apiUrl}/advance-requests/${conversation.requestId}/comments`, {
        headers: this.authService.getAuthHeaders()
      }).subscribe({
        next: (comments) => {
          if (comments && comments.length > 0) {
            // Prendre le dernier commentaire
            const lastComment = comments[comments.length - 1];
            conversation.lastMessage = lastComment.message || conversation.lastMessage;
            conversation.lastMessageTime = new Date(lastComment.createdAt || conversation.lastMessageTime);
          }
          
          loadedCount++;
          if (loadedCount === totalConversations) {
            // Trier les conversations par date du dernier message (plus récent en premier)
            this.conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
            this.filteredConversations = [...this.conversations];
          }
        },
        error: (error) => {
          console.error(`Erreur lors du chargement des messages pour la conversation ${conversation.id}:`, error);
          loadedCount++;
          if (loadedCount === totalConversations) {
            // Trier les conversations par date du dernier message (plus récent en premier)
            this.conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
            this.filteredConversations = [...this.conversations];
          }
        }
      });
    });
  }

  private loadTestConversations(): void {
    // Données de test en cas d'erreur API
    this.conversations = [
      {
        id: 1,
        requestId: 1,
        employeeId: 1,
        employeeName: 'Marie Dubois',
        employeeEmail: 'marie.dubois@sopra.com',
        employeeProfilePicture: null,
        requestAmount: 1500,
        requestStatus: 'PENDING',
        lastMessage: 'Bonjour, j\'ai besoin d\'une avance pour des frais médicaux urgents.',
        lastMessageTime: new Date(),
        unreadCount: 2,
        isSelected: false
      },
      {
        id: 2,
        requestId: 2,
        employeeId: 2,
        employeeName: 'Pierre Martin',
        employeeEmail: 'pierre.martin@sopra.com',
        employeeProfilePicture: null,
        requestAmount: 800,
        requestStatus: 'APPROVED',
        lastMessage: 'Merci pour votre validation rapide.',
        lastMessageTime: new Date(Date.now() - 3600000), // 1 heure avant
        unreadCount: 0,
        isSelected: false
      }
    ];
    
    // Trier les conversations par date du dernier message (plus récent en premier)
    this.conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    this.filteredConversations = [...this.conversations];
  }



  filterConversations(): void {
    if (!this.searchTerm.trim()) {
      this.filteredConversations = [...this.conversations];
    } else {
      this.filteredConversations = this.conversations.filter(conv =>
        conv.employeeName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        conv.lastMessage?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  selectConversation(conversation: Conversation): void {
    // Fermer le sélecteur d'émojis si ouvert
    this.showEmojiPicker = false;
    
    // Désélectionner la conversation précédente
    this.conversations.forEach(conv => conv.isSelected = false);
    this.filteredConversations.forEach(conv => conv.isSelected = false);
    
    // Sélectionner la nouvelle conversation
    conversation.isSelected = true;
    this.selectedConversation = conversation;
    
    // Charger les messages de cette conversation
    this.loadMessages(conversation.id);
    
    // Supprimé le message toast automatique
  }

  loadMessages(requestId: number): void {
    // Charger les commentaires de la demande comme messages
    this.http.get<any[]>(`${environment.apiUrl}/advance-requests/${requestId}/comments`, {
      headers: this.authService.getAuthHeaders()
    }).subscribe({
      next: (comments) => {
        this.messages = comments.map(comment => ({
          id: comment.id,
          conversationId: requestId,
          authorId: 0, // L'ID de l'auteur n'est pas dans le DTO
          authorName: comment.authorName || 'Utilisateur inconnu',
          authorRole: comment.authorRole || 'EMPLOYEE',
          message: comment.message || '',
          type: comment.authorRole === 'HR_EXPERT' ? 'RH' : 'EMPLOYE',
          createdAt: new Date(comment.createdAt || new Date()),
          isRead: true
        }));
        
        // Trier les messages par date de création (plus ancien en premier pour l'affichage)
        this.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      },
      error: (error) => {
        console.error('Erreur lors du chargement des messages:', error);
        // En cas d'erreur, charger des messages de test temporaires
        this.loadTestMessages(requestId);
      }
    });
  }

  private loadTestMessages(requestId: number): void {
    // Messages de test en cas d'erreur API
    this.messages = [
      {
        id: 1,
        conversationId: requestId,
        authorId: 1,
        authorName: 'Marie Dubois',
        authorRole: 'EMPLOYEE',
        message: 'Bonjour, j\'ai besoin d\'une avance pour des frais médicaux urgents.',
        type: 'EMPLOYE',
        createdAt: new Date(Date.now() - 3600000), // 1 heure avant
        isRead: true
      },
      {
        id: 2,
        conversationId: requestId,
        authorId: 999,
        authorName: 'Service RH',
        authorRole: 'HR_EXPERT',
        message: 'Bonjour Marie, nous avons bien reçu votre demande. Pouvez-vous nous fournir plus de détails sur ces frais médicaux ?',
        type: 'RH',
        createdAt: new Date(Date.now() - 1800000), // 30 minutes avant
        isRead: true
      }
    ];
    
    // Trier les messages par date de création (plus ancien en premier pour l'affichage)
    this.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  private updateConversationOrder(): void {
    // Trier les conversations par date du dernier message (plus récent en premier)
    this.conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    this.filteredConversations = [...this.conversations];
  }

  private updateConversationsPeriodically(): void {
    // Mettre à jour les conversations sans recharger complètement
    if (this.conversations.length > 0) {
      this.conversations.forEach(conversation => {
        // Vérifier s'il y a de nouveaux messages
        this.http.get<any[]>(`${environment.apiUrl}/advance-requests/${conversation.requestId}/comments`, {
          headers: this.authService.getAuthHeaders()
        }).subscribe({
          next: (comments) => {
            if (comments && comments.length > 0) {
              const lastComment = comments[comments.length - 1];
              const lastCommentTime = new Date(lastComment.createdAt);
              
              // Mettre à jour seulement si le dernier message est plus récent
              if (lastCommentTime > new Date(conversation.lastMessageTime)) {
                conversation.lastMessage = lastComment.message;
                conversation.lastMessageTime = lastCommentTime;
                this.updateConversationOrder();
              }
            }
          },
          error: (error) => {
            console.error(`Erreur lors de la mise à jour de la conversation ${conversation.id}:`, error);
          }
        });
      });
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation) return;

    const messageContent = this.newMessage.trim();
    const currentTime = new Date();

    // Envoyer le commentaire via l'API backend
    this.http.post<any>(`${environment.apiUrl}/advance-requests/${this.selectedConversation.requestId}/comments`, {
      message: messageContent,
      type: 'COMMENT'
    }, {
      headers: this.authService.getAuthHeaders()
    }).subscribe({
      next: (comment) => {
        const newMsg: Message = {
          id: comment.id,
          conversationId: this.selectedConversation!.requestId,
          authorId: this.currentUser?.id || 0,
          authorName: this.currentUser?.firstName + ' ' + this.currentUser?.lastName || 'Service RH',
          authorRole: this.currentUser?.role || 'HR_EXPERT',
          message: messageContent,
          type: 'RH',
          createdAt: new Date(comment.createdAt || currentTime),
          isRead: false
        };

        this.messages.push(newMsg);
        this.newMessage = '';

        // Mettre à jour la conversation
        this.selectedConversation!.lastMessage = newMsg.message;
        this.selectedConversation!.lastMessageTime = newMsg.createdAt;

        // Mettre à jour l'ordre des conversations (mettre la conversation actuelle en premier)
        this.updateConversationOrder();

        // Scroll vers le bas
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi du message:', error);
      }
    });
  }

  scrollToBottom(): void {
    if (this.messageContainer) {
      const element = this.messageContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  showDateSeparator(prevMessage: Message, currentMessage: Message): boolean {
    const prevDate = new Date(prevMessage.createdAt).toDateString();
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    return prevDate !== currentDate;
  }

  getAvatarUrl(email: string, name: string, profilePicture: string | null): string {
    if (profilePicture) {
      return profilePicture;
    }
    // Retourner une URL d'avatar par défaut basée sur l'email ou les initiales
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=500080&color=fff&size=40`;
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    const name = target.alt || 'User';
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=500080&color=fff&size=40`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return '#ff9500'; // Orange pour en attente
      case 'APPROVED':
        return '#34c759'; // Vert pour approuvé
      case 'REJECTED':
        return '#ff3b30'; // Rouge pour rejeté
      case 'EN_ATTENTE':
        return '#ff9500';
      case 'VALIDEE':
        return '#34c759';
      case 'REJETEE':
        return '#ff3b30';
      default:
        return '#8e8e93'; // Gris par défaut
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'APPROVED':
        return 'Approuvé';
      case 'REJECTED':
        return 'Rejeté';
      case 'EN_ATTENTE':
        return 'En attente';
      case 'VALIDEE':
        return 'Validée';
      case 'REJETEE':
        return 'Rejetée';
      default:
        return status;
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatMessageTime(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Aujourd'hui - afficher l'heure
      return messageDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      // Hier
      return 'Hier';
    } else {
      // Date complète
      return messageDate.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    }
  }

  toggleConversations(): void {
    this.showConversations = !this.showConversations;
    // Fermer le sélecteur d'émojis si ouvert
    this.showEmojiPicker = false;
  }

  refreshMessages(): void {
    // Recharger les conversations avec les derniers messages
    this.loadConversations();
    
    // Recharger les messages de la conversation sélectionnée si elle existe
    if (this.selectedConversation) {
      this.loadMessages(this.selectedConversation.requestId);
    }
  }



  showRequestInfo(conversation: Conversation): void {
    // Fermer le sélecteur d'émojis si ouvert
    this.showEmojiPicker = false;
    
    // Charger les informations de la demande d'avance
    this.salaryAdvanceService.getRequestById(conversation.requestId).subscribe({
      next: (request) => {
        this.selectedEmployeeInfo = {
          id: request.employeeId,
          name: request.employeeFullName,
          email: request.employeeEmail,
          department: 'Développement', // À récupérer depuis l'API si disponible
          position: 'Développeur Full Stack', // À récupérer depuis l'API si disponible
          hireDate: request.requestDate, // Utiliser la date de demande comme date d'embauche par défaut
          salary: request.employeeSalaryNet || 45000,
          requestAmount: request.requestedAmount,
          requestStatus: request.status,
          requestDate: request.requestDate,
          reason: request.reason,
          documents: [] // À récupérer depuis l'API si disponible
        };
        this.showInfoPopup = true;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des informations:', error);
      }
    });
  }

  closeInfoPopup(): void {
    this.showInfoPopup = false;
    this.selectedEmployeeInfo = null;
    // Fermer aussi le sélecteur d'émojis si ouvert
    this.showEmojiPicker = false;
  }

  closeChat(): void {
    this.selectedConversation = null;
    this.messages = [];
    // Fermer aussi le sélecteur d'émojis si ouvert
    this.showEmojiPicker = false;
  }



  showEmojis(): void {
    // Ne pas ouvrir le sélecteur d'émojis si le popup d'informations est ouvert
    if (this.showInfoPopup) {
      return;
    }
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string): void {
    this.newMessage += emoji;
    this.showEmojiPicker = false;
    // Focus sur le textarea
    if (this.messageInput) {
      this.messageInput.nativeElement.focus();
    }
  }

  // Fermer le sélecteur d'émojis si on clique en dehors
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.showEmojiPicker && !target.closest('.emoji-button-container') && !this.showInfoPopup) {
      this.showEmojiPicker = false;
    }
  }

  onEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  autoResize(event: any): void {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }



  formatMessageContent(message: string): string {
    // Remplacer les sauts de ligne par des <br>
    return message.replace(/\n/g, '<br>');
  }
} 