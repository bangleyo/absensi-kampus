import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

// Services & Models
import { ClassSessionService } from '../../../../core/services/class_session.service';
import { CourseService } from '../../../../core/services/course.service';
import { Course } from '../../../../core/models/course.model';
import { ClassSessionForm } from '../../../../core/models/class_session_form.model';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-admin-class-session-form', // Naming convention yang lebih baik
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.html',
  styleUrls: [
    '../../../../../styles/shared/header.css',     // Shared Header
    '../../../../../styles/shared/admin-pages.css' // Shared Styles (Gantikan form.css)
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
  isLoading: boolean = false; // Fix: Default false, true saat action

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

  // --- LOCATION LOGIC ---

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
        // Optional: Toast success here
      },
      () => {
        alert('Gagal mengambil lokasi. Pastikan izin lokasi (GPS) aktif.');
      },
      { enableHighAccuracy: true }
    );
  }

  // --- DATA LOADING ---

  private loadDataCourses(): void {
    this.courseService.getCourses().subscribe(res => {
      this.courses = res.data;
      this.cdr.detectChanges();
    });
  }

  private loadParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.isLoading = true; // Show loading state while fetching data
        this.classSessionService.getClassSessionById(params['id'])
          .pipe(finalize(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }))
          .subscribe({
            next: (res) => {
              if (res.status === 'success') {
                this.mode = 'edit';
                // Spread object untuk memastikan mapping data benar
                this.formData = { ...this.formData, ...res.data };

                // PENTING: ID Course dari response biasanya object, form butuh ID
                if (res.data.course) {
                  this.formData.courseId = res.data.course.id;
                }

                // Formatting DateTime string agar cocok dengan <input type="datetime-local">
                // Format yang diterima: "YYYY-MM-DDTHH:mm"
                if (this.formData.startTime) this.formData.startTime = this.formatDateForInput(this.formData.startTime);
                if (this.formData.endTime) this.formData.endTime = this.formatDateForInput(this.formData.endTime);
              }
            },
            error: (err) => console.error(err)
          });
      }
    });
  }

  /**
   * Helper untuk konversi format tanggal dari API ke Input HTML
   */
  private formatDateForInput(dateStr: string): string {
    // Jika format dari API sudah ISO string (2024-02-20T10:00:00), ambil 16 karakter pertama
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().slice(0, 16);
  }

  // --- FORM ACTIONS ---

  onNameCodeSubmit(form: NgForm): void {
    if (form.invalid || !this.formData.latitude) return;
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

  // --- API CALLS ---

  private addClassSession(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.classSessionService.createClassSession(this.formData)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => this.back(),
        error: () => alert('Terjadi kesalahan saat menyimpan data.')
      });
  }

  private updateClassSession(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.classSessionService.updateClassSession(this.formData)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => this.back(),
        error: () => alert('Terjadi kesalahan saat memperbarui data.')
      });
  }
}
