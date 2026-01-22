import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Course } from '../models/course.model';

interface ApiResponse {
  status: string;
  data: Course[];
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly apiUrl = `${environment.apiUrl || 'http://localhost:9191/api/v1'}/course`;

  constructor(private http: HttpClient) {}

  getCourses(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }

  addCourse(name: string, code: string): Observable<any> {
    return this.http.post(this.apiUrl, { name, code });
  }

  updateCourse(id: number, name: string, code: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { name, code });
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
