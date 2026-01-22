import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ClassSessionService } from '../../../../core/services/class_session.service';
import { CourseService } from '../../../../core/services/course.service';
import { Course } from '../../../../core/models/course.model';
import { ClassSessionForm } from '../../../../core/models/class_session_form.model';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-admin-class-session-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.html',
  styleUrls: [
    '../../../../../styles/shared/header.css',
    '../../../../../styles/shared/admin-pages.css'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateClassSessionComponent implements OnInit {
  @ViewChild('sessionForm') sessionForm!: NgForm;

  formData: ClassSessionForm = {
    id: 0,
    courseId: null as any,
    lecturer: '',
    place: '',
    duration: '',
    startTime: '',
    endTime: '',
    latitude: null as any,
    longitude: null as any,
    isExpired: false,
  };

  courses: Course[] = [];
  mode: Mode = 'create';
  isLoading: boolean = false;

  // 1. TAMBAHKAN STATE TOAST
  toastState = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private classSessionService: ClassSessionService,
    private courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadDataCourses();
    this.loadParams();
  }

  // ... (getCurrentLocation, loadDataCourses, loadParams, formatDateForInput TETAP SAMA) ...
  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung fitur lokasi.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.formData.latitude = pos.coords.latitude;
        this.formData.longitude = pos.coords.longitude;
        this.cdr.detectChanges();
        this.showToast('Lokasi berhasil diambil!', 'success'); // Optional feedback
      },
      () => {
        this.showToast('Gagal mengambil lokasi. Aktifkan GPS.', 'error');
      },
      { enableHighAccuracy: true }
    );
  }

  private loadDataCourses(): void {
    this.courseService.getCourses().subscribe(res => {
      this.courses = res.data;
      this.cdr.detectChanges();
    });
  }

  private loadParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.isLoading = true;
        this.classSessionService.getClassSessionById(params['id'])
          .pipe(finalize(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }))
          .subscribe({
            next: (res) => {
              if (res.status === 'success') {
                this.mode = 'edit';
                this.formData = { ...this.formData, ...res.data };
                if (res.data.course) {
                  this.formData.courseId = res.data.course.id;
                }
                if (this.formData.startTime) this.formData.startTime = this.formatDateForInput(this.formData.startTime);
                if (this.formData.endTime) this.formData.endTime = this.formatDateForInput(this.formData.endTime);
              }
            },
            error: (err) => console.error(err)
          });
      }
    });
  }

  private formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().slice(0, 16);
  }

  // --- FORM ACTIONS ---

  onNameCodeSubmit(form: NgForm): void {
    if (form.invalid || !this.formData.latitude) {
      if (!this.formData.latitude) this.showToast('Lokasi wajib diambil!', 'error');
      return;
    }
    this.mode === 'create' ? this.addClassSession() : this.updateClassSession();
  }

  resetForm(): void {
    this.sessionForm.resetForm();
    this.formData = {
      id: 0, courseId: null as any, lecturer: '', place: '', duration: '',
      startTime: '', endTime: '', latitude: null as any, longitude: null as any, isExpired: false
    };
    this.mode = 'create';
    this.cdr.detectChanges();
  }

  back(): void {
    this.router.navigate(['/admin/class-session']);
  }

  // --- API CALLS DENGAN TOAST & DELAY ---

  private addClassSession(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.classSessionService.createClassSession(this.formData)
      .subscribe({
        next: () => {
          // Sukses: Toast -> Delay -> Redirect
          this.showToast('Berhasil membuat sesi kelas!', 'success');
          setTimeout(() => {
            this.back();
          }, 1500);
        },
        error: () => {
          this.showToast('Terjadi kesalahan saat menyimpan data.', 'error');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private updateClassSession(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.classSessionService.updateClassSession(this.formData)
      .subscribe({
        next: () => {
          // Sukses: Toast -> Delay -> Redirect
          this.showToast('Data sesi kelas diperbarui!', 'success');
          setTimeout(() => {
            this.back();
          }, 1500);
        },
        error: () => {
          this.showToast('Terjadi kesalahan saat memperbarui data.', 'error');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  // 4. HELPER TOAST
  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastState = { show: true, message, type };
    this.cdr.detectChanges();

    setTimeout(() => {
      this.toastState.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
