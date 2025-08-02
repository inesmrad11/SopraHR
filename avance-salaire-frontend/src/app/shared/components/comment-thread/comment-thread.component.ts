import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { RoleTranslatePipe } from 'src/app/core/pipes/role-translate.pipe';

@Component({
  selector: 'app-comment-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RoleTranslatePipe],
  templateUrl: './comment-thread.component.html',
  styleUrls: ['./comment-thread.component.scss'],
  providers: [DatePipe]
})
export class CommentThreadComponent implements OnInit, OnDestroy {
  @Input() requestId!: number;
  @Input() currentUser!: { id: number, role: string, firstName: string, lastName: string };
  comments: any[] = [];
  newComment: string = '';
  private commentInterval: any;

  constructor(private advanceRequestService: AdvanceRequestService) {}

  ngOnInit() {
    this.loadComments();
    this.commentInterval = setInterval(() => this.loadComments(), 20000);
  }

  ngOnDestroy() {
    if (this.commentInterval) {
      clearInterval(this.commentInterval);
    }
  }

  loadComments() {
    if (!this.requestId) return;
    this.advanceRequestService.getComments(this.requestId).subscribe(comments => {
      this.comments = comments;
    });
  }

  postComment() {
    if (!this.newComment.trim()) return;
    const comment = {
      type: this.currentUser.role === 'HR_EXPERT' ? 'RH' : 'EMPLOYE',
      message: this.newComment
    };
    this.advanceRequestService.addComment(this.requestId, comment).subscribe(() => {
      this.newComment = '';
      this.loadComments();
    });
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
} 