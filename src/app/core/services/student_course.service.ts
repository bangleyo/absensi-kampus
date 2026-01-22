import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { StudentCourse } from '../models/student_course.model';
import { AuthService } from './auth.service';

interface ApiResponse {
  status: string;
  data: StudentCourse[];
}

@Injectable({ providedIn: 'root' })
export class StudentCourseService {
  private readonly apiUrl = `${environment.apiUrl || 'http://localhost:9191/api/v1'}/student_course`;

  constructor(
    private http: HttpClient,
    private authService: AuthService // Inject AuthService
  ) {}

  getEnrollCourse(nimParam?: string): Observable<ApiResponse> {
    // Ambil NIM dari parameter ATAU dari user yang sedang login
    const nim = nimParam || this.authService.getUser()?.nim;

    if (!nim) {
      console.warn('NIM tidak ditemukan pada session user.');
    }

    return this.http.get<ApiResponse>(`${this.apiUrl}/enrolled/${nim}`);
  }

  enrollCourse(nim: string, courseId: number): Observable<any> {
    return this.http.post(this.apiUrl, { nim, courseId });
  }

  deleteEnrollCourse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
