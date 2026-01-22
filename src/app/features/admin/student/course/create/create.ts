import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../../../core/services/course.service';
import { StudentCourseService } from '../../../../../core/services/student_course.service';
import { Course } from '../../../../../core/models/course.model';

@Component({
  selector: 'app-admin-student-course-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create.html',
  styleUrls: [
    '../../../../../../styles/shared/header.css',
    '../../../../../../styles/shared/admin-pages.css'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateStudentCourseComponent implements OnInit {
  @ViewChild('enrollForm') enrollForm!: NgForm;

  courses: Course[] = [];
  selectedCourseId: number | null = null;
  isLoading = false;

  nim: string = '';
  name: string = '';

  toastState = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private courseService: CourseService,
    private studentCourseService: StudentCourseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['nim']) {
        this.nim = params['nim'];
        this.name = params['name'];
        this.cdr.detectChanges();
      } else {
        this.router.navigate(['/admin/student']);
      }
    });

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

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.selectedCourseId) return;
    this.addCourse();
  }

  private addCourse(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.studentCourseService.enrollCourse(this.nim, this.selectedCourseId!)
      .subscribe({
        next: () => {
          this.showToast('Berhasil menambahkan matakuliah!', 'success');
          setTimeout(() => {
            this.back();
          }, 1500);
        },
        error: (err) => {
          console.error('Gagal enroll course:', err);
          this.showToast('Gagal menambahkan matakuliah. Mungkin sudah diambil?', 'error');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  back(): void {
    this.router.navigate(['/admin/student/course'], {
      queryParams: {
        nim: this.nim,
        name: this.name
      }
    });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastState = { show: true, message, type };
    this.cdr.detectChanges();

    setTimeout(() => {
      this.toastState.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
