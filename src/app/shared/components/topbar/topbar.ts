import { ChangeDetectionStrategy, Component, OnInit, Signal } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderService } from '../../../core/services/header.service';
import { LayoutService } from '../../../core/services/layout.service';

interface UserSession {
  readonly role: 'STUDENT' | 'ADMIN' | 'LECTURER';
  readonly name: string;
  readonly username: string;
  readonly nim?: string;
}

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.css'],
  standalone: true,
  imports: [AsyncPipe, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopbarComponent implements OnInit {
  readonly pageTitle$: Observable<string>;
  readonly isSidebarCollapsed: Signal<boolean>;

  currentUser: UserSession | null = null;
  displayName: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly headerService: HeaderService,
    private readonly layoutService: LayoutService, // Pastikan service ini ada
    private readonly router: Router
  ) {
    this.pageTitle$ = this.headerService.currentPageTitle;
    this.isSidebarCollapsed = this.layoutService.isSidebarCollapsed;
  }

  ngOnInit(): void {
    this.loadUserSession();
    this.syncTitleWithRoute();
  }

  // [BARU] Method untuk tombol mobile
  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  private loadUserSession(): void {
    const sessionData = sessionStorage.getItem('userSession');
    if (!sessionData) return;

    try {
      const parsedSession = JSON.parse(sessionData) as UserSession;

      if (parsedSession.role === 'STUDENT' && !parsedSession.nim) {
        this.authService.logout();
        return;
      }

      this.currentUser = parsedSession;
      this.displayName = parsedSession.name || 'User';

    } catch (error) {
      console.warn('Invalid session data detected, clearing storage.');
      sessionStorage.removeItem('userSession');
    }
  }

  private syncTitleWithRoute(): void {
    const currentUrl = this.router.url;
    let title = 'Dashboard';

    if (currentUrl.includes('/course')) title = 'Matakuliah';
    else if (currentUrl.includes('/class-session')) title = 'Sesi Kelas';
    else if (currentUrl.includes('/student')) title = 'Mahasiswa';
    else if (currentUrl.includes('/profile')) title = 'Setting';
    else if (currentUrl.includes('/dashboard')) title = 'Dashboard';

    this.headerService.updateTitle(title);
  }
}
