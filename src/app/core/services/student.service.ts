import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = environment.apiUrl || 'http://localhost:9191/api/v1';

  constructor(private http: HttpClient) {}

  getStudents(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/student`);
  }
}

