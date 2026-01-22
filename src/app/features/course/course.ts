import { ChangeDetectorRef, Component, HostBinding, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models & Services
import { StudentCourse } from '../../core/models/student_course.model';
import { StudentCourseService } from '../../core/services/student_course.service';
import { LayoutService } from '../../core/services/layout.service'; // Wajib untuk responsivitas layout

@Component({
  selector: 'app-course',
  templateUrl: './course.html',
  styleUrls: [
    '../../../styles/shared/header.css',
    '../../../styles/shared/course-card.css',
    '../../../styles/shared/student.pages.css',
  ],
  standalone: true,
  imports: [CommonModule]
})
export class CourseComponent implements OnInit {
  // --- Layout State ---
  // Signal untuk mendeteksi perubahan sidebar dari LayoutService
  isSidebarCollapsed: Signal<boolean>;

  // --- Data Properties ---
  studentCourses: StudentCourse[] = [];
  isLoading: boolean = true; // Renamed from 'loading' to standard 'isLoading'

  constructor(
    private studentCourseService: StudentCourseService,
    private layoutService: LayoutService,
    private cdr: ChangeDetectorRef
  ) {
    this.isSidebarCollapsed = this.layoutService.isSidebarCollapsed;
  }

  // --- Lifecycle Hooks ---

  ngOnInit(): void {
    this.fetchEnrolledCourses();
  }

  /**
   * Mengambil daftar matakuliah yang diambil mahasiswa.
   * Renamed: loadActiveSessions -> fetchEnrolledCourses (Lebih deskriptif)
   */
  private fetchEnrolledCourses(): void {
    this.isLoading = true;
    this.studentCourseService.getEnrollCourse().subscribe({
      next: (response) => {
        this.studentCourses = response.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load courses:', err);
        this.isLoading = false;
        // Opsional: Tambahkan logika toast error di sini
      }
    });
  }
}
