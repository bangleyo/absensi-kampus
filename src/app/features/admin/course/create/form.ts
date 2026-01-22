import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { CourseService } from '../../../../core/services/course.service';
import { Course } from '../../../../core/models/course.model';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-admin-course-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.html',
  styleUrls: [
    '../../../../../styles/shared/header.css',
    '../../../../../styles/shared/admin-pages.css'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCourseComponent implements OnInit {
  @ViewChild('nameCodeForm') nameCodeForm!: NgForm;

  formData: Course = { id: 0, name: '', code: '' };
  mode: Mode = 'create';
  isLoading = false;

  // 1. TAMBAHKAN STATE TOAST
  toastState = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
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
    this.cdr.detectChanges();

    this.courseService.addCourse(this.formData.name, this.formData.code)
      .pipe(finalize(() => {
        // Hapus finalize loading=false disini, kita handle manual agar tombol tetap disabled saat delay redirect
        // Kecuali error
      }))
      .subscribe({
        next: () => {
          // 2. SUKSES: Tampilkan Toast -> Delay -> Redirect
          this.showToast('Berhasil menambahkan matakuliah!', 'success');
          setTimeout(() => {
            this.router.navigate(['/admin/course']);
          }, 1500); // Delay 1.5 detik agar user sempat baca
        },
        error: (err) => {
          console.error('Gagal menambah course:', err);
          this.showToast('Gagal menambah data.', 'error');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private updateCourse(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.courseService.updateCourse(this.formData.id, this.formData.name, this.formData.code)
      .subscribe({
        next: () => {
          // 3. SUKSES UPDATE
          this.showToast('Berhasil memperbarui matakuliah!', 'success');
          setTimeout(() => {
            this.router.navigate(['/admin/course']);
          }, 1500);
        },
        error: (err) => {
          console.error('Gagal update course:', err);
          this.showToast('Gagal memperbarui data.', 'error');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  // 4. HELPER TOAST
  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastState = { show: true, message, type };
    this.cdr.detectChanges();

    // Auto hide toast setelah 3 detik (jika user tidak jadi redirect karena error)
    setTimeout(() => {
      this.toastState.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
