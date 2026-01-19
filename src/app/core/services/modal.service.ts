import { Injectable } from '@angular/core';
import {SharedModalComponent} from '../../shared/modal/modal';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private currentModal?: SharedModalComponent;

  register(modal: SharedModalComponent) {
    this.currentModal = modal;
  }

  show(title?: string) {
    if (this.currentModal) {
      if (title) this.currentModal.title = title;
      this.currentModal.isVisible = true;
      document.body.style.overflow = 'hidden';
    }
  }

  hide() {
    if (this.currentModal) {
      this.currentModal.isVisible = false;
      document.body.style.overflow = '';
    }
  }
}
