/**
 * Topbar component displaying user info and controls.
 * Syncs with session storage for real-time user state.
 */
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AuthService} from '../../../core/services/auth.service';
import {HeaderService} from '../../../core/services/header.service';
import {Observable} from 'rxjs';
import {AsyncPipe, NgIf} from '@angular/common';

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
  imports: [
    AsyncPipe,
    NgIf
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopbarComponent implements OnInit {
  pageTitle$: Observable<string>;
  user: UserSession | null = null;
  displayName: string | undefined;

  constructor(
    private readonly authService: AuthService,
    private headerService: HeaderService,
    private cdr: ChangeDetectorRef
  ) {
    this.pageTitle$ = this.headerService.currentPageTitle;
  }

  ngOnInit(): void {
    this.initializeUserSession();
    this.cdr.detectChanges();
  }

  /**
   * Load and validate user session from storage.
   * Auto-logout invalid STUDENT sessions.
   */
  private initializeUserSession(): void {
    const sessionData = sessionStorage.getItem('userSession');
    if (!sessionData) return;

    try {
      this.user = JSON.parse(sessionData);

      // Validate STUDENT session
      if (this.user?.role === 'STUDENT' && !this.user?.nim) {
        this.authService.logout();
        return;
      }

      // Set display name (name prioritized)
      this.displayName = this.user?.name;
    } catch {
      // Corrupted session data
      sessionStorage.removeItem('userSession');
    }
  }
}
