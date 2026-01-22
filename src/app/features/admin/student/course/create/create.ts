import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

// Services & Models
import { CourseService } from '../../../../../core/services/course.service';
import { StudentCourseService } from '../../../../../core/services/student_course.service';
import { Course } from '../../../../../core/models/course.model';

@Component({
  selector: 'app-admin-student-course-create', // Selector diperbaiki
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create.html',
  styleUrls: [
    '../../../../../../styles/shared/header.css',      // Shared Header
    '../../../../../../styles/shared/admin-pages.css'  // Shared Admin Form Styles
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateStudentCourseComponent implements OnInit {
  @ViewChild('enrollForm') enrollForm!: NgForm;

  // Data State
  courses: Course[] = [];
  selectedCourseId: number | null = null;
  isLoading = false;

  // Student Context
  nim: string = '';
  name: string = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private courseService: CourseService,
    private studentCourseService: StudentCourseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 1. Ambil konteks mahasiswa (NIM & Nama)
    this.route.queryParams.subscribe(params => {
      if (params['nim']) {
        this.nim = params['nim'];
        this.name = params['name'];
        this.cdr.detectChanges();
      } else {
        // Jika akses langsung tanpa param, kembalikan ke list student
        this.router.navigate(['/admin/student']);
      }
    });

    // 2. Load daftar semua matakuliah
    this.loadCourses();
  }

  private loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.courses = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Gagal memuat matakuliah:', err)
    });
  }

  // --- ACTIONS ---

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.selectedCourseId) return;
    this.addCourse();
  }

  private addCourse(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.studentCourseService.enrollCourse(this.nim, this.selectedCourseId!)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.back(); // Sukses -> Kembali ke list matkul mahasiswa
        },
        error: (err) => {
          console.error('Gagal enroll course:', err);
          alert('Gagal menambahkan matakuliah. Mungkin sudah diambil?');
        }
      });
  }

  back(): void {
    // Kembali ke halaman detail matakuliah mahasiswa tersebut
    this.router.navigate(['/admin/student/course'], {
      queryParams: {
        nim: this.nim,
        name: this.name
      }
    });
  }
}
