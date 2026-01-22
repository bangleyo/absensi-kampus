import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // Signal untuk menyimpan status sidebar
  // Default true di mobile (mini), false di desktop (lebar)
  isSidebarCollapsed = signal<boolean>(window.innerWidth <= 768);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(val => !val);
  }

  setCollapsed(state: boolean): void {
    this.isSidebarCollapsed.set(state);
  }
}
