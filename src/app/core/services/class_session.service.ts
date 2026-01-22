import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {ClassSession} from '../models/class_session.model';
import {ClassSessionForm} from '../models/class_session_form.model';

interface ApiResponse {
  status: string;
  data: ClassSession[];
}

@Injectable({ providedIn: 'root' })
export class ClassSessionService {
  private apiUrl = environment.apiUrl || 'http://localhost:9191/api/v1';

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

  createClassSession(classSessionForm: ClassSessionForm): Observable<any> {
    const body = {
      'courseId': classSessionForm.courseId,
      'startTime': classSessionForm.startTime,
      'endTime': classSessionForm.endTime,
      'latitude': classSessionForm.latitude,
      'longitude': classSessionForm.longitude,
      'lecturer': classSessionForm.lecturer,
      'place': classSessionForm.place,
    }
    return this.http.post<ApiResponse>(`${this.apiUrl}/class_session`, body);
  }

  updateClassSession(classSessionForm: ClassSessionForm): Observable<any> {
    const body = {
      'startTime': classSessionForm.startTime,
      'endTime': classSessionForm.endTime,
      'latitude': classSessionForm.latitude,
      'longitude': classSessionForm.longitude,
      'lecturer': classSessionForm.lecturer,
      'place': classSessionForm.place,
    }
    return this.http.put<ApiResponse>(`${this.apiUrl}/class_session/${classSessionForm.id}`, body);
  }

  markAttendance(sessionId: number, lat: number, lng: number, qrCode: string): Observable<any> {
    const body = {
      sessionId: sessionId,
      latitude: lat,
      longitude: lng,
      qrToken: qrCode
    };
    return this.http.post(`${this.apiUrl}/attendance/submit`, body);
  }

  deleteClassSession(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/attendance/${id}`);
  }
}
