/**
 * Sidebar navigation component for authenticated users.
 * Handles user session validation, navigation, and logout.
 */
import {Component, OnInit, OnDestroy, ChangeDetectionStrategy} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import {HeaderService} from '../../../core/services/header.service';
import {NgIf} from '@angular/common';

interface UserSession {
  readonly role: 'STUDENT' | 'ADMIN' | 'LECTURER';
  readonly username: string;
  readonly name: string;
  readonly nim?: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  imports: [
    NgIf
  ],
  changeDetection: ChangeDetectionStrategy.OnPush  // Performance: OnPush
})
export class SidebarComponent implements OnInit, OnDestroy {
  private sessionSubscription?: Subscription;
  private readonly studentRole = 'STUDENT' as const;
  private readonly admin = 'ADMIN' as const;

  user: UserSession | null = null;
  displayName = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private headerService: HeaderService,
  ) {}

  ngOnInit(): void {
    this.initializeUserSession();
  }

  ngOnDestroy(): void {
    this.sessionSubscription?.unsubscribe();
  }

  /**
   * Initialize user session from storage and validate role.
   * Redirect to login if invalid STUDENT session.
   */
  private initializeUserSession(): void {
    const sessionData = sessionStorage.getItem('userSession');

    if (!sessionData) {
      this.redirectToLogin();
      return;
    }

    try {
      this.user = JSON.parse(sessionData);

      if (this.isInvalidStudentSession()) {
        this.authService.logout();
        return;
      }

      this.displayName = this.formatDisplayName();
    } catch {
      // Invalid JSON → treat as no session
      this.redirectToLogin();
    }
  }

  /**
   * Check if STUDENT session is invalid (missing NIM).
   */
  private isInvalidStudentSession(): boolean {
    return this.user?.role === this.studentRole && !this.user.nim;
  }

  /**
   * Format display name for sidebar (NIM prefixed).
   */
  private formatDisplayName(): string {
    return `NIM ${this.user?.nim ?? ''}`;
  }

  /**
   * Toggle sidebar collapsed state and adjust main content.
   */
  toggleSidebar(): void {
    const sidebar = this.getSidebarElement();
    const mainContent = document.getElementById('mainContent');

    sidebar?.classList.toggle('collapsed');
    mainContent?.classList.toggle('expanded', sidebar?.classList.contains('collapsed'));
  }

  /**
   * Navigate to page and update active nav link.
   * Auto-close sidebar on mobile.
   */
  navigateTo(page: string, label: string, event?: MouseEvent,): void {
    this.updateActiveNavLink(event);
    this.headerService.updateTitle(label)

    // 2. Navigate via Angular Router
    if (this.user?.role === this.studentRole) {
      this.router.navigate([`/${page}`]).then(success => {
        if (success && window.innerWidth <= 768) {
          this.toggleSidebar(); // Auto-close mobile
        }
      }).catch(err => {
        console.error(`Navigation to ${page} failed:`, err);
      });
    } else if (this.user?.role === this.admin) {
      this.router.navigate([`/admin/${page}`]).then(success => {
        if (success && window.innerWidth <= 768) {
          this.toggleSidebar(); // Auto-close mobile
        }
      }).catch(err => {
        console.error(`Navigation to ${page} failed:`, err);
      });
    }
  }

  /**
   * Update active navigation link state.
   */
  private updateActiveNavLink(event?: MouseEvent): void {
    document
      ?.querySelectorAll('.nav-link')
      ?.forEach(link => link.classList.remove('active'));

    const target = event?.target as HTMLElement | null;
    const activeLink = target?.closest('.nav-link') as HTMLElement | null;

    activeLink?.classList.add('active');
  }

  /**
   * Confirm and execute logout.
   * Clear all storage and redirect to login.
   */
  logout(): void {
    if (!confirm('Apakah Anda yakin ingin logout?')) {
      return;
    }

    this.performLogout();
  }

  /**
   * Execute logout sequence.
   */
  private performLogout(): void {
    localStorage.removeItem('token');
    sessionStorage.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  /**
   * Safely get sidebar DOM element.
   */
  private getSidebarElement(): HTMLElement | null {
    return document.getElementById('sidebar');
  }

  /**
   * Redirect to login page.
   */
  private redirectToLogin(): void {
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
