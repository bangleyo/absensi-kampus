import { ChangeDetectionStrategy, Component, OnInit, Signal, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderService } from '../../../core/services/header.service';
import { LayoutService } from '../../../core/services/layout.service';

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  LECTURER = 'LECTURER'
}

interface UserSession {
  readonly role: UserRole;
  readonly username: string;
  readonly name: string;
  readonly nim: string;
  readonly major: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  standalone: true,
  imports: [NgIf, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit {
  // Signal ini sekarang read-only di component ini, sumbernya dari Service
  isCollapsed: Signal<boolean>;

  user = signal<UserSession | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly headerService: HeaderService,
    private readonly layoutService: LayoutService
  ) {
    this.isCollapsed = this.layoutService.isSidebarCollapsed;
  }

  ngOnInit(): void {
    this.loadSession();
  }

  private loadSession(): void {
    const sessionData = sessionStorage.getItem('userSession');
    if (!sessionData) return this.handleUnauthorized();

    try {
      const parsedUser = JSON.parse(sessionData) as UserSession;
      if (parsedUser.role === UserRole.STUDENT && !parsedUser.nim) {
        return this.handleUnauthorized();
      }
      this.user.set(parsedUser);
    } catch (error) {
      this.handleUnauthorized();
    }
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  isRouteActive(basePath: string): boolean {
    const currentUser = this.user();
    if (!currentUser) return false;

    const prefix = currentUser.role === UserRole.ADMIN ? '/admin' : '';
    const fullPath = `${prefix}/${basePath}`;

    return this.router.url.includes(fullPath);
  }

  async navigateTo(path: string, title: string): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;

    this.headerService.updateTitle(title);
    const routePrefix = currentUser.role === UserRole.ADMIN ? '/admin' : '';
    const targetRoute = `${routePrefix}/${path}`;

    try {
      const success = await this.router.navigate([targetRoute]);

      // Auto-collapse pada mobile menggunakan service
      if (success && window.innerWidth <= 768) {
        this.layoutService.setCollapsed(true);
      }
    } catch (error) {
      console.error(`Navigation failed: ${targetRoute}`, error);
    }
  }

  logout(): void {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      localStorage.removeItem('token');
      sessionStorage.clear();
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  private handleUnauthorized(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  get displayName(): string {
    return this.user()?.nim ? `NIM ${this.user()?.nim}` : '';
  }
}
