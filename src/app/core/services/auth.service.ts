import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9191/api/v1/auth';
  private tokenKey = 'token';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}


  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          console.log('token', response.token);
          sessionStorage.setItem(this.tokenKey, response.token);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  hasToken(): boolean {
    return !!sessionStorage.getItem(this.tokenKey);
  }

  get isAuthenticated$() {
    return this.isAuthenticatedSubject.asObservable();
  }
}
