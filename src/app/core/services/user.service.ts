import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl || 'http://localhost:9191/api/v1'}/user`;

  constructor(private http: HttpClient) {}

  changePassword(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, request);
  }
}
