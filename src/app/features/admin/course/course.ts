import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { SharedTableComponent } from '../../../shared/table/table';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-admin-course',
  templateUrl: './course.html',
  styleUrls: [
    '../../../../styles/shared/header.css',
    '../../../shared/table/table.css',
    '../../../../styles/shared/admin-pages.css'
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, SharedTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCourseComponent implements OnInit {
  courses: Course[] = [];
  loading = true;
  tableColumns = [
    { key: 'name', label: 'Nama Matakuliah' },
    { key: 'code', label: 'Kode' }
  ];

  showDeleteModal = false;
  selectedCourse: Course | null = null;
  deleteLoading = false;

  // 1. TAMBAHKAN STATE TOAST DISINI
  toastState = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  constructor(
    private courseService: CourseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService.getCourses()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.courses = res.data || [];
        },
        error: (err) => {
          console.error('Failed to load courses', err);
          this.showToast('Gagal memuat data course.', 'error');
        }
      });
  }

  createCourse(): void {
    this.router.navigate(['/admin/course/form']);
  }

  editCourse(course: Course): void {
    this.router.navigate(['/admin/course/form'], {
      queryParams: { id: course.id, name: course.name, code: course.code }
    });
  }

  deleteCourse(course: Course): void {
    this.selectedCourse = course;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedCourse) return;

    this.deleteLoading = true;
    this.cdr.detectChanges();

    this.courseService.deleteCourse(this.selectedCourse.id)
      .pipe(
        finalize(() => {
          this.deleteLoading = false;
          this.closeDeleteModal();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          // 2. PANGGIL TOAST SUKSES
          this.showToast('Matakuliah berhasil dihapus!', 'success');
          this.loadCourses();
        },
        error: (err) => {
          console.error('Delete failed', err);
          // 3. PANGGIL TOAST ERROR
          this.showToast('Gagal menghapus data. Silakan coba lagi.', 'error');
        }
      });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedCourse = null;
  }

  // 4. HELPER FUNCTION UNTUK MENAMPILKAN TOAST
  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastState = { show: true, message, type };
    this.cdr.detectChanges(); // Force update UI agar muncul

    setTimeout(() => {
      this.toastState.show = false;
      this.cdr.detectChanges(); // Force update UI agar hilang
    }, 3000);
  }
}
