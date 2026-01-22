import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

// Components & Services
import { SharedTableComponent } from '../../../shared/table/table';
import { ClassSessionService } from '../../../core/services/class_session.service';
import { ClassSession } from '../../../core/models/class_session.model';
import { QRService } from '../../../core/services/qr.service';

@Component({
  selector: 'app-class-session',
  templateUrl: './classsession.html',
  styleUrls: [
    '../../../../styles/shared/header.css',
    '../../../shared/table/table.css',
    '../../../../styles/shared/admin-pages.css'
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, SharedTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClassSessionComponent implements OnInit {
  // Data State
  classSessions: ClassSession[] = [];
  loading = true;

  // Table Configuration
  tableColumns = [
    { key: 'course.name', label: 'Matkul' },
    { key: 'course.code', label: 'Kode' },
    { key: 'lecturer', label: 'Dosen' },
    { key: 'place', label: 'Ruangan' },
    { key: 'timeRange', label: 'Waktu' }
  ];

  // Delete Modal State
  showDeleteModal = false;
  selectedClassSession: ClassSession | null = null;
  deleteLoading = false;

  // 1. TAMBAHKAN STATE TOAST
  toastState = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  constructor(
    private classSessionService: ClassSessionService,
    private qrService: QRService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadClassSessions();
  }

  loadClassSessions(): void {
    this.loading = true;
    this.classSessionService.getClassSession()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.classSessions = res.data || [];
        },
        error: (err) => {
          console.error('Gagal memuat sesi kelas:', err);
          this.showToast('Gagal memuat data.', 'error');
        }
      });
  }

  // --- ACTIONS ---

  createClassSession(): void {
    this.router.navigate(['/admin/class-session/form']);
  }

  editClassSession(session: any): void {
    this.router.navigate(['/admin/class-session/form'], {
      queryParams: { id: session.id }
    });
  }

  downloadQR(item: any): void {
    if (!item.qrToken) {
      this.showToast('QR Token tidak tersedia.', 'error');
      return;
    }

    this.qrService.downloadQr(item.qrToken).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeName = (item.course?.name || 'Session').replace(/[^a-z0-9]/gi, '_');
        link.download = `QR_${safeName}_${item.course?.code || ''}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download gagal:', err);
        this.showToast('Gagal mengunduh QR Code.', 'error');
      }
    });
  }

  // --- DELETE LOGIC ---

  deleteClassSession(session: any): void {
    this.selectedClassSession = session;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedClassSession) return;

    this.deleteLoading = true;
    this.cdr.detectChanges();

    this.classSessionService.deleteClassSession(this.selectedClassSession.id)
      .pipe(
        finalize(() => {
          this.deleteLoading = false;
          this.closeDeleteModal();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          // 2. TAMPILKAN TOAST SUKSES
          this.showToast('Sesi kelas berhasil dihapus!', 'success');
          this.loadClassSessions();
        },
        error: (err) => {
          console.error('Delete error:', err);
          // 3. TAMPILKAN TOAST ERROR
          this.showToast('Gagal menghapus sesi kelas.', 'error');
        }
      });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedClassSession = null;
  }

  // 4. HELPER FUNCTION TOAST
  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastState = { show: true, message, type };
    this.cdr.detectChanges();

    setTimeout(() => {
      this.toastState.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
