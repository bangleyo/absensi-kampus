import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QRService {
  private apiUrl = environment.apiUrl || 'http://localhost:9191/api/v1';

  constructor(private http: HttpClient) {}

  downloadQr(kode: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/qr/download/${kode}`, { responseType: 'blob' });
  }
}

