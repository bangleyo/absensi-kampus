import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserSession {
  username: string;
  role: 'ADMIN' | 'STUDENT' | 'LECTURER';
  name: string;
  nim?: string;
  major?: string; // Tambahkan major jika perlu
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl || 'http://localhost:9191/api/v1'}/auth`;
  private readonly tokenKey = 'token';
  private readonly userKey = 'userSession';

  // Signal untuk reaktif update UI (TopBar, dll)
  readonly currentUser = signal<UserSession | null>(this.getUserFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { username: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        // Asumsi response backend: { status: 'success', data: { token: '...', role: '...', ... } }
        if (response.status === 'success' && response.data) {
          this.saveSession(response.data);
        }
      })
    );
  }

  logout(): void {
    sessionStorage.clear();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // --- Helper Methods ---

  private saveSession(data: any): void {
    // 1. Simpan Token
    sessionStorage.setItem(this.tokenKey, data.token);

    // 2. Susun Data User
    const user: UserSession = {
      username: data.username,
      role: data.role,
      name: data.name,
      nim: data.nim,
      major: data.major
    };

    // 3. Simpan Session & Update Signal
    sessionStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUser.set(user);
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  getUser(): UserSession | null {
    return this.currentUser();
  }

  hasRole(requiredRole: string): boolean {
    const user = this.getUser();
    return user?.role === requiredRole;
  }

  private getUserFromStorage(): UserSession | null {
    const userStr = sessionStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }
}
