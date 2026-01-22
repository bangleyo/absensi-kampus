import { Injectable } from '@angular/core';
import { SharedModalComponent } from '../../shared/modal/modal';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private currentModal?: SharedModalComponent;

  register(modal: SharedModalComponent): void {
    this.currentModal = modal;
  }

  show(title?: string): void {
    if (this.currentModal) {
      if (title) this.currentModal.title = title;
      this.currentModal.isVisible = true;
      document.body.style.overflow = 'hidden';
    }
  }

  hide(): void {
    if (this.currentModal) {
      this.currentModal.isVisible = false;
      document.body.style.overflow = '';
    }
  }
}
