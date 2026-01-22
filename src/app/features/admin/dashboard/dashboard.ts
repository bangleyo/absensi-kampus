import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Services & Models
import { ClassSessionService } from '../../../core/services/class_session.service';
import { ClassSession } from '../../../core/models/class_session.model';

@Component({
  selector: 'app-admin-dashboard', // Selector diperbaiki agar spesifik
  templateUrl: './dashboard.html',
  styleUrls: [
    '../../../../styles/shared/header.css',
    '../../../../styles/shared/course-card.css',
    '../../../../styles/shared/admin-pages.css'
  ],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  // --- Data Properties ---
  classSessions: ClassSession[] = [];
  loading: boolean = true;

  // --- UI State ---
  toastState = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  constructor(
    private classSessionService: ClassSessionService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadActiveSessions();
  }

  /**
   * Mengambil semua sesi kelas yang aktif.
   */
  private loadActiveSessions(): void {
    this.loading = true;

    this.classSessionService.getAllActiveSession().subscribe({
      next: (response) => {
        this.classSessions = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        // Menampilkan pesan error ke user
        const msg = err.error?.data?.message || err.error?.message || 'Gagal memuat data sesi.';
        this.showToast(msg, 'error');

        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Navigasi ke halaman detail kehadiran.
   */
  navigateToDetail(sessionId: number): void {
    this.router.navigate([`/admin/dashboard/attendance/${sessionId}`]);
  }

  // --- UI Helpers ---

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastState = { show: true, message, type };
    this.cdr.detectChanges(); // Force update UI agar toast muncul seketika

    setTimeout(() => {
      this.toastState.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
