import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Course} from '../models/course.model';

interface ApiResponse {
  status: string;
  data: Course[];
}
@Injectable({ providedIn: 'root' })
export class CourseService {
  private apiUrl = environment.apiUrl || 'http://localhost:9191/api/v1';

  constructor(private http: HttpClient) {}

  getCourses(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/course`);
  }

  addCourse(name: string, code: string): Observable<any> {
    const body = {
      name: name,
      code: code,
    }
    return this.http.post(`${this.apiUrl}/course`, body);
  }

  updateCourse(id: number, name: string, code: string): Observable<any> {
    const params = new HttpParams().set('id', id);
    const body = {
      name: name,
      code: code,
    }
    return this.http.put(`${this.apiUrl}/course`, body, {params});
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/course/${id}`);
  }
}
