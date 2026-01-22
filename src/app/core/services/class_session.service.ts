import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClassSession } from '../models/class_session.model';
import { ClassSessionForm } from '../models/class_session_form.model';

interface ApiResponse {
  status: string;
  data: ClassSession[];
}

@Injectable({ providedIn: 'root' })
export class ClassSessionService {
  private readonly apiUrl = `${environment.apiUrl || 'http://localhost:9191/api/v1'}`;

  constructor(private http: HttpClient) {}

  getActiveSession(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/class_session/today/active`);
  }

  getAllActiveSession(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/class_session/today/active/all`);
  }

  getClassSession(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/class_session`);
  }

  getClassSessionById(id: number): Observable<any> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/class_session/${id}`);
  }

  createClassSession(form: ClassSessionForm): Observable<any> {
    // Mapping manual untuk memastikan payload bersih
    const body = {
      courseId: form.courseId,
      startTime: form.startTime,
      endTime: form.endTime,
      latitude: form.latitude,
      longitude: form.longitude,
      lecturer: form.lecturer,
      place: form.place,
    };
    return this.http.post(`${this.apiUrl}/class_session`, body);
  }

  updateClassSession(form: ClassSessionForm): Observable<any> {
    const body = {
      startTime: form.startTime,
      endTime: form.endTime,
      latitude: form.latitude,
      longitude: form.longitude,
      lecturer: form.lecturer,
      place: form.place,
    };
    return this.http.put(`${this.apiUrl}/class_session/${form.id}`, body);
  }

  deleteClassSession(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/class_session/${id}`);
  }

  markAttendance(sessionId: number, lat: number, lng: number, qrToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/attendance/submit`, {
      sessionId,
      latitude: lat,
      longitude: lng,
      qrToken
    });
  }
}
