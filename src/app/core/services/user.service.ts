import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.apiUrl || 'http://localhost:9191/api/v1';

  constructor(private http: HttpClient) {}

  changePassword(changePasswordRequest: ChangePasswordRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/change-password`, changePasswordRequest);
  }
}
