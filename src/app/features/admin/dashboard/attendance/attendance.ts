import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { SharedTableComponent } from '../../../../shared/table/table';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { AttendanceDetail } from '../../../../core/models/attendance.model';

@Component({
  selector: 'app-admin-attendance-detail',
  templateUrl: './attendance.html',
  styleUrls: [
    '../../../../../styles/shared/header.css',
    '../../../../shared/table/table.css',
    '../../../../../styles/shared/admin-pages.css'
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, SharedTableComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardAttendanceComponent implements OnInit {
  id!: number;
  attendanceUser: AttendanceDetail[] = [];
  loading = true;

  tableColumns = [
    { key: 'name', label: 'Nama Mahasiswa' },
    { key: 'nim', label: 'NIM' },
    { key: 'timestamp', label: 'Waktu Absen' },
    { key: 'valid', label: 'Status Validasi' },
  ];

  constructor(
    private attendanceService: AttendanceService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.id = Number(idParam);
      this.loadAttendance(this.id);
    } else {
      this.back();
    }
  }

  loadAttendance(id: number): void {
    this.loading = true;
    this.attendanceService.getUserAttendance(id)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.attendanceUser = res.data || [];
        },
        error: (err) => {
          console.error('Gagal memuat data kehadiran:', err);
        }
      });
  }

  back(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  downloadReport(): void {
    if (!this.id) return;

    // Optional: Tambahkan loading state khusus download jika perlu
    this.attendanceService.downloadReport(this.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Laporan_Absensi.xlsx`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download error:', err);
        alert('Gagal mengunduh laporan.');
      }
    });
  }
}
