import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import jsQR from 'jsqr';

import { ClassSessionService } from '../../core/services/class_session.service';
import { ClassSession } from '../../core/models/class_session.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: [
    '../../../styles/shared/header.css',
    '../../../styles/shared/qr-modal.css',
    '../../../styles/shared/course-card.css',
    './dashboard.css'
  ],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit, OnDestroy {
  // --- Data Properties ---
  classSessions: ClassSession[] = [];
  loading: boolean = true;

  // --- UI & State Properties ---
  showQrModals: boolean = false;
  selectedsessionId?: number;
  popUpMsg?: string;

  // --- Scanner & Hardware References ---
  @ViewChild('qrVideo') qrVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('qrCanvas') qrCanvasRef!: ElementRef<HTMLCanvasElement>;

  private scannerInterval: any;
  private qrStatusEl?: HTMLElement;

  constructor(
    private classSessionService: ClassSessionService,
    private cdr: ChangeDetectorRef
  ) { }

  // --- Lifecycle Hooks ---

  ngOnInit(): void {
    this.loadActiveSessions();
  }

  ngOnDestroy(): void {
    this.stopResources();
  }

  /** Mengambil daftar sesi kelas yang sedang aktif */
  private loadActiveSessions(): void {
    this.loading = true;
    this.classSessionService.getActiveSession().subscribe({
      next: (response) => {
        this.classSessions = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load sessions:', err);
        this.loading = false;
      }
    });
  }

  // --- QR Scanner Modal Logic ---

  /** Membuka modal dan menginisialisasi kamera */
  showQrModal(courseId: number): void {
    this.selectedsessionId = courseId;
    this.showQrModals = true;

    // Memberi waktu DOM untuk merender elemen video sebelum diakses
    setTimeout(() => this.startQrScan(), 300);
  }

  /** Menutup modal dan mematikan semua resource hardware */
  closeQrModal(): void {
    this.showQrModals = false;
    this.selectedsessionId = undefined;
    this.stopResources();
  }

  /** Menghentikan interval scanner dan aliran kamera */
  private stopResources(): void {
    if (this.scannerInterval) {
      clearInterval(this.scannerInterval);
    }

    const videoEl = this.qrVideoRef?.nativeElement;
    if (videoEl?.srcObject) {
      const stream = videoEl.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoEl.srcObject = null;
    }
  }

  // --- Scanner Core Engine ---

  /** Inisialisasi MediaDevices untuk scan QR */
  private startQrScan(): void {
    const videoEl = this.qrVideoRef?.nativeElement;
    this.qrStatusEl = document.getElementById('qrStatus')!;

    if (!videoEl) return;

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
    }).then(stream => {
      videoEl.srcObject = stream;
      videoEl.play().then(() => {
        this.qrStatusEl!.textContent = '✅ Kamera Siap';
        this.scannerInterval = setInterval(() => this.executeFrameScan(), 300);
      });
    }).catch(err => {
      this.qrStatusEl!.textContent = `❌ Kamera Error: ${err.name}`;
    });
  }

  /** Memproses frame video untuk mencari kode QR */
  private executeFrameScan(): void {
    const video = this.qrVideoRef?.nativeElement;
    const canvas = this.qrCanvasRef?.nativeElement;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
      this.processAttendanceSubmission(code.data);
    }
  }

  // --- Attendance Business Logic ---

  /** Sinkronisasi lokasi GPS dan kirim data ke API */
  private async processAttendanceSubmission(qrData: string): Promise<void> {
    clearInterval(this.scannerInterval);

    let isSuccess = true;
    let feedbackMsg = '';

    try {
      const location = await this.getCurrentLocation();

      this.classSessionService.markAttendance(
        this.selectedsessionId!,
        location.lat,
        location.lng,
        qrData
      ).pipe(
        finalize(() => {
          this.closeQrModal();
          this.displayToastNotification(isSuccess, feedbackMsg);
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: () => feedbackMsg = 'Absensi berhasil dicatat!',
        error: () => {
          isSuccess = false;
          feedbackMsg = 'Gagal mengirim data absensi.';
        }
      });

    } catch (err) {
      this.displayToastNotification(false, 'Gagal mendeteksi lokasi (GPS).');
      this.closeQrModal();
      this.cdr.detectChanges();
    }
  }

  /** Helper untuk mendapatkan koordinat GPS */
  private getCurrentLocation(): Promise<{lat: number, lng: number, accuracy: number}> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject('GPS Not Supported');

      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  // --- UI Notification Helper ---

  /** Menampilkan toast notification sesuai status (Success/Failed) */
  private displayToastNotification(success: boolean, msg: string): void {
    this.popUpMsg = msg;
    const targetId = success ? 'successPopup' : 'failedPopup';
    const element = document.getElementById(targetId);

    element?.classList.add('show');
    setTimeout(() => element?.classList.remove('show'), 3000);
  }
}
