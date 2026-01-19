import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HeaderService {
  // BehaviorSubject menyimpan nilai saat ini dan membagikannya ke subscriber baru
  private pageTitleSource = new BehaviorSubject<string>('Dashboard');

  // Observable yang akan di-listen oleh Topbar
  currentPageTitle = this.pageTitleSource.asObservable();

  constructor() {}

  // Method untuk mengubah nama halaman
  updateTitle(title: string) {
    this.pageTitleSource.next(title);
  }
}
