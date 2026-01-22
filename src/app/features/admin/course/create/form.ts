import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

// Services & Models
import { CourseService } from '../../../../core/services/course.service';
import { Course } from '../../../../core/models/course.model';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-admin-course-form', // Selector lebih spesifik
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.html',
  styleUrls: [
    '../../../../../styles/shared/header.css',     // Shared Header
    '../../../../../styles/shared/admin-pages.css' // Shared Form Styles (Pengganti form.css)
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCourseComponent implements OnInit {
  @ViewChild('nameCodeForm') nameCodeForm!: NgForm;

  formData: Course = { id: 0, name: '', code: '' };
  mode: Mode = 'create';
  isLoading = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check Query Params untuk Mode Edit
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.mode = 'edit';
        this.formData = {
          id: Number(params['id']),
          name: params['name'] || '',
          code: params['code'] || ''
        };
        this.cdr.detectChanges();
      }
    });
  }

  // --- ACTIONS ---

  onNameCodeSubmit(form: NgForm): void {
    if (form.invalid) return;
    this.mode === 'create' ? this.addCourse() : this.updateCourse();
  }

  resetForm(): void {
    this.nameCodeForm.resetForm();
    this.formData = { id: 0, name: '', code: '' };
    this.mode = 'create';
    this.cdr.detectChanges();
  }

  back(): void {
    this.router.navigate(['/admin/course']);
  }

  // --- API CALLS ---

  private addCourse(): void {
    this.isLoading = true;
    this.cdr.detectChanges(); // Update UI disable button

    this.courseService.addCourse(this.formData.name, this.formData.code)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          // Redirect setelah sukses
          this.router.navigate(['/admin/course']);
        },
        error: (err) => {
          console.error('Gagal menambah course:', err);
          alert('Gagal menambah data. Silakan coba lagi.'); // Bisa diganti Toast
        }
      });
  }

  private updateCourse(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.courseService.updateCourse(this.formData.id, this.formData.name, this.formData.code)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/course']);
        },
        error: (err) => {
          console.error('Gagal update course:', err);
          alert('Gagal memperbarui data.');
        }
      });
  }
}
