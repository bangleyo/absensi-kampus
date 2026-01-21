import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {AttendanceDetail} from '../models/attendance.model';
import {Observable} from 'rxjs';

interface ApiResponse {
  status: string;
  data: AttendanceDetail[];
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private apiUrl = environment.apiUrl || 'http://localhost:9191/api/v1';

  constructor(private http: HttpClient) {}

  getUserAttendance(id: number) {
    return this.http.get<ApiResponse>(`${this.apiUrl}/attendance/${id}`);
  }

  downloadReport(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/attendance/download-excel/${id}`, { responseType: 'blob' });
  }
}
