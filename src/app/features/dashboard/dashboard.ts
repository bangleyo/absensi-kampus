import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
  isLoading = true;

  // --- UI State ---
  showQrModal = false;
  selectedSessionId?: number;
  scannerStatusText = 'Memulai scanner...';

  toastState = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  // --- Hardware References ---
  @ViewChild('qrVideo') qrVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('qrCanvas') qrCanvasRef!: ElementRef<HTMLCanvasElement>;

  private scannerInterval: any;

  constructor(
    private classSessionService: ClassSessionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchActiveSessions();
  }

  ngOnDestroy(): void {
    this.stopScannerResources();
  }

  private fetchActiveSessions(): void {
    this.isLoading = true;
    this.classSessionService.getActiveSession().subscribe({
      next: (response) => {
        this.classSessions = response.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching sessions:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- QR Scanner Logic ---

  openScanner(courseId: number): void {
    this.selectedSessionId = courseId;
    this.showQrModal = true;
    setTimeout(() => this.initializeCamera(), 300);
  }

  closeScanner(): void {
    this.showQrModal = false;
    this.selectedSessionId = undefined;
    this.stopScannerResources();
    this.cdr.detectChanges(); // Pastikan modal tertutup secara visual
  }

  private stopScannerResources(): void {
    if (this.scannerInterval) clearInterval(this.scannerInterval);

    const videoEl = this.qrVideoRef?.nativeElement;
    if (videoEl?.srcObject) {
      const stream = videoEl.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoEl.srcObject = null;
    }
  }

  private async initializeCamera(): Promise<void> {
    const videoEl = this.qrVideoRef?.nativeElement;
    if (!videoEl) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });

      videoEl.srcObject = stream;
      await videoEl.play();

      this.scannerStatusText = '✅ Kamera Siap';
      this.scannerInterval = setInterval(() => this.scanFrame(), 300);

    } catch (err: any) {
      this.scannerStatusText = `❌ Kamera Error: ${err.name}`;
      console.error(err);
    }
  }

  private scanFrame(): void {
    const video = this.qrVideoRef?.nativeElement;
    const canvas = this.qrCanvasRef?.nativeElement;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    const code = jsQR(imageData.data, width, height, { inversionAttempts: 'dontInvert' });

    if (code?.data) {
      this.submitAttendance(code.data);
    }
  }

  // --- Attendance Logic ---

  private async submitAttendance(qrToken: string): Promise<void> {
    clearInterval(this.scannerInterval);
    this.scannerStatusText = '⏳ Mengirim data...';

    try {
      const { lat, lng } = await this.getCurrentLocation();

      this.classSessionService.markAttendance(this.selectedSessionId!, lat, lng, qrToken)
        .pipe(finalize(() => {
          this.closeScanner();
        }))
        .subscribe({
          next: () => {
            this.showToast('Absensi berhasil dicatat!', 'success');
            this.fetchActiveSessions();
          },
          // PERBAIKAN DISINI
          error: (err) => {
            console.error('Attendance Error:', err);
            // Ambil pesan error dari backend jika ada, atau gunakan default
            const msg = err.error?.data.message || 'Gagal mengirim data absensi (Server Error).';
            this.showToast(msg, 'error');
          }
        });

    } catch (err) {
      this.showToast('Gagal mendeteksi lokasi (GPS).', 'error');
      this.closeScanner();
    }
  }

  private getCurrentLocation(): Promise<{lat: number, lng: number}> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('GPS Not Supported'));

      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  // --- UI Helpers ---

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastState = { show: true, message, type };

    // PERBAIKAN UTAMA: Paksa update UI segera saat toast muncul
    this.cdr.detectChanges();

    setTimeout(() => {
      this.toastState.show = false;
      this.cdr.detectChanges(); // Update UI lagi saat toast hilang
    }, 3000);
  }
}
