import {Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shared-modal',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="shared-modal" [class.show]="isVisible" (click)="onOverlayClick($event)">
      <div class="shared-modal-overlay"></div>
      <div class="shared-modal-content">
        <div class="shared-modal-header">
          <h3>{{ title }}</h3>
          <button class="shared-modal-close" (click)="closeModal()">&times;</button>
        </div>
        <div class="shared-modal-body">
          <ng-content></ng-content>
        </div>
        <div class="shared-modal-footer" *ngIf="showFooter">
          <ng-content select="[footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrls: [
    'modal.css',
  ],
})
export class SharedModalComponent {
  @Input() title = 'Modal Title';
  @Input() isVisible = false;
  @Input() showFooter = true;
  @Output() closed = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  closeModal() {
    this.isVisible = false;
    this.closed.emit();
    this.cdr.detectChanges();
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('shared-modal')) {
      this.closeModal();
    }
  }
}
