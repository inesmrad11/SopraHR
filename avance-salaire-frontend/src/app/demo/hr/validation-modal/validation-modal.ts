import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-validation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './validation-modal.html',
  styleUrls: ['./validation-modal.scss'],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms cubic-bezier(.4,0,.2,1)', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class ValidationModal implements AfterViewInit, OnChanges {
  @Input() visible = false;
  @Input() action: 'approve' | 'reject' = 'approve';
  @Output() confirm = new EventEmitter<{action: 'approve' | 'reject', comment: string}>();
  @Output() cancel = new EventEmitter<void>();
  comment = '';
  liveMessage = '';
  @ViewChild('commentBox') commentBox!: ElementRef<HTMLTextAreaElement>;

  ngAfterViewInit() {
    this.focusTextarea();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && changes['visible'].currentValue) {
      setTimeout(() => this.focusTextarea(), 0);
    }
  }
  focusTextarea() {
    if (this.visible && this.commentBox) {
      this.commentBox.nativeElement.focus();
    }
  }
  onEnter(event: Event) {
    if (event instanceof KeyboardEvent && !event.shiftKey) {
      event.preventDefault();
      this.onConfirmApprove();
    }
  }
  onConfirmApprove() {
    this.confirm.emit({ action: 'approve', comment: this.comment });
    this.liveMessage = 'Validation confirmée';
    this.comment = '';
  }
  onConfirmReject() {
    this.confirm.emit({ action: 'reject', comment: this.comment });
    this.liveMessage = 'Rejet confirmé';
    this.comment = '';
  }
  onCancel() {
    this.cancel.emit();
    this.liveMessage = 'Action annulée';
    this.comment = '';
  }
  onEsc() {
    this.onCancel();
  }
  focusFirst() {
    this.commentBox?.nativeElement.focus();
  }
  focusLast() {
    const actions = document.querySelectorAll('.modal-actions button');
    if (actions.length) {
      (actions[actions.length - 1] as HTMLElement).focus();
    }
  }
}
