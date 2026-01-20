import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {StudentCourse} from '../models/student_course.model';

interface ApiResponse {
  status: string;
  data: StudentCourse[];
}

@Injectable({ providedIn: 'root' })
export class StudentCourseService {
  private apiUrl = environment.apiUrl || 'http://localhost:9191/api/v1';

  constructor(private http: HttpClient) {}

  getEnrollCourse(nimParam?: any): Observable<ApiResponse> {
    const nim = nimParam || sessionStorage.getItem('nim');
    return this.http.get<ApiResponse>(`${this.apiUrl}/student_course/enrolled/${nim}`);
  }

  deleteEnrollCourse(id: number){
    return this.http.delete(`${this.apiUrl}/student_course/${id}`);
  }
}
