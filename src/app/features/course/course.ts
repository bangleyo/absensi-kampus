import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {StudentCourse} from '../../core/models/student_course.model';
import {StudentCourseService} from '../../core/services/student_course.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-course',
  templateUrl: './course.html',
  styleUrls: [
    '../../../styles/shared/header.css',
    '../../../styles/shared/qr-modal.css',
    '../../../styles/shared/course-card.css',
    './course.css'
  ],
  standalone: true,
  imports: [CommonModule]
})
export class CourseComponent implements OnInit {
  // --- Data Properties ---
  studentCourses: StudentCourse[] = [];
  loading: boolean = true;

  constructor(
    private studentCourseService: StudentCourseService,
    private cdr: ChangeDetectorRef
  ) { }

  // --- Lifecycle Hooks ---

  ngOnInit(): void {
    this.loadActiveSessions();
  }

  /** Mengambil daftar sesi kelas yang sedang aktif */
  private loadActiveSessions(): void {
    this.loading = true;
    this.studentCourseService.getEnrollCourse().subscribe({
      next: (response) => {
        this.studentCourses = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load course:', err);
        this.loading = false;
      }
    });
  }
}
