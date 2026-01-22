import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly isSidebarCollapsed = signal<boolean>(window.innerWidth <= 768);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(val => !val);
  }

  setCollapsed(state: boolean): void {
    this.isSidebarCollapsed.set(state);
  }
}
