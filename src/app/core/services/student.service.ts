import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly apiUrl = `${environment.apiUrl || 'http://localhost:9191/api/v1'}/student`;

  constructor(private http: HttpClient) {}

  getStudents(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createStudent(name: string, nim: string, major: string): Observable<any> {
    return this.http.post(this.apiUrl, { name, nim, major });
  }

  updateStudent(id: number, name: string, nim: string, major: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { name, nim, major });
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
