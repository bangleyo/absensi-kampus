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

  constructor(
    private classSessionService: ClassSessionService,
    private qrService: QRService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadClassSessions();
  }

  /**
   * Load data sesi kelas dari API
   */
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

  /**
   * Download QR Code sebagai file PNG
   */
  downloadQR(item: any): void {
    if (!item.qrToken) {
      alert('QR Token tidak tersedia.');
      return;
    }

    this.qrService.downloadQr(item.qrToken).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // Nama file: QR_Code_[NamaMatkul]_[Kode].png
        const safeName = (item.course?.name || 'Session').replace(/[^a-z0-9]/gi, '_');
        link.download = `QR_${safeName}_${item.course?.code || ''}.png`;

        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download gagal:', err);
        alert('Gagal mengunduh QR Code.');
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

    // Asumsi service memiliki method delete (sesuaikan jika namanya berbeda)
    // Jika belum ada di service, Anda perlu menambahkannya: deleteClassSession(id)
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
          // Reload data setelah sukses hapus
          this.loadClassSessions();
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert('Gagal menghapus sesi kelas.');
        }
      });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedClassSession = null;
  }
}
