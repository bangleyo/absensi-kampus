import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

// Components & Services
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
  // Data Table
  courses: Course[] = [];
  loading = true;
  tableColumns = [
    { key: 'name', label: 'Nama Matakuliah' },
    { key: 'code', label: 'Kode' }
  ];

  // Delete State
  showDeleteModal = false;
  selectedCourse: Course | null = null;
  deleteLoading = false;

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
          // Optional: Show toast error here
        }
      });
  }

  // --- ACTIONS ---

  createCourse(): void {
    this.router.navigate(['/admin/course/form']);
  }

  editCourse(course: Course): void {
    this.router.navigate(['/admin/course/form'], {
      queryParams: {
        id: course.id,
        name: course.name,
        code: course.code
      }
    });
  }

  // --- DELETE LOGIC ---

  deleteCourse(course: Course): void {
    this.selectedCourse = course;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedCourse) return;

    this.deleteLoading = true;
    this.cdr.detectChanges(); // Update UI button text to "Menghapus..."

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
          // Refresh data setelah sukses hapus
          this.loadCourses();
        },
        error: (err) => {
          console.error('Delete failed', err);
          alert('Gagal menghapus data. Silakan coba lagi.'); // Simple fallback alert
        }
      });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedCourse = null;
  }
}
